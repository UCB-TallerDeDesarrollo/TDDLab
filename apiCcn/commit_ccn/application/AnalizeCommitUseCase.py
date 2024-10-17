from typing import List
import requests
import lizard
import zipfile
import tempfile
import os
import logging
from commit_ccn.domain.CommitMetrics import CommitMetrics
from commit_ccn.domain.CommitMetricsRepository import CommitMetricsRepository
from urllib.parse import urlparse
import re
 
class AnalyzeCommitUseCase:
    def __init__(self, repository: CommitMetricsRepository):
        self.repository = repository
 
    def analyze_repo(self, repo_url: str) -> List[CommitMetrics]:
        download_url = self._build_download_url(repo_url)
        print(f"Descargando el repositorio desde: {download_url}")
        response = requests.get(download_url)
        if response.status_code != 200:
            raise Exception(f"Error al descargar el repositorio desde: {download_url}")
 
        # Analizar el archivo ZIP
        with tempfile.TemporaryDirectory() as tmpdirname:
            zip_path = os.path.join(tmpdirname, 'repo.zip')
            with open(zip_path, 'wb') as zip_file:
                zip_file.write(response.content)
 
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(tmpdirname)
 
            extracted_dir = self._get_extracted_dir(tmpdirname)
            logging.debug(f"Directorio extraído: {extracted_dir}")
 
            return self._analyze_files_in_dir(extracted_dir)
 
    def _parse_repo_url(self, repo_url) -> tuple:
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
 
    def _is_commit(self, ref) -> bool:
        """
        Determine if the ref is a commit hash.
        """
        return bool(re.fullmatch(r'[0-9a-fA-F]{40}', ref))
 
 
    def _build_download_url(self, repo_url: str) -> str:
        base_repo_url, ref = self._parse_repo_url(repo_url)
        if ref and self._is_commit(ref):
            return f"{base_repo_url}/archive/{ref}.zip"
        else:
            return f"{base_repo_url}/archive/main.zip"
 
    def _get_extracted_dir(self, tmpdirname: str) -> str:
        # Encuentra el directorio extraído
        extracted_dirs = [d for d in os.listdir(tmpdirname) if os.path.isdir(os.path.join(tmpdirname, d))]
        if not extracted_dirs:
            raise Exception("No se encontraron directorios compatibles después de extraer el ZIP.")
        return os.path.join(tmpdirname, extracted_dirs[0])
 
    def _analyze_files_in_dir(self, extracted_dir: str) -> List[CommitMetrics]:
        # Analizar los archivos con lizard
        extensions = ['.cs', '.java', '.js', '.ts', '.kts', '.py', '.rb', '.cpp', '.c', '.php', '.go', '.rs']
        results = []
 
        for root, _, files in os.walk(extracted_dir):
            for file in files:
                if any(file.endswith(ext) for ext in extensions):
                    file_path = os.path.join(root, file)
                    analysis = lizard.analyze_file(file_path)
 
                    for func in analysis.function_list:
                        results.append(CommitMetrics(
                            cyclomatic_complexity=func.cyclomatic_complexity,
                            file=file,
                            function_name=func.name,
                            nloc=func.nloc,
                            token_count=func.token_count
                        ))
 
        return results
   