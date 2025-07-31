import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { exec } from 'child_process';

// Define schemas for input validation
const CrudInputSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
  url: z.string().url(),
  data: z.optional(z.record(z.any())),
  headers: z.optional(z.record(z.string())),
});

const CrudOutputSchema = z.object({
  status: z.string(),
  code: z.number(),
  data: z.any(),
  error: z.optional(z.string()),
});

// Helper to build curl command
function buildCurlCommand(input: z.infer<typeof CrudInputSchema>): string {
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
async function executeCurlCommand(input: z.infer<typeof CrudInputSchema>): Promise<z.infer<typeof CrudOutputSchema>> {
  const cmd = buildCurlCommand(input);
  
  return new Promise((resolve) => {
    exec(cmd, (error: Error | null, stdout: string) => {
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
      let data: any = body;
      try { 
        data = JSON.parse(body); 
      } catch {
        // Keep as string if not valid JSON
      }
      
      resolve({ status: 'ok', code: Number(codeStr), data });
    });
  });
}

// Create and configure the server
const server = new Server(
  {
    name: 'curl-crud-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Add the CRUD tool
server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
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
server.setRequestHandler(ListToolsRequestSchema, async () => {
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
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP CRUD Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
