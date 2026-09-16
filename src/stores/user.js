import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loginApi } from '@/apis/user.js'
import { useCartStore } from './cartStore.js'
import { mergeCartAPI } from '@/apis/cart.js'

// import { tr } from 'element-plus/es/locale'

export const useUserStore = defineStore('user', () => { 
  const cartStore = useCartStore()
  const userInfo = ref({})
  const getUserInfo = async ({ account, password }) => {
    const res = await loginApi({ account, password })
    // 本地后端登录响应：{ status, message, data: { token: 'Bearer xxx', userInfo } }
    // token 已带 Bearer 前缀，剥掉后存裸 token（请求拦截器会统一拼前缀）
    const { token, userInfo: info } = res.data
    userInfo.value = {
      ...info,
      account: info.username, // 本地字段叫 username，前端展示用 account
      token: token.replace(/^Bearer\s+/i, '')
    }
    // 登录成功后合并购物车（本地后端 selected 要求字符串类型）
    await mergeCartAPI(cartStore.cartList.map(item => {
      return {
        skuId: item.skuId,
        selected: String(item.selected),
        count: item.count
      }
    }))
    cartStore.updateCartList() // 获取最新购物车列表
  }
  const clearUserInfo = () => {
    // 清空用户信息
    userInfo.value = {}
    // 清空购物车
    cartStore.clearCart()
  }
    return { userInfo, getUserInfo, clearUserInfo }
},
{
  persist: true
})