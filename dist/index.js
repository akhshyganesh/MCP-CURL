"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const zod_1 = require("zod");
const child_process_1 = require("child_process");
// Define schemas for input validation
const CrudInputSchema = zod_1.z.object({
    method: zod_1.z.enum(['GET', 'POST', 'PUT', 'DELETE']),
    url: zod_1.z.string().url(),
    data: zod_1.z.optional(zod_1.z.record(zod_1.z.any())),
    headers: zod_1.z.optional(zod_1.z.record(zod_1.z.string())),
});
const CrudOutputSchema = zod_1.z.object({
    status: zod_1.z.string(),
    code: zod_1.z.number(),
    data: zod_1.z.any(),
    error: zod_1.z.optional(zod_1.z.string()),
});
// Helper to build curl command
function buildCurlCommand(input) {
    let cmd = `curl -s -w "\n%{http_code}" -X ${input.method} `;
    if (input.headers) {
        for (const [key, value] of Object.entries(input.headers)) {
            cmd += `-H '${key}: ${value}' `;
        }
    }
    if (input.data && (input.method === 'POST' || input.method === 'PUT')) {
        cmd += `-d '${JSON.stringify(input.data)}' `;
    }
    cmd += `'${input.url}'`;
    return cmd;
}
// Execute curl command and return structured response
async function executeCurlCommand(input) {
    const cmd = buildCurlCommand(input);
    return new Promise((resolve) => {
        (0, child_process_1.exec)(cmd, (error, stdout) => {
            if (error) {
                resolve({ status: 'error', code: 500, data: null, error: error.message });
                return;
            }
            // Split response and HTTP code
            const match = stdout.match(/([\s\S]*)\n(\d{3})$/);
            if (!match) {
                resolve({ status: 'error', code: 500, data: null, error: 'Malformed response' });
                return;
            }
            const [_, body, codeStr] = match;
            let data = body;
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
// Create and configure the server
const server = new index_js_1.Server({
    name: 'curl-crud-mcp-server',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
// Add the CRUD tool
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    if (request.params.name !== 'crud') {
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
    const parsed = CrudInputSchema.safeParse(request.params.arguments);
    if (!parsed.success) {
        throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }
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
// List available tools
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
// Start the server
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error('MCP CRUD Server running on stdio');
}
main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});
