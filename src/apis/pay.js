import httpLocal from '@/utils/http-local'

// 获取订单支付信息（本地后端路径为 /order/payInfo/:id）
export const getOrderAPI = (id) => {
  return httpLocal({
    url: `/order/payInfo/${id}`,
    method: 'GET',
  })
}
