<template>
  <div class="visitor-card">
    <div class="visitor-card-header">
      <span class="visitor-card-title">Visitor records</span>
    </div>
    <div class="visitor-card-body">
      <div v-if="props.visitors.length" class="visitor-table-wrap">
        <table class="visitor-table">
          <thead>
            <tr><th>#</th><th>Guest</th><th>Visit time</th></tr>
          </thead>
          <tbody>
            <tr v-for="(visitor, index) in props.visitors" :key="`${visitor.name}-${visitor.time}-${index}`">
              <td>{{ index + 1 }}</td>
              <td>{{ visitor.name }}</td>
              <td>{{ visitor.time || '--' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="visitor-empty">No visitor records returned by the API.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

interface Visitor {
  name: string;
  time: string;
}

const props = defineProps<{
  visitors: Visitor[];
}>();
</script>

<style scoped>
.visitor-card {
  width: 100%;
  height: 100%;
  background: rgba(14,252,255,0.08);
  border-radius: 8px;
  box-shadow: 0 2px 16px 0 rgba(0,0,0,0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.visitor-card-header {
  height: 38px;
  background: linear-gradient(90deg, rgba(14,252,255,0.18) 0%, rgba(4,84,137,0.18) 100%);
  display: flex;
  align-items: center;
  padding-left: 18px;
  border-bottom: 1px solid rgba(14,252,255,0.18);
}
.visitor-card-title {
  color: #00fbff;
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 2px;
}
.visitor-card-body {
  flex: 1;
  padding: 12px 16px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
}
.visitor-table-wrap {
  width: 100%;
  align-self: stretch;
}
.visitor-table {
  width: 100%;
  border-collapse: collapse;
  color: #e6f7ff;
  font-size: 13px;
}
.visitor-table th,
.visitor-table td {
  padding: 10px 8px;
  border-bottom: 1px solid rgba(14, 251, 255, 0.2);
  text-align: left;
}
.visitor-table th {
  color: #0efcff;
  background: rgba(14, 252, 255, 0.12);
  font-weight: 600;
}
.visitor-table tr:nth-child(even) td {
  background: rgba(0, 59, 81, 0.22);
}
.visitor-empty {
  color: #8bb1c6;
  font-size: 13px;
}
</style>
