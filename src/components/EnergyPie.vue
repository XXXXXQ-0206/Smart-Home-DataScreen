<template>
  <div class="energy-pie-chart-row">
    <div class="energy-pie-chart-main">
      <div class="chart-header">
        <button :class="{active: chartType==='device'}" @click="chartType='device'">Device activity</button>
        <button :class="{active: chartType==='room'}" @click="chartType='room'">Room activity</button>
      </div>
      <div ref="chartRef" class="pie-chart"></div>
    </div>
    <div class="energy-pie-chart-line">
      <div class="line-chart-title">Current online devices</div>
      <div ref="lineChartRef" class="line-chart"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, nextTick, defineProps } from 'vue';
import * as echarts from 'echarts';

type TrendPoint = { date: string; total: number; [room: string]: string | number };

const props = defineProps({
  deviceData: {
    type: Array,
    required: true
  },
  roomData: {
    type: Array,
    required: true
  },
  powerTrend: {
    type: Array,
    required: true
  }
});

const chartRef = ref<HTMLDivElement | null>(null);
const lineChartRef = ref<HTMLDivElement | null>(null);
const chartType = ref<'device' | 'room'>('device');

let chartInstance: echarts.ECharts | null = null;
let lineChartInstance: echarts.ECharts | null = null;

function renderChart() {
  if (!chartRef.value) return;
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value);
  }
  const data = chartType.value === 'device' ? props.deviceData : props.roomData;
  chartInstance.setOption({
    tooltip: { trigger: 'item' },
    legend: {
      top: 5,
      left: 'center',
      textStyle: {
        color: '#fff',
        fontSize: 16
      }
    },
    series: [
      {
        name: chartType.value === 'device' ? '设备能源消耗' : '房间能源消耗',
        type: 'pie',
        radius: ['35%', '70%'],
        center: ['50%', '55%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 5, borderColor: '#fff', borderWidth: 1.5 },
        label: {
          show: true,
          position: 'outside',
          color: '#fff',
          fontSize: 16
        },
        emphasis: { label: { show: true, fontSize: 18, fontWeight: 'bold', color: '#3fa7ff' } },
        labelLine: { show: true, lineStyle: { color: '#fff' } },
        data
      }
    ]
  });
}

function renderLineChart() {
  if (!lineChartRef.value) return;
  if (!lineChartInstance) {
    lineChartInstance = echarts.init(lineChartRef.value);
  }
  const trend = props.powerTrend as TrendPoint[] || [];
  if (!trend.length) {
    lineChartInstance.clear();
    return;
  }
  const dates = trend.map((item) => item.date);
  // 获取所有房间名（除date和total外的key）
  const roomNames = Object.keys(trend[0] as object).filter(k => k !== 'date' && k !== 'total');
  const series = [
    {
      name: '总耗电',
      type: 'line',
      data: trend.map((item) => item.total),
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { width: 3 },
      itemStyle: { color: '#3fa7ff' }
    },
    ...roomNames.map(room => ({
      name: room,
      type: 'line',
      data: trend.map((item) => item[room]),
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 2, type: 'dashed' },
      itemStyle: { color: undefined }
    }))
  ];
  lineChartInstance.setOption({
    tooltip: { trigger: 'axis' },
    legend: {
      top: 5,
      left: 'center',
      textStyle: { color: '#fff', fontSize: 14 }
    },
    grid: { left: 30, right: 20, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { color: '#fff', fontSize: 13 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#fff', fontSize: 13 }
    },
    series
  });
}

watch(chartType, () => {
  nextTick(() => renderChart());
});

watch(() => props.powerTrend, () => {
  nextTick(() => renderLineChart());
});

onMounted(() => {
  renderChart();
  renderLineChart();
});

</script>

<style scoped>
.energy-pie-chart-row {
  display: flex;
  width: 100%;
  max-width: 100%;
  height: 291px;
  background: none;
  overflow: hidden;
  justify-content: space-between;
  align-items: center;
}
.energy-pie-chart-main {
  min-width:330px;
  width:33%;
  height:100%;
  display: flex;
  flex-direction: column;
  padding-top:8px;
}
.energy-pie-chart-line {
  width:40%;
  height:100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: center;
  justify-content: center;
}
.line-chart-title {
  color: #fff;
  font-size: 16px;
  margin-top:10px;
  margin-bottom: 6px;
  text-align: center;
}
.line-chart {
  width: 100%;
  height: 100%;
  background: none;
}
.energy-pie-chart-side {
  width: 33%;
  height:100%;
  background: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: top;

  padding:5px;
}
.chart-header {
  display: flex;
  justify-content: center;
  margin-bottom: 5px;
}
.chart-header button {
  background: #24345c;
  color: #fff;
  border: none;
  padding: 7px 12px;
  margin-right: 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  transition: background 0.2s;
}
.chart-header button.active {
  background: #3fa7ff;
  color: #fff;
}
.pie-chart {
  width: 100%;
  height: 240px;
}
.ai-suggestion {
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 让子元素靠上对齐 */
  justify-content: flex-start; 
}
.ai-btn {
  margin-top: 0;
  height:40px;
  background: linear-gradient(135deg, #66e0f02e 0%, #6bc6ff2c 100%);
  color: #fff;
  border: none;
  border-radius: 9px 9px 0 0;
  cursor: pointer;
  font-size: 15px;
  transition: background 0.2s;
  width: 100%;
  text-align: left;
  padding-left: 20px;
  box-sizing: border-box;
}
.ai-btn:disabled {
  background: #0850816e;
  cursor: not-allowed;
}
.suggestion-content {
  flex: 1 1 auto;
  margin: 0;
  margin-top:10px;
  margin-left:20px;
  margin-right:20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow-y: auto;
  max-height: 100%;
  scrollbar-width: none; /* Firefox 隐藏滚动条 */
  -ms-overflow-style: none; /* IE and Edge 隐藏滚动条 */
}
.suggestion-content::-webkit-scrollbar {
  display: none; /* Chrome/Safari 隐藏滚动条 */
}
.suggestion-result {
  margin-top: 0px;
  width: 100%;
  height: 100%;
  min-height: 0;
  background: linear-gradient(135deg, #00e1ff3c 0%, #009dff23 100%);
  color: #fff;
  border-radius: 10px;
  /* 移除max-height限制 */
  font-size: 15px;
  word-break: break-all;
  box-shadow: 0 2px 12px 0 rgba(63,167,255,0.10);
  border: 1.5px solid #3fa7ff44;
  position: relative;
  transition: box-shadow 0.2s;
  text-align: left;
  display: flex;
  flex-direction: column;
}
.suggestion-result strong {
  display: block;
  font-size: 16px;
  color: #3fa7ff;
  margin-bottom: 6px;
  font-weight: 600;
  letter-spacing: 0.05em;
  
}
.suggestion-result p {
  margin: 0;
  line-height: 1.7;
  letter-spacing: 0.01em;
  /* color 由行内样式控制 */
}
</style>
