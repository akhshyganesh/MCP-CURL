# MCP Curl

This Model Context Protocol (MCP) server exposes CRUD endpoints that proxy HTTP requests to another server using curl commands. All responses are structured for AI consumption with consistent status, data, and error fields.

## What is MCP?

The Model Context Protocol (MCP) is an open standard that enables secure connections between AI applications and external data sources. This server implements MCP to provide AI assistants with the ability to perform HTTP operations against external APIs through a standardized interface.

## Features

- **CRUD Operations**: Create, Read, Update, Delete via HTTP methods (POST, GET, PUT, DELETE)
- **Curl Proxy**: Uses system curl commands to communicate with target servers
- **AI-Friendly Responses**: Structured JSON responses with status, HTTP code, data, and error fields
- **Schema Validation**: Input validation using Zod schemas
- **TypeScript**: Fully typed implementation with the MCP SDK

## Architecture

```
AI Assistant <-> MCP Client <-> This MCP Server <-> Curl <-> Target API Server
```

The server receives MCP requests, validates input, constructs curl commands, executes them, and returns structured responses.

## Installation & Setup

1. **Clone and install dependencies:**
   ```sh
   git clone <repository-url>
   cd mcp-curl-crud-server
   npm install
   ```

2. **Build the project:**
   ```sh
   npm run build
   ```

3. **Start the server:**
   ```sh
   npm start
   ```

## Development

### Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start the compiled server
- `npm run dev` - Watch mode for development (auto-recompile on changes)
- `npm run clean` - Remove compiled files

### Project Structure

```
├── src/
│   ├── index.ts              # Main server implementation
│   └── @types/               # Custom type declarations
│       └── modelcontextprotocol__sdk.d.ts
├── dist/                     # Compiled JavaScript (generated)
├── .vscode/
│   └── mcp.json             # VS Code MCP integration config
└── package.json
```

## Usage

### Input Schema

The server accepts requests with the following structure:

```typescript
{
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,                    // Valid URL
  data?: Record<string, any>,     // Request body (for POST/PUT)
  headers?: Record<string, string> // HTTP headers
}
```

### Response Schema

All responses follow this structure:

```typescript
{
  status: 'ok' | 'error',
  code: number,                   // HTTP status code
  data: any,                      // Response body (parsed JSON if possible)
  error?: string                  // Error message (if status is 'error')
}
```

### Examples

**GET Request:**
```json
{
  "method": "GET",
  "url": "https://api.example.com/users/123",
  "headers": {
    "Authorization": "Bearer token123"
  }
}
```

**POST Request:**
```json
{
  "method": "POST",
  "url": "https://api.example.com/users",
  "headers": {
    "Content-Type": "application/json"
  },
  "data": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Response Example:**
```json
{
  "status": "ok",
  "code": 200,
  "data": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

## VS Code Integration

### Setting Up MCP in VS Code

1. **Install an MCP Extension**: Install one of these MCP extensions in VS Code:

```vscode-extensions
automatalabs.copilot-mcp,buildwithlayer.mcp-integration-expert-eligr,semanticworkbenchteam.mcp-server-vscode
```

2. **Configure MCP Settings**: The `.vscode/mcp.json` file is already configured:

```json
{
  "servers": {
    "curl-crud-mcp-server": {
      "type": "stdio",
      "command": "node",
      "args": ["dist/index.js"]
    }
  }
}
```

3. **Build and Start**: 
   ```sh
   npm run build
   npm start
   ```

4. **Use in VS Code**: Open VS Code's command palette (`Cmd+Shift+P`) and look for MCP-related commands to interact with your server.

### Testing with Dummy Endpoints

Here are some free JSON API endpoints you can use for testing:

#### JSONPlaceholder (Fake REST API)
- **Base URL**: `https://jsonplaceholder.typicode.com`
- **Features**: Users, Posts, Comments, Albums, Photos, Todos

#### Example Requests to Test Your MCP Server

**1. GET Users:**
```json
{
  "method": "GET",
  "url": "https://jsonplaceholder.typicode.com/users"
}
```

**2. GET Single User:**
```json
{
  "method": "GET",
  "url": "https://jsonplaceholder.typicode.com/users/1"
}
```

**3. CREATE Post:**
```json
{
  "method": "POST",
  "url": "https://jsonplaceholder.typicode.com/posts",
  "headers": {
    "Content-Type": "application/json"
  },
  "data": {
    "title": "My New Post",
    "body": "This is the content of my post",
    "userId": 1
  }
}
```

**4. UPDATE Post:**
```json
{
  "method": "PUT",
  "url": "https://jsonplaceholder.typicode.com/posts/1",
  "headers": {
    "Content-Type": "application/json"
  },
  "data": {
    "id": 1,
    "title": "Updated Post Title",
    "body": "Updated post content",
    "userId": 1
  }
}
```

**5. DELETE Post:**
```json
{
  "method": "DELETE",
  "url": "https://jsonplaceholder.typicode.com/posts/1"
}
```

#### Other Test APIs

**HTTPBin (HTTP testing service):**
- GET: `https://httpbin.org/get`
- POST: `https://httpbin.org/post`
- PUT: `https://httpbin.org/put`
- DELETE: `https://httpbin.org/delete`

**ReqRes (Fake user API):**
- GET Users: `https://reqres.in/api/users`
- GET User: `https://reqres.in/api/users/2`
- POST User: `https://reqres.in/api/users`

### VS Code Usage Workflow

1. **Start the MCP Server**: Run `npm start` in your terminal
2. **Open VS Code**: Open any file or workspace
3. **Access MCP Commands**: Use `Cmd+Shift+P` → Search for "MCP"
4. **Send Requests**: Use the MCP interface to send CRUD requests through your server
5. **View Responses**: See structured JSON responses in VS Code

### Testing Commands

Create a test file `test-requests.json` with sample requests:

```json
[
  {
    "name": "Get All Users",
    "request": {
      "method": "GET",
      "url": "https://jsonplaceholder.typicode.com/users"
    }
  },
  {
    "name": "Create New Post",
    "request": {
      "method": "POST",
      "url": "https://jsonplaceholder.typicode.com/posts",
      "headers": {
        "Content-Type": "application/json"
      },
      "data": {
        "title": "Test Post",
        "body": "This is a test post created via MCP",
        "userId": 1
      }
    }
  }
]
```

## Security Considerations

- **Input Validation**: All inputs are validated using Zod schemas
- **Curl Safety**: The server constructs curl commands safely, but be cautious with untrusted input
- **Network Access**: This server can make arbitrary HTTP requests - ensure proper network policies
- **Headers**: Be careful with sensitive headers like API keys

## Troubleshooting

### Common Issues

1. **"Cannot find module dist/index.js"**: 
   - Run `npm run build` to compile TypeScript to JavaScript
   - Ensure the `dist/` directory exists with `index.js` inside
   - Check that `tsconfig.json` has `"outDir": "./dist"` and `"rootDir": "./src"`

2. **TypeScript Compilation Errors**: Ensure all dependencies are installed (`npm install`)

3. **MCP SDK Types**: Custom type declarations are provided in `src/@types/`

4. **Curl Not Found**: Ensure curl is installed on your system

5. **Network Errors**: Check target server accessibility and network policies

### Development Tips

- Use `npm run dev` for watch mode during development
- Check VS Code problems panel for TypeScript errors
- Test with simple GET requests first
- Validate JSON responses from target servers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## References

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/llms-full.txt)
- [MCP SDK Reference](https://github.com/modelcontextprotocol/create-python-server)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Zod Schema Validation](https://zod.dev/)

## License

ISC License - see package.json for details.
