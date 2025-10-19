from typing import List
import requests
import lizard
import zipfile
import tempfile
import os
import logging
from commit_ccn.domain.CommitMetrics import CommitMetrics
from commit_ccn.domain.CommitMetricsRepository import CommitMetricsRepository
import re
from commit_ccn.shared.repo_utils import parse_repo_url
 
class AnalyzeCommitUseCase:
    def __init__(self, repository: CommitMetricsRepository):
        self.repository = repository
 
    def analyze_repo(self, repo_url: str) -> List[CommitMetrics]:
        download_url = self._build_download_url(repo_url)
        response = requests.get(download_url)
        if response.status_code != 200:
            raise requests.exceptions.RequestException(
                f"Error al descargar el repositorio desde: {download_url}"
            )
 
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
 
    def _is_commit(self, ref) -> bool:
        """
        Determine if the ref is a commit hash.
        """
        return bool(re.fullmatch(r'[0-9a-fA-F]{40}', ref))
 
 
    def _build_download_url(self, repo_url: str) -> str:
        base_repo_url, ref = parse_repo_url(repo_url)
        if ref and self._is_commit(ref):
            return f"{base_repo_url}/archive/{ref}.zip"
        else:
            return f"{base_repo_url}/archive/main.zip"
 
    def _get_extracted_dir(self, tmpdirname: str) -> str:
        # Encuentra el directorio extraído
        extracted_dirs = [d for d in os.listdir(tmpdirname) if os.path.isdir(os.path.join(tmpdirname, d))]
        if not extracted_dirs:
            raise FileNotFoundError("No se encontraron directorios compatibles después de extraer el ZIP.")
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
    
    def get_commits(self, repo_url: str) -> List[str]:
        repo_base, _ = parse_repo_url(repo_url)
        partes_url = repo_base.rstrip("/").split("/")
        usuario = partes_url[-2]
        repositorio = partes_url[-1]
        commits_url = f"https://api.github.com/repos/{usuario}/{repositorio}/commits?per_page=100"
        response = requests.get(commits_url)
        
        return [commit for commit in response.json()]
    
    def get_commit_url(self, repo_url, commit):
        return f"{repo_url}/commit/{commit['sha']}"

    def calculate_average_ccn(self, repo_url, commit: str) -> float:
        commit_url = self.get_commit_url(repo_url, commit)
        metrics = self.analyze_commit(commit_url)
        if metrics:
            return sum(m.cyclomatic_complexity for m in metrics) / len(metrics)
        return 0.0

    def analyze_commit(self, commit_url: str) -> List[CommitMetrics]:
        return self.analyze_repo(commit_url)
   