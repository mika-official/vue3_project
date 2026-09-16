<script setup>
import { ref, onMounted } from 'vue'
import { getMerchantProductsAPI, getMerchantOrdersAPI } from '@/apis/merchant.js'
import { Goods, Document, Bell, Money } from '@element-plus/icons-vue'

const stats = ref({ productCount: 0, orderCount: 0, pendingShip: 0, totalSales: 0 })
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const [p, o] = await Promise.all([
      getMerchantProductsAPI(),
      getMerchantOrdersAPI()
    ])
    const products = p.result || []
    const orders = o?.result?.items || o?.result || []
    stats.value = {
      productCount: p.total ?? products.length,
      orderCount: orders.length,
      pendingShip: orders.filter(o => (o.orderState || o.status) === 2).length,
      totalSales: orders
        .filter(o => (o.orderState || o.status) >= 2)
        .reduce((s, o) => s + Number(o.payMoney || o.totalAmount || 0), 0)
        .toFixed(2)
    }
  } catch (e) {}
  finally {
    loading.value = false
  }
})

const cards = [
  { label: '商品总数', key: 'productCount', icon: Goods, color: '#409eff' },
  { label: '订单总数', key: 'orderCount', icon: Document, color: '#67c23a' },
  { label: '待发货', key: 'pendingShip', icon: Bell, color: '#e6a23c' },
  { label: '销售额', key: 'totalSales', prefix: '¥', icon: Money, color: '#f56c6c' }
]
</script>

<template>
  <div class="dashboard" v-loading="loading">
    <div class="cards">
      <div class="card" v-for="c in cards" :key="c.key">
        <div class="icon-wrap" :style="{ background: c.color }">
          <el-icon size="28"><component :is="c.icon" /></el-icon>
        </div>
        <div class="info">
          <p class="label">{{ c.label }}</p>
          <p class="value">{{ c.prefix }}{{ stats[c.key] }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.card {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .icon-wrap {
    width: 56px;
    height: 56px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }

  .label {
    color: #999;
    font-size: 14px;
  }

  .value {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin-top: 6px;
  }
}
</style>
