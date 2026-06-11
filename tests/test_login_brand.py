import importlib.util
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).resolve().parents[1] / "myapp" / "brand.py"
SPEC = importlib.util.spec_from_file_location("brand", MODULE_PATH)
brand = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(brand)


class LoginBrandTests(unittest.TestCase):
    def test_login_brand_uses_images_directory(self):
        self.assertEqual(
            brand.LOGIN_BRAND["logo"],
            "/static/assets/images/brand/logoCB.png",
        )
        self.assertEqual(
            brand.LOGIN_BRAND["favicon"],
            "/static/assets/images/brand/logoCB.png",
        )


if __name__ == "__main__":
    unittest.main()
