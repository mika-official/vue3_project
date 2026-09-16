import request from '@/utils/http'
import httpLocal from '@/utils/http-local'

// 登录走本地后端：本地接口参数名为 username，响应结构为 { status, message, data: { token, userInfo } }
export const loginApi = ({ account, password }) => {
  return httpLocal({
    method: 'POST',
    url: '/api/login',
    data:{
        username: account,
        password
    }
  })
}

export const getLikeListAPI = ({ limit = 4 }) => {
  return request({
    url: '/goods/relevant',
    params: {
      limit
    }
  })
}