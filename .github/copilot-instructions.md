<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is an MCP Server project. You can find more info and examples at https://modelcontextprotocol.io/llms-full.txt
Reference SDK: https://github.com/modelcontextprotocol/create-python-server

Instructions:
- The server should expose CRUD endpoints that perform curl commands to another server.
- Responses must be structured for AI consumption (status, data, error, etc).
- Use TypeScript and @modelcontextprotocol/sdk.
- Use zod for schema validation.
