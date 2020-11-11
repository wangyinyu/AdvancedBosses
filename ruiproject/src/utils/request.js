// 基于axios封装请求模块
import axios from 'axios';
// 创建一个axios实例
const request = axios.create({
    baseURL: 'http://ttapi.research.itcast.cn/'//请求的基础路径
})
// 请求拦截器

// 相应拦截器
// 导出请求
export default request