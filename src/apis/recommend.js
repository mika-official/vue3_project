import httpLocal from "@/utils/http-local";

// 本地内容推荐（类目关联 + 热门兜底）
// 路由挂在根路径（非 /api），否则 JWT 豁免会让 req.auth 永远 undefined，
// 登录态推荐分支不会生效；挂根路径后未登录请求走热门兜底，不报 401
// 后端响应：{ code, msg, result: { source, items: [...] } }
// 这里把 result.items 归一化为数组，方便复用 HomeHot 组件（其按 res.result 直接 v-for）
export const getRecommendAPI = async (params = {}) => {
  const res = await httpLocal({
    url: "/recommend",
    method: "GET",
    params,
  });
  return { ...res, result: res?.result?.items || [] };
};

// PyTorch 双塔模型在线演示（代理 recservice）
export const getRecommendDemoAPI = async (params = {}) => {
  const res = await httpLocal({
    url: "/recommend/demo",
    method: "GET",
    params,
  });
  return { ...res, result: res?.result?.items || [] };
};
