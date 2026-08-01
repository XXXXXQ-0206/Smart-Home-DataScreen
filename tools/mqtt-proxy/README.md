# Smart-Home MQTT Proxy

English | [中文](README.zh-CN.md)

Small local bridge used by the Smart-Home data screen to communicate with a
development board through MQTT. It subscribes to board telemetry and broadcasts
the messages over WebSocket; browser clients can publish validated commands back
to MQTT.

## Architecture

```text
Smart-Home data screen <-> WebSocket (localhost:3001) <-> this bridge <-> MQTT broker <-> development board
```

## Requirements

- Node.js 18 or newer
- An MQTT broker reachable from the machine running the proxy

## Installation

```bash
npm install
copy .env.example .env   # Windows
```

Edit `.env` with the broker URL, topic filter, and credentials for your local
development broker. The published repository contains no real broker address or
credential.

## Usage

```bash
npm start
```

Telemetry received from the configured subscription is sent to every connected
WebSocket client as JSON:

```json
{"topic":"kitchen/temperature","message":"23.4"}
```

To publish a command, send a JSON object with a concrete MQTT topic (wildcards
are rejected) and a string, number, or boolean message:

```json
{"topic":"kitchen/light/set","message":"on"}
```

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `WS_HOST` | `127.0.0.1` | WebSocket bind address |
| `WS_PORT` | `3001` | WebSocket port |
| `MQTT_BROKER_URL` | `mqtt://127.0.0.1:1883` | Broker URL |
| `MQTT_TOPIC` | `kitchen/#` | Subscription filter |
| `MQTT_CLIENT_ID` | generated | MQTT client identifier |
| `MQTT_USERNAME` / `MQTT_PASSWORD` | empty | Optional broker credentials |

## Development

```bash
npm test
```

The test command performs a syntax check without connecting to a broker.

## Security and disclaimer

This project is provided **AS IS**, without warranties. You are responsible for
broker authentication, network isolation, authorization, and any commands sent
to connected devices. Do not use it to control devices or networks without
permission, and do not expose the unauthenticated WebSocket endpoint publicly.

See [SECURITY.md](SECURITY.md) for the deployment boundary.

## License

MIT. See [LICENSE](LICENSE).
