"use strict";
/**
 * MCP CURL Server
 *
 * A Model Context Protocol (MCP) server that exposes CRUD endpoints
 * to proxy HTTP requests to external servers using curl commands.
 *
 * Repository: https://github.com/akhshyganesh/MCP-CURL
 * Author: Akhshy Ganesh <akhshy.balakannan@gmail.com>
 * License: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const zod_1 = require("zod");
const child_process_1 = require("child_process");
// Define schemas for input validation using Zod
const CrudInputSchema = zod_1.z.object({
    method: zod_1.z.enum(['GET', 'POST', 'PUT', 'DELETE']),
    url: zod_1.z.string().url(),
    data: zod_1.z.optional(zod_1.z.record(zod_1.z.any())),
    headers: zod_1.z.optional(zod_1.z.record(zod_1.z.string())),
});
// Define the structure of API responses for consistency
const CrudOutputSchema = zod_1.z.object({
    status: zod_1.z.string(),
    code: zod_1.z.number(),
    data: zod_1.z.any(),
    error: zod_1.z.optional(zod_1.z.string()),
});
/**
 * Builds a curl command string from the input parameters
 * @param input - The validated CRUD input containing method, URL, headers, and data
 * @returns A curl command string ready for execution
 */
function buildCurlCommand(input) {
    let cmd = `curl -s -w "\n%{http_code}" -X ${input.method} `;
    // Add headers if provided
    if (input.headers) {
        for (const [key, value] of Object.entries(input.headers)) {
            cmd += `-H '${key}: ${value}' `;
        }
    }
    // Add request body for POST and PUT requests
    if (input.data && (input.method === 'POST' || input.method === 'PUT')) {
        cmd += `-d '${JSON.stringify(input.data)}' `;
    }
    cmd += `'${input.url}'`;
    return cmd;
}
/**
 * Executes a curl command and returns a structured response
 * @param input - The validated CRUD input parameters
 * @returns Promise containing structured response with status, HTTP code, data, and optional error
 */
async function executeCurlCommand(input) {
    const cmd = buildCurlCommand(input);
    return new Promise((resolve) => {
        (0, child_process_1.exec)(cmd, (error, stdout) => {
            if (error) {
                resolve({ status: 'error', code: 500, data: null, error: error.message });
                return;
            }
            // Split response body and HTTP status code
            // Curl outputs the response body followed by HTTP code on the last line
            const match = stdout.match(/([\s\S]*)\n(\d{3})$/);
            if (!match) {
                resolve({ status: 'error', code: 500, data: null, error: 'Malformed response' });
                return;
            }
            const [_, body, codeStr] = match;
            let data = body;
            // Attempt to parse response as JSON, fall back to string if invalid
            try {
                data = JSON.parse(body);
            }
            catch (_a) {
                // Keep as string if not valid JSON
            }
            resolve({ status: 'ok', code: Number(codeStr), data });
        });
    });
}
// Create and configure the MCP server
const server = new index_js_1.Server({
    name: 'curl-crud-mcp-server',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
// Add the CRUD tool handler
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    if (request.params.name !== 'crud') {
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
    // Validate input arguments using Zod schema
    const parsed = CrudInputSchema.safeParse(request.params.arguments);
    if (!parsed.success) {
        throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }
    // Execute the curl command and return structured response
    const result = await executeCurlCommand(parsed.data);
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(result, null, 2),
            },
        ],
    };
});
// List available tools for MCP clients
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'crud',
                description: 'Execute CRUD operations via HTTP requests using curl',
                inputSchema: {
                    type: 'object',
                    properties: {
                        method: {
                            type: 'string',
                            enum: ['GET', 'POST', 'PUT', 'DELETE'],
                            description: 'HTTP method',
                        },
                        url: {
                            type: 'string',
                            description: 'Target URL',
                        },
                        data: {
                            type: 'object',
                            description: 'Request body data (for POST/PUT)',
                        },
                        headers: {
                            type: 'object',
                            description: 'HTTP headers',
                            additionalProperties: {
                                type: 'string',
                            },
                        },
                    },
                    required: ['method', 'url'],
                },
            },
        ],
    };
});
/**
 * Start the MCP server
 * Initializes the server with stdio transport for communication with MCP clients
 */
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error('MCP CURL Server running on stdio - ready to handle requests');
}
// Start the server and handle any errors
main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});
