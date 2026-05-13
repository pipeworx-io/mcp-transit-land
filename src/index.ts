interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Transitland MCP — global GTFS aggregator
 *
 * Auth: apikey query param.
 * Docs: https://www.transit.land/documentation/rest-api
 */


const BASE = 'https://transit.land/api/v2/rest';

const ROUTE_TYPES = '0=tram, 1=metro, 2=rail, 3=bus, 4=ferry, 5=cable_tram, 6=aerial_lift, 7=funicular, 11=trolleybus, 12=monorail';

const tools: McpToolExport['tools'] = [
  {
    name: 'search_agencies',
    description: 'Search transit agencies/operators by name or geo. Operators are the entities running services.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Free-text agency name filter' },
        agency_id: { type: 'string', description: 'GTFS agency_id' },
        lat: { type: 'number', description: 'Latitude (with radius_m + lon)' },
        lon: { type: 'number', description: 'Longitude' },
        radius_m: { type: 'number', description: 'Search radius in meters (default 1000)' },
        limit: { type: 'number', description: '1-100 (default 20)' },
      },
    },
  },
  {
    name: 'search_routes',
    description: `Search routes by name, type, agency, or location. route_type: ${ROUTE_TYPES}.`,
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        route_type: { type: 'number', description: 'GTFS route_type code' },
        agency_id: { type: 'string' },
        operator_id: { type: 'string', description: 'Transitland operator onestop_id' },
        lat: { type: 'number' },
        lon: { type: 'number' },
        radius_m: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  },
  {
    name: 'search_stops',
    description: 'Search stops/stations. Use lat+lon+radius_m for "stops near point".',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        stop_id: { type: 'string', description: 'GTFS stop_id' },
        lat: { type: 'number' },
        lon: { type: 'number' },
        radius_m: { type: 'number', description: 'Default 100' },
        served_by_route_type: { type: 'number', description: 'Filter to stops served by this route_type' },
        limit: { type: 'number' },
      },
    },
  },
  {
    name: 'departures_at_stop',
    description: 'Upcoming departures from a stop. stop_id is the Transitland onestop_id (e.g. "s-9q8yvz3w7-stopname").',
    inputSchema: {
      type: 'object',
      properties: {
        stop_id: { type: 'string', description: 'Transitland onestop_id for the stop' },
        service_date: { type: 'string', description: 'YYYY-MM-DD (default today)' },
        start_time: { type: 'string', description: 'HH:MM:SS' },
        end_time: { type: 'string', description: 'HH:MM:SS' },
      },
      required: ['stop_id'],
    },
  },
  {
    name: 'list_feeds',
    description: 'Available GTFS feeds across operators.',
    inputSchema: {
      type: 'object',
      properties: {
        spec: { type: 'string', description: 'gtfs | gtfs-rt | mds (default gtfs)' },
        limit: { type: 'number' },
      },
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiKey = (args._apiKey as string | undefined)?.trim();
  if (!apiKey) {
    throw new Error(
      'Transitland requires an API key. Contact the operator about platform credentials, or BYO via ?_apiKey=<key> after registering at https://www.transit.land/.',
    );
  }
  switch (name) {
    case 'search_agencies': {
      const params = buildSearch(apiKey, args, ['agency_id', 'name']);
      return tlGet(`/agencies.json?${params}`);
    }
    case 'search_routes': {
      const params = buildSearch(apiKey, args, ['agency_id', 'operator_id', 'name', 'route_type']);
      return tlGet(`/routes.json?${params}`);
    }
    case 'search_stops': {
      const params = buildSearch(apiKey, args, ['stop_id', 'name', 'served_by_route_type']);
      return tlGet(`/stops.json?${params}`);
    }
    case 'departures_at_stop': {
      const stopId = reqStr(args, 'stop_id', '"s-9q8yvz3w7-..."');
      const params = new URLSearchParams({ apikey: apiKey });
      if (args.service_date) params.set('service_date', String(args.service_date));
      if (args.start_time) params.set('start_time', String(args.start_time));
      if (args.end_time) params.set('end_time', String(args.end_time));
      return tlGet(`/stops/${encodeURIComponent(stopId)}/departures.json?${params}`);
    }
    case 'list_feeds': {
      const params = new URLSearchParams({
        apikey: apiKey,
        spec: String(args.spec ?? 'gtfs'),
        limit: String(Math.min(100, Math.max(1, (args.limit as number) ?? 20))),
      });
      return tlGet(`/feeds.json?${params}`);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function buildSearch(apiKey: string, args: Record<string, unknown>, extras: string[]) {
  const params = new URLSearchParams({
    apikey: apiKey,
    limit: String(Math.min(100, Math.max(1, (args.limit as number) ?? 20))),
  });
  if (args.lat !== undefined && args.lon !== undefined) {
    params.set('lat', String(args.lat));
    params.set('lon', String(args.lon));
    params.set('radius', String((args.radius_m as number) ?? 100));
  }
  for (const key of extras) {
    if (args[key] !== undefined && args[key] !== null) {
      params.set(key, String(args[key]));
    }
  }
  return params;
}

async function tlGet(path: string) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (res.status === 401) throw new Error('Transitland: unauthorized — check key');
  if (res.status === 429) throw new Error('Transitland: rate-limit (HTTP 429)');
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Transitland error: ${res.status} ${t.slice(0, 200)}`);
  }
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  }
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
