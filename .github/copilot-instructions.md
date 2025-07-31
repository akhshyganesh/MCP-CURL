<!--
MCP CURL Server - GitHub Copilot Instructions
Repository: https://github.com/akhshyganesh/mcp-http-proxy
Author: Akhshy Ganesh <akhshy.balakannan@gmail.com>
License: MIT

Use this file to provide workspace-specific custom instructions to Copilot. 
For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file
-->

## MCP CURL Server Project

This is a Model Context Protocol (MCP) server project that provides CRUD endpoints for proxying HTTP requests using curl commands.

### Project Overview
- **Name**: MCP CURL
- **Type**: MCP Server
- **Language**: TypeScript
- **Framework**: Model Context Protocol SDK
- **Purpose**: Proxy HTTP requests through curl with AI-friendly structured responses

### Key Resources
- **MCP Documentation**: https://modelcontextprotocol.io/llms-full.txt
- **SDK Reference**: https://github.com/modelcontextprotocol/create-python-server
- **Repository**: https://github.com/akhshyganesh/mcp-http-proxy

### Development Guidelines

1. **Server Architecture**:
   - The server should expose CRUD endpoints that perform curl commands to external servers
   - All responses must be structured for AI consumption with consistent fields: `status`, `code`, `data`, `error`
   - Use TypeScript with the `@modelcontextprotocol/sdk` package
   - Implement proper error handling and input validation

2. **Code Standards**:
   - Use Zod for schema validation of inputs and outputs
   - Include comprehensive JSDoc comments for all functions
   - Follow TypeScript best practices with strict type checking
   - Maintain consistent code formatting and naming conventions

3. **Response Format**:
   ```typescript
   {
     status: 'ok' | 'error',
     code: number,                   // HTTP status code
     data: any,                      // Response body (parsed JSON if possible)
     error?: string                  // Error message (if status is 'error')
   }
   ```

4. **Security Considerations**:
   - Validate all user inputs using Zod schemas
   - Construct curl commands safely to prevent injection attacks
   - Be cautious with sensitive headers and data
   - Consider network policies and access controls

5. **Testing**:
   - Use the provided `test-requests.json` file for testing
   - Test with public APIs like JSONPlaceholder, HTTPBin, and ReqRes
   - Verify all CRUD operations (GET, POST, PUT, DELETE)
   - Ensure proper error handling for various scenarios

### File Structure
- `src/index.ts`: Main MCP server implementation
- `src/@types/`: Custom TypeScript declarations
- `test-requests.json`: Sample test requests
- `test-requests.md`: Test documentation
- `.vscode/mcp.json`: VS Code MCP configuration

### Build Commands
- `npm run build`: Compile TypeScript to JavaScript
- `npm start`: Start the compiled server
- `npm run dev`: Watch mode for development
- `npm run clean`: Remove compiled files
