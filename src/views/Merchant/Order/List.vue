<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getMerchantOrdersAPI, getOrderDetailAPI, shipOrderAPI } from '@/apis/merchant.js'
import { ElMessage, ElMessageBox } from 'element-plus'

const list = ref([])
const total = ref(0)
const loading = ref(false)
const query = reactive({ orderState: '', keyword: '', page: 1, pageSize: 10 })

// 订单状态：与买家端 UserOrder.vue 保持一致
const statusMap = { 1: '待付款', 2: '待发货', 3: '待收货', 4: '待评价', 5: '已完成', 6: '已取消' }
const statusTag = (s) => ({ 1: 'info', 2: 'warning', 3: 'primary', 4: '', 5: 'success', 6: 'danger' }[s] || '')

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getMerchantOrdersAPI(query)
    // 真实后端响应：{ result: { items: [...], counts: N } }
    list.value = res?.result?.items || res?.result || []
    total.value = res?.result?.counts || res?.total || 0
  } catch (e) {
    // 错误提示已由拦截器统一处理
  } finally {
    loading.value = false
  }
}
onMounted(fetchList)

// 详情弹窗
const detailVisible = ref(false)
const detail = ref(null)

const viewDetail = async (row) => {
  try {
    const res = await getOrderDetailAPI(row.id)
    // 兼容多种响应结构
    detail.value = res?.result || res?.data || row
    detailVisible.value = true
  } catch (e) {
    // 降级显示行内数据
    detail.value = row
    detailVisible.value = true
  }
}

const doShip = (row) => {
  ElMessageBox.confirm(`确定对订单「${row.id}」发货？`, '提示', { type: 'warning' })
    .then(async () => {
      try {
        await shipOrderAPI(row.id)
        ElMessage.success('发货成功')
        // 乐观更新：待发货 → 待收货
        row.orderState = 3
      } catch (e) {}
    }).catch(() => {})
}

// 页码变化
const pageChange = (p) => {
  query.page = p
  fetchList()
}
</script>

<template>
  <div class="order-page">
    <div class="toolbar">
      <el-input v-model="query.keyword" placeholder="订单号" clearable style="width:220px" @keyup.enter="fetchList" />
      <el-select v-model="query.orderState" placeholder="状态" clearable style="width:120px" @change="fetchList">
        <el-option v-for="(label, val) in statusMap" :key="val" :label="label" :value="Number(val)" />
      </el-select>
      <el-button type="primary" @click="fetchList">查询</el-button>
    </div>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="id" label="订单号" min-width="180" />
      <el-table-column label="商品" min-width="200">
        <template #default="{ row }">
          <div v-if="row.skus && row.skus.length">
            <span v-for="(s, i) in row.skus" :key="i">
              {{ s.name }}<span v-if="i < row.skus.length - 1">、</span>
            </span>
          </div>
          <span v-else>{{ row.goodsName || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="数量" width="80">
        <template #default="{ row }">
          {{ row.skus ? row.skus.reduce((s, x) => s + (x.quantity || 0), 0) : (row.count || '-') }}
        </template>
      </el-table-column>
      <el-table-column label="金额" width="100">
        <template #default="{ row }">¥{{ row.payMoney?.toFixed?.(2) ?? row.totalAmount ?? '-' }}</template>
      </el-table-column>
      <el-table-column prop="userId" label="买家" width="100">
        <template #default="{ row }">{{ row.userId || row.buyer || '-' }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.orderState || row.status)">
            {{ statusMap[row.orderState || row.status] || '-' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="下单时间" width="160" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="viewDetail(row)">详情</el-button>
          <el-button
            v-if="(row.orderState || row.status) === 2"
            size="small"
            type="primary"
            @click="doShip(row)"
          >
            发货
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination" v-if="total > query.pageSize">
      <el-pagination
        @current-change="pageChange"
        :current-page="query.page"
        :page-size="query.pageSize"
        :total="total"
        background
        layout="prev, pager, next"
      />
    </div>

    <el-dialog v-model="detailVisible" title="订单详情" width="600px">
      <el-descriptions v-if="detail" :column="2" border>
        <el-descriptions-item label="订单号">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusTag(detail.orderState || detail.status)">
            {{ statusMap[detail.orderState || detail.status] || '-' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ detail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ detail.payTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="支付金额">¥{{ detail.payMoney?.toFixed?.(2) ?? detail.totalAmount ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="运费">¥{{ detail.postFee?.toFixed?.(2) ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="买家" :span="2">{{ detail.userId || detail.buyer || '-' }}</el-descriptions-item>
      </el-descriptions>

      <div v-if="detail?.skus?.length" class="detail-skus">
        <h4>商品明细</h4>
        <el-table :data="detail.skus" border size="small">
          <el-table-column label="图片" width="70">
            <template #default="{ row }">
              <el-image :src="row.image" style="width:40px;height:40px" fit="cover" />
            </template>
          </el-table-column>
          <el-table-column prop="name" label="商品" min-width="150" />
          <el-table-column prop="attrsText" label="规格" min-width="120" />
          <el-table-column label="单价" width="80">
            <template #default="{ row }">¥{{ row.realPay?.toFixed?.(2) }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="60" />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.order-page {
  .toolbar {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
  }

  .pagination {
    margin-top: 16px;
    display: flex;
    justify-content: center;
  }

  .detail-skus {
    margin-top: 20px;

    h4 {
      margin-bottom: 12px;
    }
  }
}
</style>
