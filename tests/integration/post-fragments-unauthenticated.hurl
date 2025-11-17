# tests/integration/post-fragments-unauthenticated.hurl
# Confirm that posting without authentication produces a 401
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
`No auth fragment`

HTTP/1.1 401
[Asserts]
jsonpath "$.error.message" == "Unauthorized"
