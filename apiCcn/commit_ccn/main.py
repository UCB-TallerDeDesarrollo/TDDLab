import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
# si no funciona esa ruta probar con:
# sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from commit_ccn.infraestructure.FlaskCommitMetricsController import app

if __name__ == "__main__":
    app.run(debug=True)
