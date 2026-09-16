import httpLocal from '@/utils/http-local';

// 获取买家订单列表（本地后端路径为 /order/list）
export const getUserOrder = (params) => {
  return httpLocal({
    url: '/order/list',
    method: 'GET',
    params
  })
}
