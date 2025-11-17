# tests/integration/post-fragments-json.hurl
# Confirm that posting a JSON fragment works
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
`{"message": "Hello JSON!"}`

HTTP/1.1 201
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "application/json"
[Captures]
url: header "Location"

# GET the fragment back
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: application/json
[Asserts]
body == `{"message":"Hello JSON!"}`
