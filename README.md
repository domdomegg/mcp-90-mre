# mcp-90-mre

A minimal Model Context Protocol server that replicates a bug with the Claude Desktop app's MCP implementation. Specifically, using `allOf` or `anyOf` with an object doesn't appear to work correctly.

https://github.com/user-attachments/assets/e22b0d06-f463-4c74-a081-cb0a631cb5e9

## Usage

To use this server with the Claude Desktop app, first clone this repository, install deps (with `npm install`) and build the repo (with `npm run build`).

Then, add the following configuration to the "mcpServers" section of your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "postgres": {
      "command": "node",
      "args": [
        "/path/to/mcp-90-mre/dist/index.js"
      ]
    }
  }
}
```

## Components

### Tools

- **format_hello** (Currently not working)
  - Format a hello message
  - Input parameters:
    - `obj`: `allOf`:
      - Base object with `timeOfDay` (string)
      - Either:
        - Group type: `{ type: "group", people: string[] }`
        - Individual type: `{ type: "individual", person: string }`

- **format_goodbye** (Currently not working)
  - Format a goodbye message
  - Input parameters:
    - `obj`: `anyOf`:
      - Group type: `{ timeOfDay: string, type: "group", people: string[] }`
      - Individual type: `{ timeOfDay: string, type: "individual", person: string }`

- **format_sorry** (Working)
  - Format a sorry message
  - Uses a nested object containing a union, which appears to work correctly
  - Input parameters:
    - `obj`: Object containing:
      - `nested`: `anyOf`:
        - Group type: `{ timeOfDay: string, type: "group", people: string[] }`
        - Individual type: `{ timeOfDay: string, type: "individual", person: string }`

## Bug Description

The server implements three different approaches to combining object types:

1. `format_hello` uses `allOf` to combine a base object with a discriminated union
2. `format_goodbye` uses a direct union of complete objects
3. `format_sorry` uses a nested object containing a union

Currently, only the third approach (`format_sorry`) works correctly in the Claude Desktop app. Both `format_hello` and `format_goodbye` fail to validate input properly, suggesting an issue with how the Claude Desktop app handles certain JSON Schema constructs.

## Contributing

Pull requests are welcomed on GitHub! To get started:

1. Install Git and Node.js
2. Clone the repository
3. Install dependencies with `npm install`
4. Run `npm run test` to run tests
5. Build with `npm run build`
  - You can use `npm run build:watch` to automatically build after editing [`src/index.ts`](./src/index.ts). This means you can hit save, reload Claude Desktop (with Ctrl/Cmd+R), and the changes apply.
