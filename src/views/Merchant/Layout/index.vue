<script setup>
import { RouterView, useRouter, useRoute } from 'vue-router'
import { useMerchantStore } from '@/stores/merchantStore'
import { ElMessage } from 'element-plus'
import { computed } from 'vue'
// 局部注册图标（项目未全局注册 Element Plus 图标）
import { DataLine, Goods, Document, ArrowDown } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const merchantStore = useMerchantStore()

const activeMenu = computed(() => route.path)

const menuItems = [
  { path: '/merchant/dashboard', title: '首页', icon: DataLine },
  { path: '/merchant/products', title: '商品管理', icon: Goods },
  { path: '/merchant/orders', title: '订单管理', icon: Document }
]

const handleSelect = (path) => {
  router.push(path)
}

const logout = () => {
  merchantStore.logout()
  ElMessage.success('已退出登录')
  router.push('/merchant/login')
}
</script>

<template>
  <div class="merchant-layout">
    <aside class="sidebar">
      <div class="logo">商家后台</div>
      <el-menu
        :default-active="activeMenu"
        @select="handleSelect"
        background-color="#001529"
        text-color="#b7b7b7"
        active-text-color="#ffffff"
      >
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>
      </el-menu>
    </aside>

    <div class="main">
      <header class="topbar">
        <span class="welcome">欢迎回来，{{ merchantStore.merchantInfo?.name || '商家' }}</span>
        <el-dropdown>
          <span class="user-trigger">
            <el-avatar :size="28">{{ (merchantStore.merchantInfo?.name || '商')[0] }}</el-avatar>
            <span>{{ merchantStore.merchantInfo?.account || 'admin' }}</span>
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </header>
      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped lang='scss'>
.merchant-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
}

.sidebar {
  width: 200px;
  background: #001529;
  flex-shrink: 0;

  .logo {
    height: 60px;
    line-height: 60px;
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    text-align: center;
    border-bottom: 1px solid #333;
  }

  .el-menu {
    border-right: none;
  }
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.topbar {
  height: 60px;
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

  .welcome {
    color: #666;
  }

  .user-trigger {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    color: #333;
  }
}

.content {
  flex: 1;
  padding: 20px;
  overflow: auto;
}
</style>
