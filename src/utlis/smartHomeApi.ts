import axios from 'axios'

export interface SmartDevice {
  id: string
  name: string
  room: string
  type: string
  online: boolean
  config: Record<string, string | number>
}

export interface SmartScene {
  id: string
  name: string
  config?: unknown
}

export interface SmartAlert {
  id: string
  message: string
  createdAt: string
}

type ApiRecord = Record<string, unknown>
type ApiResponse = { data?: unknown }

const client = axios.create({
  baseURL: (process.env.VUE_APP_SMARTHOME_API_BASE_URL || '').replace(/\/$/, ''),
  timeout: 10000,
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = token
  return config
})

function payload(response: ApiResponse): unknown {
  const body = response?.data
  if (body && typeof body === 'object' && 'data' in body) return (body as ApiRecord).data
  return body
}

function asArray(value: unknown): ApiRecord[] {
  if (Array.isArray(value)) return value.filter((item): item is ApiRecord => Boolean(item && typeof item === 'object'))
  if (value && typeof value === 'object') {
    const record = value as ApiRecord
    if (Array.isArray(record.items)) return asArray(record.items)
    if (Array.isArray(record.list)) return asArray(record.list)
  }
  return []
}

function valueOf(record: ApiRecord, ...keys: string[]): unknown {
  for (const key of keys) if (record[key] !== undefined && record[key] !== null) return record[key]
  return undefined
}

function textValue(record: ApiRecord, fallback: string, ...keys: string[]): string {
  const value = valueOf(record, ...keys)
  return value === undefined ? fallback : String(value)
}

function houseId(): string {
  return localStorage.getItem('houseid') || ''
}

function asBoolean(value: unknown): boolean {
  if (typeof value === 'string') return !['false', '0', 'offline', 'inactive'].includes(value.trim().toLowerCase())
  return Boolean(value)
}

export async function fetchDevices(): Promise<SmartDevice[]> {
  const response = await client.post('/api/api/devices/get', new URLSearchParams({ houseId: houseId() }))
  return asArray(payload(response)).map((item, index) => ({
    id: textValue(item, String(index), 'deviceId', 'device_id', 'id'),
    name: textValue(item, 'Unnamed device', 'deviceName', 'device_name', 'name'),
    room: textValue(item, 'Other', 'deviceLocation', 'device_location', 'roomName', 'room'),
    type: textValue(item, 'unknown', 'deviceType', 'device_type', 'type'),
    online: asBoolean(valueOf(item, 'isActive', 'is_active', 'online', 'status')),
    config: (valueOf(item, 'deviceConfig', 'device_config', 'config') as Record<string, string | number> | undefined) ?? {},
  }))
}

export async function fetchScenes(): Promise<SmartScene[]> {
  const response = await client.post('/api/api/scenes/search', new URLSearchParams({ houseId: houseId() }))
  return asArray(payload(response)).map((item, index) => ({
    id: textValue(item, String(index), 'sceneId', 'scene_id', 'id'),
    name: textValue(item, 'Unnamed scene', 'sceneName', 'scene_name', 'name'),
    config: valueOf(item, 'sceneConfig', 'scene_config'),
  }))
}

export async function fetchAlerts(): Promise<SmartAlert[]> {
  const end = new Date()
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000)
  const response = await client.post('/api/api/alerts/get', {
    startTime: start.toISOString().slice(0, 19).replace('T', ' '),
    endTime: end.toISOString().slice(0, 19).replace('T', ' '),
  })
  return asArray(payload(response)).map((item, index) => ({
    id: textValue(item, String(index), 'alertId', 'alert_id', 'id'),
    message: textValue(item, 'Alert', 'alertMessage', 'message', 'title'),
    createdAt: textValue(item, '', 'createdAt', 'created_at', 'time'),
  }))
}

export async function fetchVisitors(): Promise<SmartAlert[]> {
  const response = await client.post('/api/api/home/guest/search', new URLSearchParams({ houseId: houseId() }))
  return asArray(payload(response)).map((item, index) => ({
    id: textValue(item, String(index), 'guestId', 'guest_id', 'id'),
    message: textValue(item, 'Guest', 'guestName', 'guest_name', 'name'),
    createdAt: textValue(item, '', 'createdAt', 'created_at', 'time'),
  }))
}
