/**
 * 基于 axios 封装的请求模块
 */
import axios from 'axios'
import qs from 'qs'
import Vue from 'vue'
// axios()
// axios.get()
// axios.post()
//获取当前登陆用户信息
function getLoginUser() {
  var arr = document.cookie.match(new RegExp("(^| )_PS_Session_Token_Info_=([^;]*)(;|$)"));
  return arr && arr.length > 2 ? JSON.parse(decodeURIComponent(arr[2])) : null;
};
// 创建一个 axios 实例，说白了就是复制了一个 axios
// 我们通过这个实例去发请求，把需要的配置配置给这个实例来处理
const request = axios.create({
  baseURL: 'http://localhost:8080', // 请求的基础路径
})

// 请求拦截器
request.interceptors.request.use(
  // 任何所有请求会经过这里
  // config 是当前请求相关的配置信息对象
  // config 是可以修改的
  function (config) {
    const token = getLoginUser().Token;
    // 如果有登录用户信息，则统一设置 token
    if (config.method == 'post') {
      config.data.token = token?token:'';
       //使用qs转换post请求的data
      config.data = qs.stringify(config.data);
    }
    else if(config.method == 'get'){
      config.params.token =  token?token:'';
    }
    // 然后我们就可以在允许请求出去之前定制统一业务功能处理
    // 例如：统一的设置 token

    // 当这里 return config 之后请求在会真正的发出去
    return config
  },
  // 请求失败，会经过这里
  function (error) {
    return Promise.reject(error)
  }
)
// 响应拦截器
request.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    //console.log(response.data)
   let data = response.data;
    if(data.ErrorCode !== 0){
      Vue.prototype.$message.error(data.Message);
      return Promise.reject(data.Message);
    }
    try {
      // 如果转换成功，则直接把结果返回
      data=data.Data;
      if (data.error_respone) {
        var msg = data.error_respone.Msg;
        if (typeof (msg) != "undefined" && msg != null && (msg.indexOf("未登陆") > -1 || msg.indexOf("未登录") > -1)) {
          // $.psEnv.doReLogin($.psEnv.doLoginSuccess);
          return false;
        }
        else {
          Vue.prototype.$message.error(msg);
          return false;
        }
      }
      return data;
    } catch (err) {
      // 如果转换失败了，则进入这里
      // 我们在这里把数据原封不动的直接返回给请求使用
      return data
    }
  }, function (error) {
    // 对响应错误做点什么
    Vue.prototype.$message({
      showClonse:true,
      type:'error',
      message:error.response.data.errMsg
    })
    return Promise.reject(error);
  });
// 导出请求方法
export default request

// 谁要使用谁就加载 request 模块
// import request from 'request.js'
// request.xxx
// request({
//   method: ,
//   url: ''
// })