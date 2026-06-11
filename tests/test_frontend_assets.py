import unittest
import importlib.util
from pathlib import Path


MODULE_PATH = Path(__file__).resolve().parents[1] / "myapp" / "utils" / "frontend_assets.py"
SPEC = importlib.util.spec_from_file_location("frontend_assets", MODULE_PATH)
frontend_assets = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(frontend_assets)

get_backend_frontend_asset_url = frontend_assets.get_backend_frontend_asset_url


class FrontendAssetUrlTests(unittest.TestCase):
    def test_converts_frontend_public_url_to_backend_static_path(self):
        self.assertEqual(
            get_backend_frontend_asset_url("/frontend/static/js/main.123.js"),
            "/static/frontend-login/static/js/main.123.js",
        )

    def test_keeps_non_frontend_paths_unchanged(self):
        self.assertEqual(
            get_backend_frontend_asset_url("/static/assets/images/brand/logoCB.png"),
            "/static/assets/images/brand/logoCB.png",
        )


if __name__ == "__main__":
    unittest.main()
