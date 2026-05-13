# mcp-transit-land

Transitland MCP — global GTFS aggregator

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 250+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search_agencies` | Search transit agencies/operators by name or geo. Operators are the entities running services. |
| `search_routes` | `Search routes by name, type, agency, or location. route_type: ${ROUTE_TYPES}.` |
| `search_stops` | Search stops/stations. Use lat+lon+radius_m for "stops near point". |
| `departures_at_stop` | Upcoming departures from a stop. stop_id is the Transitland onestop_id (e.g. "s-9q8yvz3w7-stopname"). |
| `list_feeds` | Available GTFS feeds across operators. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "transit-land": {
      "url": "https://gateway.pipeworx.io/transit-land/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 250+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Transit Land data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
