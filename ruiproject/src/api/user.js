// 封装用户相关请求模块

import request from "@/utils/request";

// 用户登录
export const login = user => {
    return request({
        method: "post",
        url: "/mp/v1_0/authorizations",
        // data 用来设置post请求体
        data: user,
    })
}

// 获取用户信息

export const getUserInfo = () => {

}
// 修改用户信息
export const updateUser = () => {

}