/**
 * Custom type declarations for Model Context Protocol SDK
 * 
 * This file provides TypeScript type definitions for the MCP SDK modules
 * that may not have complete type definitions available.
 * 
 * Repository: https://github.com/akhshyganesh/mcp-http-proxy
 * License: MIT
 */

declare module '@modelcontextprotocol/sdk/server/index.js' {
  export class Server {
    constructor(serverInfo: any, capabilities: any);
    setRequestHandler(schema: any, handler: any): void;
    connect(transport: any): Promise<void>;
  }
}

declare module '@modelcontextprotocol/sdk/server/stdio.js' {
  export class StdioServerTransport {
    constructor();
  }
}

declare module '@modelcontextprotocol/sdk/types.js' {
  export const CallToolRequestSchema: any;
  export const ListToolsRequestSchema: any;
}
