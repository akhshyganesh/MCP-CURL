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

## Testing APIs Used

- **JSONPlaceholder**: `https://jsonplaceholder.typicode.com` - Fake REST API for testing
- **HTTPBin**: `https://httpbin.org` - HTTP testing service
- **ReqRes**: `https://reqres.in` - Fake user API for testing
