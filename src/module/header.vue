<script setup>
import { ref, defineModel } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
const request = ref({})

const radioType = defineModel({ default: 1 })
const searchName = defineModel('searchName')
const emit = defineEmits(['refresh', 'input'])

function refresh() {
  emit('refresh')
}

function handleInput() {
  emit('input')
}
</script>
<template>
  <div class="header">
    <h1 style="color: rgba(0, 0, 0, 0.7)">数据监控</h1>
    <div style="margin: 10px 0" class="top">
      <el-radio-group size="large" v-model="radioType">
        <el-radio-button label="美团" :value="1" />
        <el-radio-button label="饿了么" :value="2" />
      </el-radio-group>
      <el-input
        v-model="searchName"
        @input="handleInput"
        placeholder="请输入商铺名称"
        style="width: 260px"
      ></el-input>
      <!-- <el-button @click="refresh" type="success" :icon="Refresh" size="large">刷新</el-button> -->
    </div>
  </div>
</template>

<style>
.header {
  padding: 0 20px;
}
.top {
  display: flex;
  gap: 10px;
}
.date {
  font-size: 18px;
  color: rgba(0, 0, 0, 0.8);
}
</style>
