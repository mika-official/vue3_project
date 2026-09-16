import httpLocal from '@/utils/http-local'

// 获取订单预览信息（本地后端路径为 /order/pre）
export const getCheckInfoAPI = () => {
  return httpLocal({
    url: '/order/pre',
    method: 'GET'
  })
}

// 创建订单（本地后端路径为 /order/create）
export const createOrderAPI = (data) => {
  return httpLocal({
    url: '/order/create',
    method: 'POST',
    data
  })
}
