<template>
  <div class="device-line" ref="deviceLineRef">
    <template v-for="(room, idx) in showDeviceList" :key="room.name + idx">
      <div class="device-card" style="min-width: 220px; flex: 1 1 220px; max-width: 320px;box-sizing: border-box;" @click="showDetail(room)">
        <div class="room-title">{{ room.name }}</div>
        <div class="device-list">
          <template v-for="(dev, didx) in room.devices" :key="dev.name + didx">
            <div class="device-item">
              <span class="device-item-name">{{ dev.name }}</span>
              <span class="device-status-dot" :class="{ on: dev.online, off: !dev.online }"></span>
            </div>
          </template>
        </div>
      </div>
    </template>
    <template v-for="n in showEmptyCount" :key="'empty'+n">
      <div class="device-card-empty" style="min-width: 220px; flex: 1 1 220px; max-width: 320px;box-sizing: border-box;"></div>
    </template>
    <div v-if="detailRoom" class="device-detail-dialog-mask" @click.self="detailRoom = null">
      <div class="device-detail-dialog">
        <div class="device-detail-title">{{ detailRoom.name }} 设备详情</div>
        <ul class="device-detail-list">
          <li v-for="dev in detailRoom.devices" :key="dev.name">
            <span>{{ dev.name }}</span>
            <span class="device-status-dot" :class="{ on: dev.online, off: !dev.online }"></span>
            <span class="device-detail-status">{{ dev.online ? '开' : '关' }}</span>
            <span v-if="dev.config" class="device-detail-config">
              <template v-for="(val, key, idx) in dev.config" :key="key">
                <span class="config-item">{{ key }}:{{ val }}<span v-if="idx < Object.keys(dev.config).length - 1">，</span></span>
              </template>
            </span>
          </li>
        </ul>
        <button class="device-detail-close" @click="detailRoom = null">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, nextTick, defineProps } from 'vue';

interface Device {
  name: string;
  online: boolean;
  config?: {
    亮度?: string | number;
    温度?: string | number;
    电量?: string | number;
    墨量?: string | number;
    [key: string]: string | number | undefined;
  };
}
interface Room {
  name: string;
  devices: Device[];
}

const props = defineProps<{ deviceList: { name: string; devices: { name: string; online: boolean }[] }[] }>();
const deviceLineRef = ref<HTMLElement | null>(null);
const cardMinWidth = 220;
const cardGap = 20;
const cardPerRow = ref(5);

function calcCardPerRow() {
  nextTick(() => {
    const el = deviceLineRef.value;
    if (el) {
      const width = el.clientWidth;
      const n = Math.floor((width + cardGap) / (cardMinWidth + cardGap));
      cardPerRow.value = Math.max(1, n);
    }
  });
}

onMounted(() => {
  window.addEventListener('resize', calcCardPerRow);
  calcCardPerRow();
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', calcCardPerRow);
});

const showDeviceList = computed(() => props.deviceList);
const showEmptyCount = computed(() => {
  const total = props.deviceList.length;
  const perRow = cardPerRow.value;
  const mod = total % perRow;
  return mod === 0 ? 0 : perRow - mod;
});
const detailRoom = ref<Room|null>(null);
function showDetail(room: Room) {
  detailRoom.value = room;
}
</script>

<style scoped>
.device-line {
  height: 100%;
  overflow-y: auto;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  grid-auto-flow: column;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  margin: 0 auto;
  padding-bottom: 20px;
  padding-left: 20px;
  padding-right: 20px;
  border-radius: 8px;

}
.device-card {
  position: relative;
  min-height: 120px;
  height: 200px;
  background: rgba(255,255,255,0.08);
  border-radius: 16px;
  border: 1px solid rgba(90, 138, 234, 0.62);
  transition: box-shadow 0.2s, border-color 0.2s, transform 0.2s;
  display: flex;
  flex-direction: column;
  padding: 0 0 10px 0;
  &::before{
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 50px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    z-index: -1;
    border-bottom: 1px solid rgba(90, 138, 234, 0.62);
    border-radius: 16px 16px 0 0;
  }
  &:hover {
    border: 2px solid #359257;
    box-shadow: 0 8px 16px 0 rgba(34, 197, 94, 0.25);
    transform: scale(1.005);
    cursor: pointer;
    background: rgba(256, 256, 256, 0.2);
  }
}
.device-card-empty{
  background:none;
}
.room-title {
  font-size: 1.1rem;
  font-weight: bold;
  color: #fff;
  padding: 18px 0 8px 24px;
}
.device-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: 20px;
  padding-right: 16px;
  margin-top: 15px;
  max-height: 120px;
  overflow-y: auto;
}
.device-list::-webkit-scrollbar {
  width: 0 !important;
  background: transparent;
}
.device-list {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}
.device-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.98rem;
  color: #cbd5e1;
  background: rgba(255,255,255,0.03);
  border-radius: 6px;
  padding: 3px 10px 3px 0;
}
.device-item-name {
  flex: 1;
  color: #cbd5e1;
  padding-left: 5px;
}
.device-status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-left: 12px;
  background: #f87171;
  box-shadow: 0 0 6px #f87171;
  transition: background 0.2s, box-shadow 0.2s;
}
.device-status-dot.on {
  background: #4ade80;
  box-shadow: 0 0 8px #4ade80;
}
.device-status-dot.off {
  background: #f87171;
  box-shadow: 0 0 8px #f87171;
}
.device-line::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}
.device-line::-webkit-scrollbar-thumb {
  background: rgba(128,128,128,0.4);
  border-radius: 8px;
}
.device-detail-dialog-mask {
  position: fixed;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.35);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.device-detail-dialog {
  background: #0a223a;
  border-radius: 12px;
  min-width: 320px;
  max-width: 90vw;
  padding: 28px 32px 18px 32px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  color: #fff;
  position: relative;
  animation: fadeIn 0.2s;
}
.device-detail-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 18px;
  color: #0EFCFF;
}
.device-detail-list {
  list-style: none;
  padding: 0;
  margin: 0 0 18px 0;
  max-height: 400px;
  overflow-y: auto;
}
.device-detail-list::-webkit-scrollbar {
  width: 0 !important;
  background: transparent;
}
.device-detail-list {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}
.device-detail-list li {
  display: grid;
  grid-template-columns: 1.2fr 32px 40px 1.8fr;
  align-items: center;
  gap: 0;
  font-size: 1.08rem;
  padding: 7px 0;
  border-bottom: 1px solid rgba(14,252,255,0.08);
}
.device-detail-list li .device-item-name,
.device-detail-list li > span:first-child {
  justify-self: start;
}
.device-detail-list li .device-status-dot {
  justify-self: center;
}
.device-detail-list li .device-detail-status {
  justify-self: center;
}
.device-detail-list li .device-detail-config {
  justify-self: start;
  min-width: 60px;
}
.device-detail-status {
  color: #4ade80;
  font-size: 0.98rem;
}
.device-detail-list li .device-status-dot.off + .device-detail-status {
  color: #f87171;
}
.device-detail-close {
  margin-top: 8px;
  background: #0EFCFF;
  color: #0a223a;
  border: none;
  border-radius: 6px;
  padding: 6px 22px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.device-detail-close:hover {
  background: #38e6ff;
}
.device-detail-config {
  color: #ffd700;
  font-size: 0.95rem;
  margin-left: 8px;
  white-space: pre-wrap;
}
.config-item {
  margin-right: 2px;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}
</style>
