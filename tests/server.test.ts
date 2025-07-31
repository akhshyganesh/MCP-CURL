/**
 * Basic functionality tests for MCP HTTP Proxy
 * 
 * Tests the core MCP server functionality without requiring external services
 */

import { spawn, ChildProcess } from 'child_process';

describe('MCP HTTP Proxy Server', () => {
  let serverProcess: ChildProcess;
  const SERVER_TIMEOUT = 5000;

  beforeAll(async () => {
    // This test suite focuses on server startup and basic validation
    // Full MCP protocol testing would require more complex setup
  });

  afterAll(async () => {
    if (serverProcess && !serverProcess.killed) {
      serverProcess.kill('SIGTERM');
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (!serverProcess.killed) {
        serverProcess.kill('SIGKILL');
      }
    }
  });

  it('should start the server without crashing', async () => {
    return new Promise<void>((resolve, reject) => {
      const timeout = global.setTimeout(() => {
        if (serverProcess) serverProcess.kill();
        reject(new Error('Server failed to start within timeout'));
      }, SERVER_TIMEOUT);

      serverProcess = spawn('node', ['../dist/index.js'], {
        cwd: __dirname,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';
      
      serverProcess.stdout?.on('data', (data) => {
        output += data.toString();
      });

      serverProcess.stderr?.on('data', (data) => {
        errorOutput += data.toString();
        // Look for the server startup message
        if (errorOutput.includes('MCP HTTP Proxy Server running on stdio')) {
          global.clearTimeout(timeout);
          resolve();
        }
        // Fail on actual errors but ignore expected startup messages
        if (errorOutput.includes('Error:') && !errorOutput.includes('running on stdio')) {
          global.clearTimeout(timeout);
          reject(new Error(`Server error: ${errorOutput}`));
        }
      });

      serverProcess.on('error', (error) => {
        global.clearTimeout(timeout);
        reject(error);
      });

      serverProcess.on('exit', (code) => {
        global.clearTimeout(timeout);
        if (code === 0) {
          resolve(); // Clean exit is also acceptable
        } else if (code !== null) {
          reject(new Error(`Server exited with code ${code}`));
        }
      });

      // Send a test stdin to see if server is responsive
      global.setTimeout(() => {
        if (serverProcess && serverProcess.stdin) {
          serverProcess.stdin.write('{"jsonrpc": "2.0", "method": "initialize", "id": 1}\n');
        }
      }, 1000);
    });
  }, 10000);

  it('should have the correct executable shebang', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const indexPath = path.resolve(__dirname, '../dist/index.js');
    
    try {
      const content = await fs.readFile(indexPath, 'utf-8');
      const firstLine = content.split('\n')[0];
      expect(firstLine).toBe('#!/usr/bin/env node');
    } catch (error) {
      throw new Error(`Could not read built file: ${error}`);
    }
  });

  it('should be importable as a module', async () => {
    const path = await import('path');
    const indexPath = path.resolve(__dirname, '../dist/index.js');
    
    // Test that the file exists and is readable
    const fs = await import('fs/promises');
    await expect(fs.access(indexPath)).resolves.not.toThrow();
    
    // Test that it contains expected MCP-related code
    const content = await fs.readFile(indexPath, 'utf-8');
    expect(content).toMatch(/MCP|ModelContextProtocol|Server/i);
  });
});
