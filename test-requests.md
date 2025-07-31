# MCP CURL Test Requests

This document describes the test requests available in `test-requests.json` for testing the MCP CURL server.

## Repository Information

- **Repository**: [https://github.com/akhshyganesh/MCP-CURL](https://github.com/akhshyganesh/MCP-CURL)
- **Author**: Akhshy Ganesh <akhshy.balakannan@gmail.com>
- **License**: MIT

## Test File Usage

The `test-requests.json` file contains a comprehensive set of sample HTTP requests that demonstrate all CRUD operations supported by the MCP CURL server. These examples use free public APIs for testing purposes.

## Available Test Requests

### 1. JSONPlaceholder API Tests
- **Get All Users**: Retrieves a list of all users
- **Get Single User**: Retrieves a specific user by ID
- **Create New Post**: Creates a new post with title, body, and user ID
- **Update Post**: Updates an existing post using PUT method
- **Delete Post**: Deletes a post by ID

### 2. HTTPBin API Tests
- **Test HTTPBin GET**: Tests GET request with custom User-Agent header
- **Test HTTPBin POST**: Tests POST request with JSON payload

### 3. ReqRes API Tests
- **Get ReqRes Users**: Tests pagination with ReqRes fake user API

## How to Use

1. Load the test requests from `test-requests.json`
2. Send individual requests through your MCP client
3. Verify the structured responses with status, HTTP code, and data fields
4. Use these as templates for your own API testing

## Expected Response Format

All responses follow this structure:
```json
{
  "status": "ok" | "error",
  "code": number,
  "data": any,
  "error": string (optional)
}
```

### Success Response Example
```json
{
  "status": "ok",
  "code": 200,
  "data": {
    "userId": 1,
    "id": 1,
    "title": "Test Post",
    "body": "This is a test post"
  }
}
```

### Error Response Example (401 Unauthorized)
```json
{
  "status": "error",
  "code": 401,
  "data": {
    "message": "Unauthorized"
  },
  "error": "Authentication required (HTTP 401). The API endpoint requires authentication. Please provide an Authorization header (e.g., \"Authorization\": \"Bearer YOUR_TOKEN\" or \"Authorization\": \"Basic YOUR_CREDENTIALS\"). Check the API documentation for the correct authentication method."
}
```

### Error Response Example (429 Rate Limited)
```json
{
  "status": "error",
  "code": 429,
  "data": {
    "message": "Too Many Requests"
  },
  "error": "Rate limit exceeded (HTTP 429). The API is receiving too many requests. Please: 1) Wait before making another request (typically 1-60 seconds), 2) Implement exponential backoff in your requests, 3) Check if you need to upgrade your API plan for higher rate limits. Consider spacing out your requests."
}
```

## Testing APIs Used

- **JSONPlaceholder**: `https://jsonplaceholder.typicode.com` - Fake REST API for testing
- **HTTPBin**: `https://httpbin.org` - HTTP testing service
- **ReqRes**: `https://reqres.in` - Fake user API for testing

## Common Error Scenarios and Solutions

When testing with real APIs, you may encounter various HTTP error codes. The MCP CURL server provides helpful guidance for each:

### Authentication Errors (401/403)
- **Issue**: Missing or invalid authentication
- **Solution**: Add proper authorization headers
- **Example**: `"Authorization": "Bearer your-api-token"`

### Rate Limiting (429)
- **Issue**: Too many requests sent too quickly
- **Solution**: Implement delays between requests
- **Recommendation**: Wait 1-60 seconds before retrying

### Bad Request (400)
- **Issue**: Invalid request format or missing required fields
- **Solution**: Validate request body and headers
- **Check**: Content-Type, required fields, data types

### Not Found (404)
- **Issue**: Endpoint or resource doesn't exist
- **Solution**: Verify URL and resource IDs
- **Check**: API base URL, endpoint path, resource existence

### Server Errors (5xx)
- **Issue**: API server problems
- **Solution**: Retry after a short delay
- **Note**: Usually temporary issues

## Security Best Practices

- Never include real API keys in test files
- Use test/sandbox environments when available
- Be mindful of rate limits when testing
- Validate all responses before using data
- Use HTTPS URLs whenever possible
