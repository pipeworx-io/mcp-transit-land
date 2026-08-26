# @pipeworx/transit-land

Transitland MCP — global GTFS aggregator (~3000 transit operators, ~50k feeds). Free tier with API key.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

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

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/transit-land/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Transit Land data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
