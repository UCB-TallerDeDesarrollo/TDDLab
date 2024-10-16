from typing import List
import requests
import lizard
import zipfile
import tempfile
import os
import logging
import re
from urllib.parse import urlparse
from ..domain.CommitMetricsRepository import CommitMetricsRepository
from ..domain.CommitMetrics import CommitMetrics
def parse_repo_url(repo_url):
    """
    Parse the GitHub repo URL to extract the base repo URL and the ref (branch or commit).
    Returns a tuple (base_repo_url, ref).
    """
    parsed_url = urlparse(repo_url)
    path_parts = parsed_url.path.strip('/').split('/')
 
    if len(path_parts) < 2:
        raise ValueError("URL del repositorio inválida.")
 
    username = path_parts[0]
    repo = path_parts[1]

    if repo.endswith('.git'):
        repo = repo[:-4]


    base_repo_url = f"https://github.com/{username}/{repo}"
 
    ref = None
    if len(path_parts) > 3 and path_parts[2] == 'commit':
        ref = path_parts[3]
    elif len(path_parts) > 3 and path_parts[2] == 'tree':
        ref = path_parts[3]
 
    return base_repo_url, ref
 
def is_commit(ref):
    """
    Determine if the ref is a commit hash.
    """
    return bool(re.fullmatch(r'[0-9a-fA-F]{40}', ref))
 
class GetCcnByCommitUseCase:
    def __init__(self, repository: CommitMetricsRepository):
        self.repository = repository
    def analyze_commit(self, repo_url)-> List[CommitMetrics]:
        download_urls = self._build_download_url(repo_url)
        for url in download_urls:
            logging.debug(f"Intentando descargar el repositorio desde: {url}")
            response = requests.get(url)
            if response.status_code != 200:
                raise Exception(f"Error al descargar el repositorio desde: {url}")

        # Analizar el archivo ZIP
        with tempfile.TemporaryDirectory() as tmpdirname:
            zip_path = os.path.join(tmpdirname, 'repo.zip')
            with open(zip_path, 'wb') as zip_file:
                zip_file.write(response.content)

            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(tmpdirname)

            extracted_dir = self._get_extracted_dir(tmpdirname)
            return self._analyze_files_in_dir(extracted_dir)
    
    def _build_download_url(self, repo_url: str) -> str:
        base_repo_url, ref = parse_repo_url(repo_url)
        logging.debug(f"Base repo URL: {base_repo_url}")
        logging.debug(f"Ref: {ref}")
        download_urls = []
        if ref:
            if is_commit(ref):
                download_url = f"{base_repo_url}/archive/{ref}.zip"
                download_urls.append(download_url)
                logging.debug(f"URL de descarga para commit: {download_url}")
            else:
                download_url = f"{base_repo_url}/archive/refs/heads/{ref}.zip"
                download_urls.append(download_url)
                logging.debug(f"URL de descarga para rama: {download_url}")
        else:
            download_urls = [
                f"{base_repo_url}/archive/refs/heads/main.zip",
                f"{base_repo_url}/archive/refs/heads/master.zip"
            ]
            logging.debug("No se especificó ref, intentando con main y master.")
        return download_urls
    def _get_extracted_dir(self, tmpdirname: str) -> str:
        # Encuentra el directorio extraído
        extracted_dirs = [d for d in os.listdir(tmpdirname) if os.path.isdir(os.path.join(tmpdirname, d))]
        if not extracted_dirs:
            raise Exception("No se encontraron directorios compatibles después de extraer el ZIP.")
        return os.path.join(tmpdirname, extracted_dirs[0])

    def _analyze_files_in_dir(self, extracted_dir: str) -> List[CommitMetrics]:
        # Analizar los archivos con lizard
        extensions = ['.cs', '.java', '.js', '.ts', '.py']
        results = []

        for root, _, files in os.walk(extracted_dir):
            for file in files:
                if any(file.endswith(ext) for ext in extensions):
                    file_path = os.path.join(root, file)
                    analysis = lizard.analyze_file(file_path)

                    for func in analysis.function_list:
                        results.append(CommitMetrics(
                            cyclomatic_complexity=func.cyclomatic_complexity,
                            file=file_path,
                            function_name=func.name,
                            nloc=func.nloc,
                            token_count=func.token_count
                        ))
        return results

    # def run(self) -> List['CommitMetrics']:
    #     return self.repository.get_ccn_by_commit()
