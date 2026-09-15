#!/usr/bin/env python3
"""Write CI-only signing + Firebase files. Never prints secret values."""
from __future__ import annotations

import base64
import os
import pathlib
import re
import sys
from typing import Optional


def log(msg: str) -> None:
    print(msg, flush=True)


def write(path: pathlib.Path, data: str, mode: Optional[int] = None) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(data, encoding="utf-8", newline="\n")
    if mode is not None:
        os.chmod(path, mode)
    log(f"wrote {path.name} ({len(data.encode('utf-8'))} bytes)")


def decode_plist(raw: str) -> str:
    text = raw.strip().replace("\r\n", "\n").replace("\r", "\n")
    if text.startswith("<?xml") or text.startswith("<plist"):
        return text
    try:
        decoded = base64.b64decode(text, validate=False).decode("utf-8")
        if "<?xml" in decoded or "<plist" in decoded:
            return decoded
    except Exception:
        pass
    return text


def normalize_p8(raw: str) -> str:
    text = raw.strip().replace("\r", "")
    if "\\n" in text:
        text = text.replace("\\n", "\n")
    text = text.strip()
    if "BEGIN PRIVATE KEY" not in text:
        body = re.sub(r"\s+", "", text)
        lines = [body[i : i + 64] for i in range(0, len(body), 64)]
        text = "-----BEGIN PRIVATE KEY-----\n" + "\n".join(lines) + "\n-----END PRIVATE KEY-----"
    if not text.endswith("\n"):
        text += "\n"
    return text


def main() -> int:
    root = pathlib.Path(__file__).resolve().parent.parent
    require = os.environ.get("FITCONNECT_REQUIRE_UPLOAD_SECRETS") == "1"
    team = os.environ.get("APPLE_TEAM_ID", "").strip()
    key_id = os.environ.get("APP_STORE_CONNECT_API_KEY_ID", "").strip()
    issuer = os.environ.get("APP_STORE_CONNECT_ISSUER_ID", "").strip()
    p8 = os.environ.get("APP_STORE_CONNECT_API_KEY_P8", "").strip()
    plist = os.environ.get("IOS_GOOGLE_SERVICE_INFO_PLIST", "").strip()
    build = (
        os.environ.get("CURRENT_PROJECT_VERSION")
        or os.environ.get("GITHUB_RUN_NUMBER")
        or os.environ.get("CI_BUILD_NUMBER")
        or "1"
    )
    key_out = pathlib.Path(
        os.environ.get(
            "APP_STORE_CONNECT_API_KEY_PATH",
            str(pathlib.Path(os.environ.get("RUNNER_TEMP", "/tmp")) / "AuthKey.p8"),
        )
    )

    missing: list[str] = []
    if require:
        if not team:
            missing.append("APPLE_TEAM_ID")
        if not key_id:
            missing.append("APP_STORE_CONNECT_API_KEY_ID")
        if not issuer:
            missing.append("APP_STORE_CONNECT_ISSUER_ID")
        if not p8:
            missing.append("APP_STORE_CONNECT_API_KEY_P8")
        if not plist:
            missing.append("IOS_GOOGLE_SERVICE_INFO_PLIST")
        if missing:
            log("FAIL missing GitHub/Xcode Cloud secrets (names only): " + ", ".join(missing))
            return 1

    if team:
        write(
            root / "iosApp/Config/Local.xcconfig",
            "// CI injected — gitignored\nDEVELOPMENT_TEAM = "
            + team
            + "\nCODE_SIGN_STYLE = Automatic\n",
        )

    if plist:
        body = decode_plist(plist)
        if "REPLACE_ME" in body:
            log("FAIL IOS_GOOGLE_SERVICE_INFO_PLIST is still the example placeholder")
            return 1
        if "com.fitconnect.ios" not in body:
            log("FAIL IOS_GOOGLE_SERVICE_INFO_PLIST BUNDLE_ID must be com.fitconnect.ios")
            return 1
        write(root / "iosApp/GoogleService-Info.plist", body)

    export_src = (root / "iosApp/AppStore/ExportOptions.plist").read_text(encoding="utf-8")
    if team:
        write(
            root / "iosApp/AppStore/ExportOptions.generated.plist",
            export_src.replace("APPLE_TEAM_ID", team),
        )

    if p8:
        write(key_out, normalize_p8(p8), mode=0o600)

    yml_path = root / "iosApp/project.yml"
    yml = yml_path.read_text(encoding="utf-8")
    yml2, n = re.subn(
        r"CURRENT_PROJECT_VERSION:\s*\d+",
        f"CURRENT_PROJECT_VERSION: {build}",
        yml,
        count=1,
    )
    if n:
        yml_path.write_text(yml2, encoding="utf-8", newline="\n")
        log(f"stamped CURRENT_PROJECT_VERSION {build}")

    github_output = os.environ.get("GITHUB_OUTPUT")
    if github_output:
        with open(github_output, "a", encoding="utf-8") as handle:
            handle.write(f"api_key_path={key_out}\n")
            handle.write(f"export_plist={root / 'iosApp/AppStore/ExportOptions.generated.plist'}\n")
            handle.write(f"build_number={build}\n")

    log("ios-inject-ci-secrets OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
