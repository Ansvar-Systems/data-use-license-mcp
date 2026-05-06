# Privacy

The Data Use License MCP is a stateless, read-only catalog server. It does not collect, store, or transmit personal data.

## What this MCP does not do

- It does not log queries to disk or to a remote sink.
- It does not record IP addresses, user agents, or session identifiers beyond the in-memory MCP transport state required to dispatch a single JSON-RPC call.
- It does not maintain a per-user profile, preference store, or analytics database.
- It does not call external services. All catalog data lives in the embedded SQLite database under `data/database.db` and is read at process start.

## What the MCP does emit

Tool responses contain only:
- Catalog data (license, terms, regime, or vendor-template metadata that was already public in the seeded sources).
- Per-response `_meta` (disclaimer, data age, jurisdiction).
- Per-record `_citation` (source URL, publisher, license code).

None of this is per-user. The same input yields the same output for any caller.

## Hosted access via Ansvar Gateway

When this MCP is reached through `gateway.ansvar.eu`, gateway-level access logs (auth events, request volume, billing) are governed by the Gateway's privacy notice, not this MCP's. The MCP itself does not see authentication context.

## Self-hosted operators

If you self-host this server, any application, network, or platform logging is your responsibility. The server itself writes only structured server-startup messages to stderr.

## Container hardening

The container runs read-only-friendly: non-root `nodejs` user (UID 1001), `cap_drop: ALL`, `no-new-privileges`, `pids_limit: 50`, embedded SQLite in `/app/data` (read-mostly; SQLite needs write access for WAL sidecars even on read-only opens). No persistent volumes are required for normal operation.
