#!/usr/bin/env bash
# Smoke test for a running API with seeded data (the seed creates admin@example.com).
#   scripts/smoke-api.sh [api-url]        (default http://localhost:5500)
#
# To also exercise email confirmation, tell the script where the confirmation email ends up:
#   MAILPIT_URL=http://localhost:8025        the Mailpit inbox from docker compose
#   SMOKE_LOGS_CMD="docker compose logs api" the API logs, where emails go when no SMTP server is set
set -u

API="${1:-${API_URL:-http://localhost:5500}}"
BODY="$(mktemp)"
trap 'rm -f "$BODY"' EXIT
PASS=0
FAIL=0
USERNAME="smoke$(date +%s)"
EMAIL="$USERNAME@example.com"
PASSWORD='Password123!'

# check <label> <expected status> <method> <path> [curl args...]
check() {
  local label=$1 expected=$2 method=$3 path=$4
  shift 4
  local status
  status=$(curl -s -o "$BODY" -w '%{http_code}' -X "$method" "$API$path" \
    -H 'Content-Type: application/json' "$@")
  if [ "$status" = "$expected" ]; then
    PASS=$((PASS + 1))
    printf 'ok    %-52s %s\n' "$label" "$status"
  else
    FAIL=$((FAIL + 1))
    printf 'FAIL  %-52s %s (expected %s)  %s\n' "$label" "$status" "$expected" "$(head -c 200 "$BODY")"
  fi
}

# field <js expression over d>: reads a value out of the last response body
field() {
  node -e 'let s="";process.stdin.on("data",c=>s+=c).on("end",()=>{try{const d=JSON.parse(s);const v=eval(process.argv[1]);console.log(v===undefined?"":v)}catch{console.log("")}})' "$1" <"$BODY"
}

# expect <label> <js expression over d that must be truthy>
expect() {
  if [ "$(field "Boolean($2)")" = "true" ]; then
    PASS=$((PASS + 1))
    printf 'ok    %s\n' "$1"
  else
    FAIL=$((FAIL + 1))
    printf 'FAIL  %s  %s\n' "$1" "$(head -c 200 "$BODY")"
  fi
}

echo "Smoke testing $API"

check 'root' 200 GET /
check 'swagger ui' 200 GET /swagger
check 'openapi document' 200 GET /swagger-json
expect 'openapi document lists paths' 'Object.keys(d.paths).length > 50'
check 'unknown route' 404 GET /definitely-not-a-route

check 'register' 201 POST /users -d "{\"name\":\"Smoke Test\",\"username\":\"$USERNAME\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"country\":\"HR\",\"dateOfBirth\":\"1995-05-05\"}"
USER_ID=$(field 'd.id')
check 'register with invalid body' 400 POST /users -d '{"email":"nope"}'
check 'register duplicate email' 409 POST /users -d "{\"name\":\"Smoke Test\",\"username\":\"${USERNAME}b\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"country\":\"HR\",\"dateOfBirth\":\"1995-05-05\"}"
check 'login as the new user' 201 POST /auth/login -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"
NEW_USER_ACCESS=$(field 'd.accessToken')

TOKEN=""
if [ -n "${MAILPIT_URL:-}" ]; then
  sleep 1
  MESSAGE_ID=$(curl -s "$MAILPIT_URL/api/v1/search?query=to:$EMAIL" | node -e 'let s="";process.stdin.on("data",c=>s+=c).on("end",()=>{try{console.log(JSON.parse(s).messages[0].ID)}catch{console.log("")}})')
  TOKEN=$(curl -s "$MAILPIT_URL/api/v1/message/$MESSAGE_ID" | grep -o 'email-confirmation/[0-9a-f-]\{36\}' | head -1 | cut -d/ -f2)
elif [ -n "${SMOKE_LOGS_CMD:-}" ]; then
  TOKEN=$($SMOKE_LOGS_CMD 2>&1 | grep "To: $EMAIL" | grep -o 'email-confirmation/[0-9a-f-]\{36\}' | head -1 | cut -d/ -f2)
fi

if [ -n "${MAILPIT_URL:-}${SMOKE_LOGS_CMD:-}" ]; then
  check 'confirm email with the emailed token' 201 POST "/auth/email-confirmation/$TOKEN"
  check 'new user can use the API once confirmed' 200 GET /users/me -H "Authorization: Bearer $NEW_USER_ACCESS"
  expect 'new user is the registered one' "d.username === '$USERNAME'"
fi

check 'login as seeded admin' 201 POST /auth/login -d "{\"email\":\"admin@example.com\",\"password\":\"$PASSWORD\"}"
ACCESS=$(field 'd.accessToken')
REFRESH=$(field 'd.refreshToken')
AUTH=(-H "Authorization: Bearer $ACCESS")
check 'login with wrong password' 400 POST /auth/login -d "{\"email\":\"admin@example.com\",\"password\":\"wrong-password\"}"

check 'current user without token' 401 GET /users/me
check 'current user' 200 GET /users/me "${AUTH[@]}"
expect 'current user is the admin' "d.username === 'admin'"
check 'refresh token' 200 GET /auth/refresh -H "Authorization: Bearer $REFRESH"
expect 'refresh returns a new access token' 'd.accessToken'

for path in /tournaments /groups /categories /users /locations /stages /participations /quiz; do
  check "list $path" 200 GET "$path" "${AUTH[@]}"
  expect "list $path has seeded rows" 'd.results.length > 0'
done

check 'locations on the map (PostGIS)' 200 GET '/locations/map?lat=45.8&lng=15.97&radius=5000' "${AUTH[@]}"
check 'tournament detail' 200 GET '/tournaments/1?responseType=extended'
expect 'tournament detail has a name' 'd.name'

check 'create group without token' 401 POST /groups -d '{}'
check 'create group' 201 POST /groups "${AUTH[@]}" -d '{"name":"Smoke Group","abbreviation":"SMK","description":"Created by the smoke test","type":"public","focus":"hybrid","logo":"https://example.com/logo.png","country":"HR"}'
GROUP_ID=$(field 'd.id')
check 'read created group' 200 GET "/groups/$GROUP_ID" "${AUTH[@]}"
check 'delete created group' 200 DELETE "/groups/$GROUP_ID" "${AUTH[@]}"
check 'delete the registered user' 200 DELETE "/users/$USER_ID" "${AUTH[@]}"

echo
echo "$PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
