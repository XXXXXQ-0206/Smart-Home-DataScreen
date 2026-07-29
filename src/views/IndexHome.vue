<template>
  <div class="dashboard-bg">
    <header class="dashboard-header">
      <div class="dashboard-header-inner">
        <button class="goback" type="button" aria-label="返回" @click="goBack">&lt;</button>
        <div class="dashboard-brand">
          <img src="@/assets/logo.png" alt="Smart-Home" />
          <div>
            <h1>Smart-Home Data Screen</h1>
            <p>Live telemetry from the Smart-Home API</p>
          </div>
        </div>
        <span class="status" :class="{ error: apiError }">{{ apiError || apiStatus }}</span>
      </div>
    </header>

    <main class="dashboard-main">
      <section class="summary-grid" aria-label="Overview">
        <article class="summary-card"><span>Online devices</span><strong>{{ onlineDeviceCount }}</strong></article>
        <article class="summary-card"><span>Total devices</span><strong>{{ devices.length }}</strong></article>
        <article class="summary-card"><span>Scenes</span><strong>{{ scenes.length }}</strong></article>
        <article class="summary-card"><span>Alerts (7 days)</span><strong>{{ alerts.length }}</strong></article>
      </section>

      <section class="main-grid">
        <article class="panel devices-panel">
          <div class="panel-heading"><h2>Devices by room</h2><span>{{ lastUpdated }}</span></div>
          <DeviceLine :device-list="deviceList" />
        </article>
        <article class="panel visitors-panel">
          <VisitorCarousel :visitors="visitors" />
        </article>
      </section>

      <section class="panel analytics-panel">
        <div class="panel-heading"><h2>Live device activity</h2><span>Computed from current API response</span></div>
        <EnergyPie :device-data="deviceActivityData" :room-data="roomActivityData" :power-trend="powerTrend" />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import DeviceLine from '@/components/DeviceLine.vue'
import EnergyPie from '@/components/EnergyPie.vue'
import VisitorCarousel from '@/components/VisitorCarousel.vue'
import { fetchAlerts, fetchDevices, fetchScenes, fetchVisitors, SmartAlert, SmartDevice, SmartScene } from '@/utlis/smartHomeApi'

const router = useRouter()
const devices = ref<SmartDevice[]>([])
const scenes = ref<SmartScene[]>([])
const alerts = ref<SmartAlert[]>([])
const visitors = ref<{ name: string; time: string }[]>([])
const apiStatus = ref('Connecting')
const apiError = ref('')
const lastUpdated = ref('--')
let refreshTimer: number | undefined

const deviceList = computed(() => {
  const groups = new Map<string, { name: string; devices: { name: string; online: boolean; config: Record<string, string | number> }[] }>()
  devices.value.forEach((device) => {
    const group = groups.get(device.room) || { name: device.room, devices: [] }
    group.devices.push({ name: device.name, online: device.online, config: device.config })
    groups.set(device.room, group)
  })
  return [...groups.values()]
})

const onlineDeviceCount = computed(() => devices.value.filter((device) => device.online).length)
const deviceActivityData = computed(() => {
  const counts = new Map<string, number>()
  devices.value.forEach((device) => counts.set(device.type, (counts.get(device.type) || 0) + (device.online ? 1 : 0)))
  return [...counts.entries()].map(([name, value]) => ({ name, value }))
})
const roomActivityData = computed(() => {
  const counts = new Map<string, number>()
  devices.value.forEach((device) => counts.set(device.room, (counts.get(device.room) || 0) + (device.online ? 1 : 0)))
  return [...counts.entries()].map(([name, value]) => ({ name, value }))
})
const powerTrend = computed(() => [{ date: new Date().toLocaleDateString(), total: onlineDeviceCount.value }])

async function loadData() {
  apiError.value = ''
  apiStatus.value = 'Refreshing'
  const results = await Promise.allSettled([fetchDevices(), fetchScenes(), fetchAlerts(), fetchVisitors()])
  const [deviceResult, sceneResult, alertResult, visitorResult] = results
  if (deviceResult.status === 'fulfilled') devices.value = deviceResult.value
  if (sceneResult.status === 'fulfilled') scenes.value = sceneResult.value
  if (alertResult.status === 'fulfilled') alerts.value = alertResult.value
  if (visitorResult.status === 'fulfilled') {
    visitors.value = visitorResult.value.map((item) => ({ name: item.message, time: item.createdAt }))
  }
  const failures = results.filter((result) => result.status === 'rejected')
  apiStatus.value = failures.length === results.length ? 'API unavailable' : 'Live'
  if (failures.length) apiError.value = `${failures.length} endpoint${failures.length > 1 ? 's' : ''} unavailable`
  lastUpdated.value = new Date().toLocaleTimeString()
}

function goBack() {
  router.back()
}

onMounted(() => {
  loadData()
  refreshTimer = window.setInterval(loadData, 30000)
})
onBeforeUnmount(() => {
  if (refreshTimer) window.clearInterval(refreshTimer)
})
</script>

<style scoped>
:global(html), :global(body), :global(#app) { margin: 0; min-height: 100%; background: #071426; }
.dashboard-bg { min-height: 100vh; color: #e6f7ff; background: radial-gradient(circle at 50% 0%, #123b5d 0%, #071426 55%, #030a12 100%); }
.dashboard-header { position: sticky; top: 0; z-index: 5; border-bottom: 1px solid rgba(112, 213, 255, .25); background: rgba(5, 17, 31, .86); backdrop-filter: blur(12px); }
.dashboard-header-inner { min-height: 82px; max-width: 1440px; margin: 0 auto; padding: 0 28px; display: flex; align-items: center; gap: 18px; }
.goback { border: 0; background: none; color: #9edffb; font-size: 28px; cursor: pointer; padding: 6px 10px; }
.dashboard-brand { display: flex; align-items: center; gap: 12px; flex: 1; }
.dashboard-brand img { width: 42px; height: 42px; border-radius: 10px; object-fit: cover; }
h1, h2, p { margin: 0; }
h1 { font-size: 20px; letter-spacing: .03em; }
.dashboard-brand p { margin-top: 4px; color: #8bb1c6; font-size: 12px; }
.status { color: #6ee7b7; font-size: 13px; border: 1px solid rgba(110, 231, 183, .35); border-radius: 999px; padding: 6px 12px; }
.status.error { color: #fda4af; border-color: rgba(253, 164, 175, .4); }
.dashboard-main { max-width: 1440px; margin: 0 auto; padding: 26px 28px 42px; }
.summary-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.summary-card, .panel { border: 1px solid rgba(115, 202, 255, .22); background: rgba(10, 33, 54, .7); box-shadow: 0 10px 30px rgba(0,0,0,.22); }
.summary-card { padding: 18px 20px; border-radius: 10px; display: flex; flex-direction: column; gap: 12px; }
.summary-card span { color: #8eb4c8; font-size: 13px; }
.summary-card strong { color: #c8f2ff; font-size: 30px; font-weight: 650; }
.main-grid { margin-top: 16px; display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
.panel { border-radius: 12px; padding: 16px; }
.devices-panel { min-height: 410px; }
.visitors-panel { min-height: 410px; padding: 0; overflow: hidden; }
.panel-heading { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 12px; }
.panel-heading h2 { font-size: 16px; color: #d6f6ff; }
.panel-heading span { color: #7297aa; font-size: 12px; }
.analytics-panel { margin-top: 16px; }
@media (max-width: 900px) {
  .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .main-grid { grid-template-columns: 1fr; }
}
@media (max-width: 560px) {
  .dashboard-header-inner, .dashboard-main { padding-left: 16px; padding-right: 16px; }
  .summary-card strong { font-size: 24px; }
  .status { display: none; }
}
</style>
