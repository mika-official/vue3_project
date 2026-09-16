import { defineStore } from "pinia";
import { ref } from "vue";
import { merchantLoginAPI } from "@/apis/merchant.js";

export const useMerchantStore = defineStore(
  "merchant",
  () => {
    const merchantInfo = ref({});
    const token = ref("");

    const login = async ({ account, password }) => {
      // 伪登录：admin / 123456 直接进
      const res = await merchantLoginAPI({ account, password });
      const { token: t, userInfo: info } = res.data;
      token.value = t;
      merchantInfo.value = {
        ...info,
        name: info.name || info.username,
        account: info.username,
      };
      return res;
    };

    const logout = () => {
      merchantInfo.value = {};
      token.value = "";
    };

    return { merchantInfo, token, login, logout };
  },
  {
    persist: true,
  },
);
