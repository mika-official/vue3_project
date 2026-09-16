<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMerchantStore } from '@/stores/merchantStore'
import { ElMessage } from 'element-plus'

const router = useRouter()
const merchantStore = useMerchantStore()

const form = ref({ account: '', password: '' })
const loading = ref(false)

const submit = async () => {
  if (!form.value.account || !form.value.password) {
    ElMessage.warning('请填写账号和密码')
    return
  }
  loading.value = true
  try {
    await merchantStore.login(form.value)
    ElMessage.success('登录成功')
    router.push('/merchant/dashboard')
  } catch (e) {
    // 错误提示已由拦截器统一处理
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="merchant-login">
    <div class="login-card">
      <h2>商家后台登录</h2>
      <el-input
        v-model="form.account"
        placeholder="账号"
        prefix-icon="User"
        @keyup.enter="submit"
      />
      <el-input
        v-model="form.password"
        type="password"
        placeholder="密码"
        prefix-icon="Lock"
        show-password
        @keyup.enter="submit"
      />
      <el-button type="primary" :loading="loading" @click="submit" class="login-btn">
        登 录
      </el-button>
      <p class="tip">账号：admin / 密码：123456</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.merchant-login {
  min-height: 100vh;
  background: #001529;
  display: flex;
  align-items: center;
  justify-content: center;

  .login-card {
    width: 360px;
    background: #fff;
    padding: 40px 30px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

    h2 {
      text-align: center;
      margin-bottom: 30px;
      color: #333;
    }

    .el-input {
      margin-bottom: 18px;
      height: 42px;
    }

    .login-btn {
      width: 100%;
      height: 42px;
      font-size: 16px;
    }

    .tip {
      text-align: center;
      color: #999;
      font-size: 12px;
      margin-top: 16px;
    }
  }
}
</style>
