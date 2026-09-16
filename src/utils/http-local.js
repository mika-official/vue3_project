import axios from "axios";
import { ElMessage } from "element-plus";
import "element-plus/theme-chalk/el-message.css";
import { useUserStore } from "@/stores/user";
import { useMerchantStore } from "@/stores/merchantStore";
import { useRouter } from "vue-router";

// 本地后端（api_server）专用 axios 实例
const httpLocal = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 5000,
});

// 判断是否为商家后台接口
const isMerchantApi = (url) =>
  url && (url.startsWith("/myGoods") || url.startsWith("/merchant"));

// 请求拦截器
httpLocal.interceptors.request.use(
  (config) => {
    // 商家后台接口优先用商家 token
    if (isMerchantApi(config.url)) {
      const merchantStore = useMerchantStore();
      if (merchantStore.token) {
        config.headers.Authorization = `Bearer ${merchantStore.token}`;
      }
      return config;
    }
    // 其他接口用买家 token
    const userStore = useUserStore();
    if (userStore.userInfo.token) {
      config.headers.Authorization = `Bearer ${userStore.userInfo.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
httpLocal.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 标记了 skipAuthRedirect 的请求 401 时不弹提示不跳转，由 API 函数 catch 兜底
    if (error.response?.status === 401 && error.config?.skipAuthRedirect) {
      return Promise.reject(error);
    }
    const reqUrl = error.config?.url || "";
    // 商家后台接口（伪登录）401 时静默失败
    if (error.response?.status === 401 && isMerchantApi(reqUrl)) {
      return Promise.reject(error);
    }
    // 其他错误提示（本地后端有的接口用 message 字段，有的用 msg 字段）
    ElMessage({
      type: "warning",
      message:
        error.response?.data?.message ||
        error.response?.data?.msg ||
        "请求失败",
    });
    // 买家接口 401 → 清除买家 token，跳买家登录页
    if (error.response?.status === 401) {
      const userStore = useUserStore();
      const router = useRouter();
      userStore.clearUserInfo();
      router.push("/login");
    }
    return Promise.reject(error);
  },
);

export default httpLocal;
