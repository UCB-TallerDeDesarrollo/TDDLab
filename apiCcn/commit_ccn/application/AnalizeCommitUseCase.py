from typing import List
import requests
import lizard
import zipfile
import tempfile
import os
import logging
from commit_ccn.domain.CommitMetrics import CommitMetrics
from commit_ccn.domain.CommitMetricsRepository import CommitMetricsRepository

class AnalyzeCommitUseCase:
    def __init__(self, repository: CommitMetricsRepository):
        self.repository = repository

    def analyze_repo(self, repo_url: str) -> List[CommitMetrics]:
        download_url = self._build_download_url(repo_url)
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
            return self._analyze_files_in_dir(extracted_dir)

    def _build_download_url(self, repo_url: str) -> str:
        return f"{repo_url}/archive/main.zip"

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
