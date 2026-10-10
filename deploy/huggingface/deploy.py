"""Deploy the app to a Hugging Face Docker Space.

Stages the files the Dockerfile needs, creates the Space on first run and uploads them; the Space then
builds the image itself. With --configure, the Space secrets/variables are (re)written from the env file.

    python deploy/huggingface/deploy.py [--configure] [--env deploy/.env.production]

HF_TOKEN and HF_SPACE come from the environment or the env file.
"""

import argparse
import base64
import os
import re
import secrets
import shutil
import tempfile
from pathlib import Path

from huggingface_hub import HfApi

ROOT = Path(__file__).resolve().parents[2]
FILES = ["Dockerfile", ".dockerignore", "mvnw", "pom.xml", "sonar-project.properties", "checkstyle.xml"]
DIRS = {".mvn": [], "app": ["node_modules", "dist", ".angular", "coverage"], "seed": ["out"], "src/main": []}
# Visible in the Space settings; everything else in the env file is stored as a secret.
PUBLIC_KEYS = {
    "APP_BASE_URL", "LINGORA_REQUIRE_ACTIVATION", "MAIL_FROM", "SMTP_HOST", "SMTP_PORT", "SMTP_AUTH", "SMTP_STARTTLS",
    "SUPABASE_URL", "SUPABASE_BUCKET", "GOOGLE_CLIENT_ID", "FIREBASE_PROJECT_ID", "FIREBASE_API_KEY",
    "FIREBASE_AUTH_DOMAIN", "FIREBASE_APP_ID",
}
DEPLOY_KEYS = {"HF_TOKEN", "HF_SPACE"}


def read_env(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    if path.exists():
        for line in path.read_text(encoding="utf-8").splitlines():
            m = re.match(r"\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$", line)
            if m and m.group(2):
                values[m.group(1)] = m.group(2).strip('"').strip("'")
    return values


def space_url(space: str) -> str:
    return "https://" + re.sub(r"[^a-z0-9]+", "-", space.lower().replace("/", "-")) + ".hf.space"


def stage() -> Path:
    out = Path(tempfile.mkdtemp(prefix="hf-space-"))
    for f in FILES:
        shutil.copy2(ROOT / f, out / f)
    for d, ignore in DIRS.items():
        shutil.copytree(ROOT / d, out / d, ignore=shutil.ignore_patterns(*ignore))
    shutil.copy2(ROOT / "deploy/huggingface/README.md", out / "README.md")
    return out


def configure(api: HfApi, space: str, env: dict[str, str], env_path: Path) -> None:
    config = {k: v for k, v in env.items() if k not in DEPLOY_KEYS}
    missing = [k for k in ("DB_URL", "DB_PASSWORD", "LINGORA_ADMIN_EMAIL", "LINGORA_ADMIN_PASSWORD") if k not in config]
    if missing or "HOST:PORT" in config.get("DB_URL", ""):
        raise SystemExit(f"Fill in {env_path.name} first (missing: {', '.join(missing) or 'DB_URL host/port'})")
    if "JHIPSTER_SECURITY_AUTHENTICATION_JWT_BASE64_SECRET" not in config:
        jwt = base64.b64encode(secrets.token_bytes(64)).decode()
        config["JHIPSTER_SECURITY_AUTHENTICATION_JWT_BASE64_SECRET"] = jwt
        with env_path.open("a", encoding="utf-8") as fh:
            fh.write(f"\nJHIPSTER_SECURITY_AUTHENTICATION_JWT_BASE64_SECRET={jwt}\n")
    config.setdefault("APP_BASE_URL", space_url(space))
    for key, value in sorted(config.items()):
        if key in PUBLIC_KEYS:
            api.add_space_variable(space, key, value)
        else:
            api.add_space_secret(space, key, value)
        print(f"  {'variable' if key in PUBLIC_KEYS else 'secret  '} {key}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--configure", action="store_true", help="write Space secrets/variables from the env file")
    parser.add_argument("--env", default=str(ROOT / "deploy/.env.production"))
    args = parser.parse_args()
    env_path = Path(args.env)
    env = read_env(env_path)
    token = os.environ.get("HF_TOKEN") or env.get("HF_TOKEN")
    space = os.environ.get("HF_SPACE") or env.get("HF_SPACE")
    if not token or not space:
        raise SystemExit("HF_TOKEN and HF_SPACE are required (environment or env file)")

    api = HfApi(token=token)
    api.create_repo(space, repo_type="space", space_sdk="docker", exist_ok=True)
    if args.configure:
        print(f"Configuring {space}:")
        configure(api, space, env, env_path)

    folder = stage()
    try:
        sha = os.environ.get("GITHUB_SHA", "local")[:7]
        api.upload_folder(folder_path=folder, repo_id=space, repo_type="space", delete_patterns="*", commit_message=f"Deploy {sha}")
    finally:
        shutil.rmtree(folder, ignore_errors=True)
    print(f"Uploaded. Build logs: https://huggingface.co/spaces/{space}  App: {space_url(space)}")


if __name__ == "__main__":
    main()
