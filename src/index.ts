#!/usr/bin/env node

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

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { exec } from 'child_process';

// Define schemas for input validation using Zod
const CrudInputSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
  url: z.string().url(),
  data: z.optional(z.record(z.any())),
  headers: z.optional(z.record(z.string())),
});

// Define the structure of API responses for consistency
const CrudOutputSchema = z.object({
  status: z.string(),
  code: z.number(),
  data: z.any(),
  error: z.optional(z.string()),
});

/**
 * Builds a curl command string from the input parameters
 * @param input - The validated CRUD input containing method, URL, headers, and data
 * @returns A curl command string ready for execution
 */
function buildCurlCommand(input: z.infer<typeof CrudInputSchema>): string {
  let cmd = `curl -s -w "\n%{http_code}" --max-time 30 --connect-timeout 10 -X ${input.method} `;
  
  // Add headers if provided
  if (input.headers) {
    for (const [key, value] of Object.entries(input.headers)) {
      // Escape single quotes in header values to prevent command injection
      const escapedValue = value.replace(/'/g, "'\"'\"'");
      cmd += `-H '${key}: ${escapedValue}' `;
    }
  }
  
  // Add request body for POST and PUT requests
  if (input.data && (input.method === 'POST' || input.method === 'PUT')) {
    // Escape single quotes in JSON data to prevent command injection
    const jsonData = JSON.stringify(input.data).replace(/'/g, "'\"'\"'");
    cmd += `-d '${jsonData}' `;
  }
  
  // Escape the URL to prevent command injection
  const escapedUrl = input.url.replace(/'/g, "'\"'\"'");
  cmd += `'${escapedUrl}'`;
  return cmd;
}

/**
 * Provides helpful error messages and suggestions based on HTTP status codes
 * @param statusCode - The HTTP status code received
 * @param url - The URL that was requested
 * @returns A helpful error message with suggestions
 */
function getErrorGuidance(statusCode: number, url: string): string {
  switch (statusCode) {
    case 401:
      return `Authentication required (HTTP 401). The API endpoint requires authentication. Please provide an Authorization header (e.g., "Authorization": "Bearer YOUR_TOKEN" or "Authorization": "Basic YOUR_CREDENTIALS"). Check the API documentation for the correct authentication method.`;
    
    case 403:
      return `Access forbidden (HTTP 403). You may not have permission to access this resource. Check if: 1) Your API key/token has the required permissions, 2) Your account has access to this endpoint, 3) The API requires additional headers or parameters.`;
    
    case 429:
      return `Rate limit exceeded (HTTP 429). The API is receiving too many requests. Please: 1) Wait before making another request (typically 1-60 seconds), 2) Implement exponential backoff in your requests, 3) Check if you need to upgrade your API plan for higher rate limits. Consider spacing out your requests.`;
    
    case 400:
      return `Bad request (HTTP 400). The request syntax is invalid. Please check: 1) Request body format and required fields, 2) URL parameters and query strings, 3) Content-Type header matches the data format being sent.`;
    
    case 404:
      return `Resource not found (HTTP 404). The requested endpoint or resource doesn't exist. Please verify: 1) The URL is correct and properly formatted, 2) The resource ID exists, 3) You're using the correct API base URL.`;
    
    case 405:
      return `Method not allowed (HTTP 405). The HTTP method is not supported for this endpoint. Try a different method (GET, POST, PUT, DELETE) or check the API documentation for supported methods.`;
    
    case 422:
      return `Unprocessable entity (HTTP 422). The request is well-formed but contains semantic errors. Check: 1) Required fields are provided, 2) Data types and formats are correct, 3) Business logic constraints are met.`;
    
    case 500:
      return `Internal server error (HTTP 500). The API server encountered an error. This is typically a temporary issue. Try: 1) Waiting a few moments and retrying, 2) Checking the API status page, 3) Contacting API support if the issue persists.`;
    
    case 502:
    case 503:
    case 504:
      return `Service unavailable (HTTP ${statusCode}). The API service is temporarily unavailable. Please: 1) Wait and retry after a few seconds, 2) Check the API status page, 3) Implement retry logic with exponential backoff.`;
    
    default:
      if (statusCode >= 400 && statusCode < 500) {
        return `Client error (HTTP ${statusCode}). There's an issue with your request. Please check the request format, parameters, and authentication. Consult the API documentation for endpoint-specific requirements.`;
      } else if (statusCode >= 500) {
        return `Server error (HTTP ${statusCode}). The API server is experiencing issues. This is typically temporary - please retry after a short delay.`;
      }
      return `Unexpected response (HTTP ${statusCode}). Please check the API documentation for expected status codes.`;
  }
}

/**
 * Executes a curl command and returns a structured response
 * @param input - The validated CRUD input parameters
 * @returns Promise containing structured response with status, HTTP code, data, and optional error
 */
async function executeCurlCommand(input: z.infer<typeof CrudInputSchema>): Promise<z.infer<typeof CrudOutputSchema>> {
  const cmd = buildCurlCommand(input);
  
  return new Promise((resolve) => {
    exec(cmd, (error: Error | null, stdout: string) => {
      if (error) {
        resolve({ 
          status: 'error', 
          code: 500, 
          data: null, 
          error: `Network or curl error: ${error.message}. Please check your internet connection and ensure curl is installed.` 
        });
        return;
      }
      
      // Split response body and HTTP status code
      // Curl outputs the response body followed by HTTP code on the last line
      const match = stdout.match(/([\s\S]*)\n(\d{3})$/);
      if (!match) {
        resolve({ 
          status: 'error', 
          code: 500, 
          data: null, 
          error: 'Malformed response from curl command. The server may have returned an unexpected format.' 
        });
        return;
      }
      
      const [_, body, codeStr] = match;
      const statusCode = Number(codeStr);
      let data: any = body;
      
      // Attempt to parse response as JSON, fall back to string if invalid
      try { 
        data = JSON.parse(body); 
      } catch {
        // Keep as string if not valid JSON
      }
      
      // For successful responses (2xx), return success
      if (statusCode >= 200 && statusCode < 300) {
        resolve({ status: 'ok', code: statusCode, data });
        return;
      }
      
      // For error responses, provide helpful guidance
      const errorGuidance = getErrorGuidance(statusCode, input.url);
      resolve({ 
        status: 'error', 
        code: statusCode, 
        data, 
        error: errorGuidance 
      });
    });
  });
}

// Create and configure the MCP server
const server = new Server(
  {
    name: 'curl',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Add the CRUD tool handler
server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
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

/**
 * Start the MCP server
 * Initializes the server with stdio transport for communication with MCP clients
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP CURL Server running on stdio - ready to handle requests');
}

// Start the server and handle any errors
main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
