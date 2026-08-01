const WebSocket = require('ws');
const mqtt = require('mqtt');

function parsePort(value, fallback) {
  const port = Number.parseInt(value || fallback, 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid port: ${value}`);
  }
  return port;
}

const WS_HOST = process.env.WS_HOST || '127.0.0.1';
const WS_PORT = parsePort(process.env.WS_PORT, 3001);
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://127.0.0.1:1883';
const MQTT_TOPIC = process.env.MQTT_TOPIC || 'kitchen/#';
const MQTT_OPTIONS = {
  clientId: process.env.MQTT_CLIENT_ID || `smart_home_proxy_${Math.random().toString(16).slice(2, 10)}`,
};

if (process.env.MQTT_USERNAME) {
  MQTT_OPTIONS.username = process.env.MQTT_USERNAME;
}
if (process.env.MQTT_PASSWORD) {
  MQTT_OPTIONS.password = process.env.MQTT_PASSWORD;
}

const wss = new WebSocket.Server({ host: WS_HOST, port: WS_PORT }, () => {
  console.log(`WebSocket server listening on ws://${WS_HOST}:${WS_PORT}`);
});

const mqttClient = mqtt.connect(MQTT_BROKER_URL, MQTT_OPTIONS);

mqttClient.on('connect', () => {
  console.log(`MQTT connected: ${MQTT_BROKER_URL}`);
  mqttClient.subscribe(MQTT_TOPIC, (err) => {
    if (err) {
      console.error('MQTT subscription failed:', err.message);
    } else {
      console.log(`MQTT subscribed: ${MQTT_TOPIC}`);
    }
  });
});

mqttClient.on('error', (err) => {
  console.error('MQTT error:', err.message);
});

mqttClient.on('message', (topic, message) => {
  const data = JSON.stringify({ topic, message: message.toString() });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
});

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  ws.on('message', (data) => {
    try {
      const payload = JSON.parse(data.toString());
      if (!payload || typeof payload.topic !== 'string' || payload.topic.length === 0 || payload.topic.length > 512) {
        throw new Error('topic must be a non-empty string of at most 512 characters');
      }
      if (payload.topic.includes('#') || payload.topic.includes('+')) {
        throw new Error('wildcard topics are not valid for publish operations');
      }
      if (typeof payload.message !== 'string' && typeof payload.message !== 'number' && typeof payload.message !== 'boolean') {
        throw new Error('message must be a string, number, or boolean');
      }
      mqttClient.publish(payload.topic, String(payload.message), (err) => {
        if (err) {
          console.error('MQTT publish failed:', err.message);
        }
      });
    } catch (err) {
      console.error('Invalid WebSocket message:', err.message);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

function shutdown() {
  wss.close(() => mqttClient.end(false, {}, () => process.exit(0)));
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
