#!/usr/bin/env bash
# ============================================================
#  EasyBook – Project Bootstrap Script
# ============================================================
set -euo pipefail

BOLD="\033[1m"; GREEN="\033[0;32m"; CYAN="\033[0;36m"; YELLOW="\033[1;33m"; RESET="\033[0m"

print_step() { echo -e "\n${CYAN}${BOLD}▶ $1${RESET}"; }
print_ok()   { echo -e "  ${GREEN}✔ $1${RESET}"; }
print_warn() { echo -e "  ${YELLOW}⚠ $1${RESET}"; }

echo -e "${BOLD}"
cat << 'EOF'
  ___          _  ____              _
 | __|__ _ ___| ||  _ ) ___  ___  | |__
 | _|/ _` (_-<  _| _ \/ _ \/ _ \ | / /
 |___\__,_/__/\__|___/\___/\___/ |_\_\
  Digital Bookstore Platform – Setup
EOF
echo -e "${RESET}"

# ── 1. Environment files ──────────────────────────────────────
print_step "Creating environment files"

if [ ! -f backend/.env ]; then
cat > backend/.env << 'ENVEOF'
# ── Database ──────────────────────────────────────────────────
DATABASE_URL=postgresql+asyncpg://easybook:easybook_secret@localhost:5432/easybook_db
DATABASE_URL_SYNC=postgresql://easybook:easybook_secret@localhost:5432/easybook_db

# ── Security ──────────────────────────────────────────────────
SECRET_KEY=CHANGE_ME_USE_openssl_rand_hex_32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# ── Admin seed ────────────────────────────────────────────────
FIRST_ADMIN_EMAIL=admin@easybook.io
FIRST_ADMIN_PASSWORD=Admin@1234

# ── External APIs ─────────────────────────────────────────────
OPEN_LIBRARY_API_URL=https://openlibrary.org
GOOGLE_BOOKS_API_URL=https://www.googleapis.com/books/v1
GOOGLE_BOOKS_API_KEY=

# ── CORS ──────────────────────────────────────────────────────
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# ── App ───────────────────────────────────────────────────────
APP_NAME=EasyBook
APP_ENV=development
ENVEOF
  print_ok "backend/.env created"
else
  print_warn "backend/.env already exists – skipping"
fi

if [ ! -f frontend/.env ]; then
cat > frontend/.env << 'ENVEOF'
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=EasyBook
ENVEOF
  print_ok "frontend/.env created"
else
  print_warn "frontend/.env already exists – skipping"
fi

# ── 2. Python virtual environment ────────────────────────────
print_step "Setting up Python virtual environment"
cd backend
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
  print_ok "Virtual environment created"
fi
# shellcheck disable=SC1091
source .venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt -q
print_ok "Python dependencies installed"
cd ..

# ── 3. Node dependencies ──────────────────────────────────────
print_step "Installing Node.js dependencies"
cd frontend
npm install --silent
print_ok "Node dependencies installed"
cd ..

# ── 4. Docker services ───────────────────────────────────────
print_step "Starting Docker services (PostgreSQL)"
docker compose up -d db
echo "  Waiting for PostgreSQL to be ready..."
sleep 5

# ── 5. DB migrations ─────────────────────────────────────────
print_step "Running database migrations"
cd backend
source .venv/bin/activate
alembic upgrade head
print_ok "Migrations applied"
cd ..

echo -e "\n${GREEN}${BOLD}════════════════════════════════════════"
echo -e "  EasyBook is ready to launch! 🚀"
echo -e "════════════════════════════════════════${RESET}"
echo -e "  Backend:   ${CYAN}cd backend && source .venv/bin/activate && uvicorn app.main:app --reload${RESET}"
echo -e "  Frontend:  ${CYAN}cd frontend && npm run dev${RESET}"
echo -e "  API Docs:  ${CYAN}http://localhost:8000/docs${RESET}"
echo -e "  Admin:     ${CYAN}admin@easybook.io / Admin@1234${RESET}\n"
