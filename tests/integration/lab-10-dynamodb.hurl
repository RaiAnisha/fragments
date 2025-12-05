# Lab 10 – DynamoDB Integration Test
# Make sure the server is running with LOCAL DynamoDB enabled

# 1. POST a new JSON fragment as an authorized user
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1

`{"service": "DynamoDB"}`

HTTP/1.1 201
[Asserts]
header "Location" matches "^http://localhost:8080/v1/fragments/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F-]{36}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 23
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString

[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"
fragment1_ownerId: jsonpath "$.fragment.ownerId"

# 2. GET fragment info and assert metadata
GET {{fragment1_url}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.fragment.id" == "{{fragment1_id}}"
jsonpath "$.fragment.ownerId" == "{{fragment1_ownerId}}"
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 23
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString

# 3. POST a second Markdown fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1

`DynamoDB is **great**.`

HTTP/1.1 201
[Asserts]
header "Location" matches "^http://localhost:8080/v1/fragments/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F-]{36}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.size" == 23
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString

[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"
fragment2_ownerId: jsonpath "$.fragment.ownerId"

# 4. GET second fragment info
GET {{fragment2_url}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.fragment.id" == "{{fragment2_id}}"
jsonpath "$.fragment.ownerId" == "{{fragment2_ownerId}}"
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.size" == 23
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString

# 5. GET all fragments for the user (ids only)
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.fragments" contains "{{fragment1_id}}"
jsonpath "$.fragments" contains "{{fragment2_id}}"

# 6. DELETE the first fragment
DELETE {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

# 7. GET the first fragment again → should be 404
GET {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404

# 8. GET all fragments to confirm first fragment is gone
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
# Confirm second fragment still exists
jsonpath "$.fragments" contains "{{fragment2_id}}"
