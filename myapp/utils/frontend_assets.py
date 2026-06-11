from typing import Dict, List


FRONTEND_PUBLIC_PREFIX = "/frontend/"
BACKEND_FRONTEND_STATIC_PREFIX = "/static/frontend-login/"


def get_backend_frontend_asset_url(asset_url: str) -> str:
    if not asset_url.startswith(FRONTEND_PUBLIC_PREFIX):
        return asset_url

    return asset_url.replace(FRONTEND_PUBLIC_PREFIX, BACKEND_FRONTEND_STATIC_PREFIX, 1)


def get_frontend_entry_files_from_manifest(files: Dict[str, str], use_backend_static: bool = False) -> Dict[str, List[str]]:
    css_files: List[str] = []
    js_files: List[str] = []

    main_css = files.get("main.css")
    main_js = files.get("main.js")

    if main_css:
        css_files.append(
            get_backend_frontend_asset_url(main_css) if use_backend_static else main_css
        )

    if main_js:
        js_files.append(
            get_backend_frontend_asset_url(main_js) if use_backend_static else main_js
        )

    return {
        "css": css_files,
        "js": js_files,
    }
