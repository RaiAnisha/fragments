# Lab 9 – S3 Integration Test
# Make sure the server is running with LOCAL S3 enabled

# 1. POST a new fragment as an authorized user
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1

`Hello S3!`

HTTP/1.1 201

[Captures]
url: header "Location"

# 2. GET the fragment by URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain

`Hello S3!`

# 3. DELETE the fragment
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

# 4. GET again → should now be 404
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404
