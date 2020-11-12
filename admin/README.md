# admin
## 项目文档参照黑马教育地址
```
https://www.yuque.com/lipengzhou/toutiao-publish-vue/ilz3gp
```
## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build

打包生成的dist目录不能直接访问：
dist 目录需要启动一个 HTTP 服务器来访问 (除非你已经将 publicPath 配置为了一个相对的值)，所以以 file:// 协议直接打开 dist/index.html 是不会工作的。在本地预览生产环境构建最简单的方式就是使用一个 Node.js 静态文件服务器，例如 serve：

# 安装一次就可以了，以后不需要重复安装，顶多升级重装
npm install -g serve


# dist 是运行 Web 服务根目录
serve -s dist


如果执行 serve -s dist 遇到报错的解决办法：

1.win+X键，使用管理员身份运行power shell

2.输入命令：set-executionpolicy remotesigned 即可
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
