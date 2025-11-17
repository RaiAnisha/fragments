# 404 Not Found Test

# Make a request to a non-existent route
GET http://localhost:8080/no-such-route

# We should get back an HTTP 1.1 404 response
HTTP/1.1 404

# Optionally check that the response is JSON (your microservice usually returns JSON errors)
[Asserts]
header "Content-Type" matches /^application\/json.*/
