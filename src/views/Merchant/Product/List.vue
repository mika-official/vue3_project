<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getMerchantProductsAPI, addProductAPI, updateProductAPI, deleteProductAPI } from '@/apis/merchant.js'
import { ElMessage, ElMessageBox } from 'element-plus'

const list = ref([])
const total = ref(0)
const loading = ref(false)
const query = reactive({ keyword: '', page: 1, pageSize: 10 })

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getMerchantProductsAPI(query)
    list.value = res.result || []
    total.value = res.total || 0
  } catch (e) {}
  finally {
    loading.value = false
  }
}

onMounted(fetchList)

const handleDelete = (row) => {
  if (!row.id) {
    ElMessage.warning('该商品缺少 ID，无法删除')
    return
  }
  ElMessageBox.confirm(`确定删除商品「${row.name}」？`, '提示', { type: 'warning' })
    .then(async () => {
      await deleteProductAPI(row.id)
      ElMessage.success('删除成功')
      fetchList()
    }).catch(() => {})
}

// 新增 / 编辑弹窗
const dialogVisible = ref(false)
const isEdit = ref(false)
const editForm = ref({})

const openAdd = () => {
  isEdit.value = false
  editForm.value = { name: '', price: 0, stock: 0, picture: '', desc: '' }
  dialogVisible.value = true
}

const openEdit = (row) => {
  isEdit.value = true
  editForm.value = { ...row }
  dialogVisible.value = true
}

const save = async () => {
  if (!editForm.value.name) {
    ElMessage.warning('请填写商品名称')
    return
  }
  try {
    if (isEdit.value) {
      await updateProductAPI(editForm.value)
      ElMessage.success('修改成功')
    } else {
      await addProductAPI(editForm.value)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchList()
  } catch (e) {}
}

const pageChange = (p) => {
  query.page = p
  fetchList()
}
</script>

<template>
  <div class="product-page">
    <div class="toolbar">
      <el-input v-model="query.keyword" placeholder="商品名称" clearable style="width:200px" @keyup.enter="fetchList" />
      <el-button type="primary" @click="fetchList">查询</el-button>
      <el-button type="success" @click="openAdd">新增商品</el-button>
    </div>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="id" label="ID" width="120" />
      <el-table-column label="图片" width="100">
        <template #default="{ row }">
          <el-image :src="row.picture" style="width:50px;height:50px" fit="cover" />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="商品名称" min-width="120" />
      <el-table-column label="价格" width="100">
        <template #default="{ row }">¥{{ row.price }}</template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="80" />
      <el-table-column prop="desc" label="描述" min-width="150" show-overflow-tooltip />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑商品' : '新增商品'" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="editForm.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="库存">
          <el-input-number v-model="editForm.stock" :min="0" />
        </el-form-item>
        <el-form-item label="图片">
          <el-input v-model="editForm.picture" placeholder="图片URL" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.desc" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.product-page {
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
}
</style>
