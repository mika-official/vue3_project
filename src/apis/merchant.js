import httpLocal from '@/utils/http-local'

// ============ 伪登录：admin / 123456 直接进 ============
const mockDelay = (ms = 200) => new Promise(r => setTimeout(r, ms))

export const merchantLoginAPI = async ({ account, password }) => {
  await mockDelay()
  if (account === 'admin' && password === '123456') {
    return { data: { token: 'mock_merchant_token', userInfo: { id: 1, username: 'admin', name: '管理员' } } }
  }
  throw { response: { data: { message: '账号或密码错误' } } }
}

// ============ 商品管理（真实商品列表走 /api/goods，新增/删除 mock 兜底） ============
// 本地新增的商品（真实接口 401 时用），会合并到列表里显示
const localProducts = []

export const getMerchantProductsAPI = async (params = {}) => {
  try {
    // /api/goods 是公开接口（JWT 豁免 /api 路径），不需要登录
    const res = await httpLocal({ url: '/api/goods', method: 'GET' })
    let list = res?.data || res?.result || []
    // 合并本地新增的商品
    list = [...localProducts, ...list]
    if (params.keyword) list = list.filter(p => (p.name || '').includes(params.keyword))
    return { result: list, total: list.length }
  } catch (e) {
    let list = [...localProducts, ...mockProducts]
    if (params.keyword) list = list.filter(p => (p.name || '').includes(params.keyword))
    return { result: list, total: list.length }
  }
}

export const addProductAPI = async (data) => {
  try {
    return await httpLocal({ url: '/myGoods/add', method: 'POST', data, skipAuthRedirect: true })
  } catch (e) {
    // 401 兜底：加入本地数组，列表刷新时能看到
    localProducts.unshift({ ...data, id: Date.now() })
    return { code: 200, msg: '添加成功' }
  }
}

export const updateProductAPI = async (data) => {
  // 后端暂无修改接口，mock 更新前端内存
  await mockDelay(100)
  // 先从 localProducts 找，再从 mockProducts 找
  let p = localProducts.find(p => p.id === data.id)
  if (!p) p = mockProducts.find(p => p.id === data.id)
  if (p) Object.assign(p, data)
  return { code: 200, msg: '修改成功' }
}

export const deleteProductAPI = async (productId) => {
  try {
    return await httpLocal({ url: '/myGoods/delete', method: 'POST', data: { productId }, skipAuthRedirect: true })
  } catch (e) {
    // 从 localProducts 和 mockProducts 都删
    let idx = localProducts.findIndex(p => p.id === productId)
    if (idx > -1) localProducts.splice(idx, 1)
    idx = mockProducts.findIndex(p => p.id === productId)
    if (idx > -1) mockProducts.splice(idx, 1)
    return { code: 200, msg: '删除成功' }
  }
}

// ============ 订单管理（真实后端 /order/list，401 兜底 mock） ============
const mockOrders = [
  { id: 'ORD20250110001', goodsName: '测试商品 A', totalAmount: 198.0, count: 2, orderState: 1, buyer: 'user_001', createTime: '2025-01-10 11:23:00', payTime: '2025-01-10 11:25:00' },
  { id: 'ORD20250112002', goodsName: '测试商品 B', totalAmount: 199.0, count: 1, orderState: 2, buyer: 'user_002', createTime: '2025-01-12 15:00:00', payTime: '2025-01-12 15:02:00' },
  { id: 'ORD20250115003', goodsName: '测试商品 C', totalAmount: 119.8, count: 2, orderState: 3, buyer: 'user_003', createTime: '2025-01-15 10:10:00', payTime: '2025-01-15 10:11:00' }
]

export const getMerchantOrdersAPI = async (params = {}) => {
  try {
    // 走真实后端，用买家 token；skipAuthRedirect 标记 401 时不跳转
    return await httpLocal({ url: '/order/list', method: 'GET', params, skipAuthRedirect: true })
  } catch (e) {
    // 401 等错误，用 mock 数据兜底
    let list = mockOrders.slice()
    if (params.orderState) list = list.filter(o => o.orderState === Number(params.orderState))
    return { result: { items: list, counts: list.length } }
  }
}

export const getOrderDetailAPI = async (id) => {
  try {
    return await httpLocal({ url: `/order/payInfo/${id}`, method: 'GET', skipAuthRedirect: true })
  } catch (e) {
    const o = mockOrders.find(o => o.id === id)
    return { result: o || mockOrders[0] }
  }
}

export const shipOrderAPI = async (id) => {
  // 发货暂无后端接口，直接 mock
  await mockDelay(100)
  const o = mockOrders.find(o => o.id === id)
  if (o) o.orderState = 3
  return { code: 200, msg: '发货成功' }
}
