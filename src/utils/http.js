import axios from 'axios'
import { ElMessage } from 'element-plus'
import 'element-plus/theme-chalk/el-message.css'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

// 创建axios实例
// 注意：不要添加自定义请求头——自定义头会让浏览器发出 CORS 预检(OPTIONS)，
// 黑马接口的 WAF 对预检返回 405，导致所有请求被拦截
const httpInstance = axios.create({
  baseURL: 'https://pcapi-xiaotuxian-front-devtest.itheima.net',
  timeout: 5000
})

// 请求拦截器
// 注意：不要在这里附加 Authorization 头！
// 登录已改为走本地后端，userInfo.token 是本地签发的 JWT，黑马后端校验会返回"token校验失败"；
// 且 Authorization 不是简单请求头，附加后会让浏览器重新发起 CORS 预检。
// 需要鉴权的本地接口请走 utils/http-local.js（那里才会附加本地 token）。
httpInstance.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)


// 响应拦截器
httpInstance.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    // 错误提示（网络级失败时 error.response 为 undefined，需要可选链兜底）
    ElMessage({
      type: 'warning',
      message: error.response?.data?.message || '请求失败'
    })
    // 401 状态码，说明 token 失效，需要重新登录
    if (error.response?.status === 401) {
      // 清除失效的 token
      const userStore = useUserStore()
      const router = useRouter()
      userStore.clearUserInfo()
      // 跳转到登录页
      router.push('/login')
    }
    // 其他状态码，直接返回错误信息
    return Promise.reject(error)
  }
)

export default httpInstance