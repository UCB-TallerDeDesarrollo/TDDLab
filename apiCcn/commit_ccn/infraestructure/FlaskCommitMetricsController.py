from flask_cors import CORS
from flask import Flask, request, jsonify
from ..application.AnalizeCommitUseCase import AnalyzeCommitUseCase
from ..application.GetCcnByCommitUseCase import GetCcnByCommitUseCase
from commit_ccn.infraestructure.InMemoryCommitMetricsRepository import InMemoryUserCommitMetricsRepository
import logging
import os
from concurrent.futures import ThreadPoolExecutor

app = Flask(__name__)
CORS(app)
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)

repository = InMemoryUserCommitMetricsRepository()
analyze_use_case = AnalyzeCommitUseCase(repository)
analyze_by_commit = GetCcnByCommitUseCase(repository)

MISSING_REPO_URL_MESSAGE = "No se proporcionó el enlace del repositorio."
ERROR_PROCESSING_REPO_MESSAGE = "Error al procesar el repositorio"

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    repo_url = data.get('repoUrl')

    if not repo_url:
        logging.debug(MISSING_REPO_URL_MESSAGE)
        return jsonify({"error": MISSING_REPO_URL_MESSAGE}), 400

    try:
        # Ejecutar el caso de uso en este caso el de analyze
        metrics = analyze_use_case.analyze_repo(repo_url)
        return jsonify({"metrics": [m.__dict__ for m in metrics]})
    except Exception as e:
        logging.error(f"{ERROR_PROCESSING_REPO_MESSAGE}: {str(e)}")
        return jsonify({"error": ERROR_PROCESSING_REPO_MESSAGE, "details": str(e)}), 500

@app.route('/analyzeCommit', methods=['POST'])
def analyze_commit():
    data = request.get_json()
    repo_url = data.get('repoUrl')

    if not repo_url:
        logging.debug(MISSING_REPO_URL_MESSAGE)
        return jsonify({"error": MISSING_REPO_URL_MESSAGE}), 400

    try:
        # Ejecutar el caso de uso en este caso el de analyze
        metrics = analyze_by_commit.analyze_commit(repo_url)
        return jsonify({"metrics": [m.__dict__ for m in metrics]})
    except Exception as e:
        logging.error(f"{ERROR_PROCESSING_REPO_MESSAGE}: {str(e)}")
        return jsonify({"error": ERROR_PROCESSING_REPO_MESSAGE, "details": str(e)}), 500


@app.route('/analyzeAvgCcn', methods=['POST'])
def analyze_avg_ccn():
    data = request.get_json()
    repo_url = data.get('repoUrl')

    if not repo_url:
        logging.debug(MISSING_REPO_URL_MESSAGE)
        return jsonify({"error": MISSING_REPO_URL_MESSAGE}), 400

    try:
        commits = analyze_use_case.get_commits(repo_url)
        commits.reverse()
        with ThreadPoolExecutor() as executor:
            results = list(executor.map(
                lambda commit: {
                    "commit": commits.index(commit) + 1,
                    "average_cyclomatic_complexity": analyze_use_case.calculate_average_ccn(repo_url, commit)
                }, commits))
        return jsonify({"results": results}), 200
    except Exception as e:
        logging.error(f"{ERROR_PROCESSING_REPO_MESSAGE}: {str(e)}")
        return jsonify({"error": ERROR_PROCESSING_REPO_MESSAGE, "details": str(e)}), 500



if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    app.run(host="0.0.0.0", port=port, debug=True)