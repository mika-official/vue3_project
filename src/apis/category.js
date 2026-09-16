import request from '@/utils/http'

export function getCategoryAPI(id) {
  return request({
    method: 'GET',
    url: '/category',
    params: {
      id
    }
  })
}

export function getCategoryFilterAPI(id) {
  return request({
    method: 'GET',
    url: '/category/sub',
    params: {
      id
    }
  })
}

export function getSubCategoryAPI(data) {
  return request({
    method: 'POST',
    url: '/category/goods/temporary',
    data
  })
}

