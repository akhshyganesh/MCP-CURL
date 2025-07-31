# MCP CURL

A Model Context Protocol (MCP) server that exposes CRUD endpoints to proxy HTTP requests to external servers using curl commands. All responses are structured for AI consumption with consistent status, data, and error fields.

## Repository Information

- **GitHub**: [https://github.com/akhshyganesh/MCP-CURL](https://github.com/akhshyganesh/MCP-CURL)
- **Author**: Akhshy Ganesh ([akhshy.balakannan@gmail.com](mailto:akhshy.balakannan@gmail.com))
- **License**: MIT License
- **Version**: 1.0.0
- **Package**: `mcp-curl`

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
   git clone https://github.com/akhshyganesh/MCP-CURL.git
   cd MCP-CURL
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
│   ├── index.ts              # Main MCP server implementation
│   └── @types/               # Custom type declarations
│       └── modelcontextprotocol__sdk.d.ts
├── dist/                     # Compiled JavaScript (generated)
├── .vscode/
│   ├── mcp.json             # VS Code MCP integration config
│   └── tasks.json           # VS Code build tasks
├── .github/
│   └── copilot-instructions.md # GitHub Copilot workspace instructions
├── test-requests.json        # Sample test requests
├── test-requests.md          # Test requests documentation
├── package.json              # Project dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── tsconfig.build.json      # TypeScript build configuration
├── .gitignore               # Git ignore patterns
├── LICENSE                  # MIT license file
└── README.md               # This file
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

The repository includes a comprehensive `test-requests.json` file with sample requests for testing all CRUD operations. For detailed information about each test request, see [test-requests.md](test-requests.md).

The test file includes examples for:
- **JSONPlaceholder API**: Users and Posts CRUD operations
- **HTTPBin API**: HTTP testing with custom headers
- **ReqRes API**: User API with pagination

You can use these test requests directly with your MCP client to verify the server functionality.

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

We welcome contributions to improve the MCP CURL server! Here's how you can contribute:

1. **Fork the repository** on GitHub: [https://github.com/akhshyganesh/MCP-CURL](https://github.com/akhshyganesh/MCP-CURL)
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** and ensure they follow the existing code style
4. **Add tests** if applicable
5. **Commit your changes**: `git commit -am 'Add some feature'`
6. **Push to the branch**: `git push origin feature/your-feature-name`
7. **Submit a pull request** through GitHub

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful commit messages
- Update documentation for new features
- Ensure all builds pass before submitting PR

## References

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/llms-full.txt)
- [MCP SDK Reference](https://github.com/modelcontextprotocol/create-python-server)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Zod Schema Validation](https://zod.dev/)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 Akhshy Ganesh

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
