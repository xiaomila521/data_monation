<script setup>
import Header from './module/header.vue'
import { ref, watch } from 'vue'
import { getMTALLListApi, getMTItemInfoApi, getEleAllListApi, getItemEleInfoApi } from './api/index'
import json_data from '../public/index.json'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'

const radioType = ref(1) // 1 美团 2 饿了么
const searchName = ref()
let wmPoiIds = ref([])
let allList = ref([])
const execTimeMT = ref(null)
const execTimeEle = ref(null)

// 获取数据
async function init() {
  // 更新执行时间
  switch (radioType.value) {
    case 1:
      wmPoiIds.value = []
      await getMTAllList()
      break
    case 2:
      infoList.value = []
      execTimeEle.value = new Date().getTime()
      break
    default:
    // 美团
  }
}

getMTAllList()
getEleAllList()

async function getMTAllList() {
  execTimeMT.value = new Date().getTime()
  try {
    const { data } = await getMTALLListApi()

    data.forEach((i) => {
      json_data.ids.forEach((x) => {
        if (i.wmPoiId === x.wmPoiId) {
          i.name = x.poiName
        }
      })
    })
    allList.value = data.map((item) => {
      return {
        ...item,
        name: item?.name,
        id: item.wmPoiId,
      }
    })
    wmPoiIds.value = allList.value

    if (allList.value.length) {
      await getBalance(allList.value)
      ElMessage({
        type: 'success',
        plain: true,
        message: '美团数据加载完毕',
      })
    }
  } catch (error) {
    console.log(error)
    ElMessage({
      type: 'error',
      message: error,
    })
  }
}

// 遍历店铺获取主账户余额
async function getBalance(list) {
  for (const [index, item] of list.entries()) {
    await new Promise((resolve) => setTimeout(resolve, 0))
    try {
      await fetchBalance(item, index)
    } catch (error) {
      console.log(error)
    }
  }
}

async function fetchBalance(item, index) {
  try {
    const { data } = await getMTItemInfoApi(item)
    if (data) {
      data.effect = {
        ...data.effect,
        clickRate: data.effect.clickRate + '%',
      }
      allList.value[index] = { ...allList.value[index], ...data }
      allList.value[index].primaryAccountBalance = data.primaryAccountBalance / 100
    }
  } catch (error) {
    console.log(error)
  } finally {
  }
}

function handleInput() {
  const q = searchName.value.trim().toLowerCase()
  if (radioType.value === 1) {
    if (!q) return (wmPoiIds.value = allList.value)
    wmPoiIds.value = allList.value.filter((i) => String(i.name).toLowerCase().includes(q))
  } else {
    if (!q) return (infoList.value = allInfoList.value)
    infoList.value = infoList.value.filter((i) => String(i.name).toLowerCase().includes(q))
  }
}

// timestamp: 支持毫秒或秒
function formatBeijingTime(timestamp, withSeconds = true) {
  const ts = String(timestamp).length === 10 ? Number(timestamp) * 1000 : Number(timestamp)
  const dt = new Date(ts)
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: withSeconds ? '2-digit' : undefined,
    hour12: false,
  }).format(dt)
}

// 饿了么
const infoList = ref([])
const allInfoList = ref([])
async function getEleAllList(params) {
  execTimeEle.value = new Date().getTime()
  try {
    const {
      result: { shopTreeNode },
    } = await getEleAllListApi()
    allInfoList.value = shopTreeNode.childList || []

    infoList.value = allInfoList.value
    if (allInfoList.value?.length) {
      await getBalanceEle(allInfoList.value)
      ElMessage({
        type: 'success',
        plain: true,
        message: '饿了么数据加载完毕',
      })
    }
  } catch (error) {
    console.log(error)
    ElMessage({
      type: 'error',
      message: error,
    })
  }
}

async function getBalanceEle(list) {
  for (const [index, item] of list.entries()) {
    await new Promise((resolve) => setTimeout(resolve, 0))
    try {
      await fetchBalanceEle(item, index)
    } catch (error) {
      console.log(error)
    }
  }
}

async function fetchBalanceEle(item, index) {
  try {
    const { result } = await getItemEleInfoApi(item)
    if (result?.totalCashYuan) {
      item.primaryAccountBalance = result?.totalCashYuan
    }
  } catch (error) {
    console.log(error)
    ElMessage({
      type: 'error',
      message: error,
    })
  }
}

// 导出 Excel 函数
function exportToExcel() {
  let data = []
  let filename = ''

  if (radioType.value === 1) {
    // 美团数据
    data = wmPoiIds.value.map((item, index) => ({
      序号: index + 1,
      ID: item.id,
      商铺名称: item.name || '',
      账户余额: item.primaryAccountBalance || 0,
      总推广花费: item.total || 0,
      总曝光量: item.effect?.showCount || 0,
      总进店量: item.effect?.clickCount || 0,
      进店率: item.effect?.clickRate || '0%',
    }))
    filename = `美团数据_${formatBeijingTime(execTimeMT.value, false).replace(/[:\s]/g, '_')}.xlsx`
  } else {
    // 饿了么数据
    data = infoList.value.map((item, index) => ({
      序号: index + 1,
      商铺名称: item.name || '',
      账户余额: item.primaryAccountBalance || 0,
    }))
    filename = `饿了么数据_${formatBeijingTime(execTimeEle.value, false).replace(/[:\s]/g, '_')}.xlsx`
  }

  // 创建工作簿
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '数据')

  // 设置列宽
  const colWidths = []
  if (radioType.value === 1) {
    colWidths.push(
      { wch: 8 },
      { wch: 20 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
    )
  } else {
    colWidths.push({ wch: 8 }, { wch: 30 }, { wch: 15 })
  }
  ws['!cols'] = colWidths

  // 导出文件
  XLSX.writeFile(wb, filename)

  ElMessage({
    type: 'success',
    message: '导出成功',
  })
}
</script>

<template>
  <div class="app-container">
    <Header
      v-model:searchName="searchName"
      v-model="radioType"
      @refresh="init"
      @input="handleInput"
    />
    <div class="content">
      <el-card style="margin-bottom: 10px; color: rgba(0, 0, 0, 0.7)">
        <div style="display: flex; justify-content: space-between; width: 100%">
          <div>
            <span>
              <!-- <span :style="{ color: radioType === 1 ? '#f8da0e' : '#409eff' }">{{
            radioType === 1 ? '美团' : '饿了么'
          }}</span> -->
              上一次刷新时间：{{
                radioType === 1 ? formatBeijingTime(execTimeMT) : formatBeijingTime(execTimeEle)
              }}</span
            >
          </div>
          <el-button type="primary" @click="exportToExcel" :icon="Download"> 导出 Excel </el-button>
        </div>
      </el-card>
      <el-table
        v-if="radioType === 1"
        border
        stripe
        :data="radioType === 1 ? wmPoiIds : []"
        max-height="800"
      >
        <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
        <el-table-column label="id" prop="id" width="160"></el-table-column>
        <el-table-column label="商铺名称" align="left" prop="name"></el-table-column>
        <el-table-column
          label="账户余额"
          align="center"
          prop="primaryAccountBalance"
        ></el-table-column>
        <el-table-column label="总推广花费" prop="total" align="center"></el-table-column>
        <el-table-column label="总曝光量" prop="effect.showCount" align="center"></el-table-column>
        <el-table-column label="总进店量" prop="effect.clickCount" align="center"></el-table-column>
        <el-table-column label="进店率" prop="effect.clickRate" align="center"></el-table-column>
      </el-table>
      <el-table border stripe max-height="800" v-if="radioType === 2" :data="infoList">
        <el-table-column label="序号" type="index" width="80" align="center"></el-table-column>
        <el-table-column label="商铺名称" prop="name" align="left"></el-table-column>
        <el-table-column
          label="账户余额"
          prop="primaryAccountBalance"
          align="center"
        ></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.content {
  padding: 0 20px;
  margin-top: 10px;
}
</style>
