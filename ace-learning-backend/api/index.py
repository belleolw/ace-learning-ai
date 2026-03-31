from pathlib import Path
import sys

BACKEND_SRC = Path(__file__).resolve().parents[1] / "learning-analytics"

if str(BACKEND_SRC) not in sys.path:
    sys.path.insert(0, str(BACKEND_SRC))

from learning_analytics_model.app import app