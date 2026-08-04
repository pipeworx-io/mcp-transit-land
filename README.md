# @pipeworx/transit-land

Transitland MCP — global GTFS aggregator (~3000 transit operators, ~50k feeds). Free tier with API key.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

- `search_agencies(name?, agency_id?, lat?, lon?, radius_m?, limit?)` — transit operators
- `search_routes(name?, route_type?, agency_id?, operator_id?, lat?, lon?, radius_m?, limit?)` — bus / rail / ferry routes
- `search_stops(name?, stop_id?, lat?, lon?, radius_m?, limit?, served_by_route_type?)` — stops/stations
- `departures_at_stop(stop_id, service_date?, start_time?, end_time?)` — upcoming departures
- `list_feeds(spec?, limit?)` — available GTFS feeds

## Auth

- **Platform key:** gateway env `PLATFORM_TRANSITLAND_KEY`
- **BYO:** `?_apiKey=<key>` after registering at https://www.transit.land/

## Data source

`https://transit.land/api/v2/rest/` — `apikey=` query OR `apikey` header.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

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

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
