#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const FormatHelloArgsSchema = z.object({
  obj: z.union([
    z.object({
      timeOfDay: z.string().describe('The rough time of day, e.g. morning or afternoon'),
      type: z.literal('group'),
      people: z.array(z.string()),
    }),
    z.object({
      timeOfDay: z.string().describe('The rough time of day, e.g. morning or afternoon'),
      type: z.literal('individual'),
      person: z.string(),
    }),
  ]),
});

const FormatGoodbyeArgsSchema = z.object({
  obj: z.object({
    timeOfDay: z.string().describe('The rough time of day, e.g. morning or afternoon'),
  }).and(
    z.union([
      z.object({
        type: z.literal('group'),
        people: z.array(z.string()),
      }),
      z.object({
        type: z.literal('individual'),
        person: z.string(),
      }),
    ]),
  ),
});

const FormatSorryArgsSchema = z.object({
  obj: z.object({
    nested: z.union([
      z.object({
        timeOfDay: z.string().describe('The rough time of day, e.g. morning or afternoon'),
        type: z.literal('group'),
        people: z.array(z.string()),
      }),
      z.object({
        timeOfDay: z.string().describe('The rough time of day, e.g. morning or afternoon'),
        type: z.literal('individual'),
        person: z.string(),
      }),
    ]),
  }),
});

const server = new Server(
  {
    name: 'airtable-mcp-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'format_hello',
        description: 'Generate a hello greeting',
        inputSchema: zodToJsonSchema(FormatHelloArgsSchema),
      },
      {
        name: 'format_goodbye',
        description: 'Generate a goodbye greeting',
        inputSchema: zodToJsonSchema(FormatGoodbyeArgsSchema),
      },
      {
        name: 'format_sorry',
        description: 'Generate a sorry message',
        inputSchema: zodToJsonSchema(FormatSorryArgsSchema),
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'format_hello') {
    const args = FormatHelloArgsSchema.parse(request.params.arguments);
    return {
      content: [{
        type: 'text',
        text: `Good ${args.obj.timeOfDay}, ${args.obj.type === 'group' ? args.obj.people.join(', ') : args.obj.person}! It's nice to meet you.`,
      }],
      isError: false,
    };
  }
  if (request.params.name === 'format_goodbye') {
    const args = FormatGoodbyeArgsSchema.parse(request.params.arguments);
    return {
      content: [{
        type: 'text',
        text: `Good ${args.obj.timeOfDay}, ${args.obj.type === 'group' ? args.obj.people.join(', ') : args.obj.person}! See you later.`,
      }],
      isError: false,
    };
  }
  if (request.params.name === 'format_sorry') {
    const args = FormatSorryArgsSchema.parse(request.params.arguments);
    return {
      content: [{
        type: 'text',
        text: `Sorry ${args.obj.nested.type === 'group' ? args.obj.nested.people.join(', ') : args.obj.nested.person} to disappoint you this ${args.obj.nested.timeOfDay}.`,
      }],
      isError: false,
    };
  }
  throw new Error(`Unknown tool: ${request.params.name}`);
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

runServer();
