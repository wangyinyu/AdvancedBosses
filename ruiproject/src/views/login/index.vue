<template>
  <div class="login-container">
    <div class="login-head"></div>
    <el-form class="login-form" ref="form" :model="user">
      <el-form-item>
        <el-input v-model="user.mobile" placeholder="请输入手机号"></el-input>
      </el-form-item>

      <el-form-item>
        <el-input v-model="user.code" placeholder="请输入验证码"></el-input>
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="checked"
          >我已阅读并同意用户协议和隐私条款</el-checkbox
        >
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit" class="login-btn"
          >登录</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  name: "LoginIndex",
  components: {},
  props: {},
  data() {
    return {
      user: {
        mobile: "", //手机号
        code: "", //验证码
      },
      checked: false, //是否同意协议选中状态
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    onSubmit() {
      console.log("submit!");
    },
  },
};
</script>
<style lang="css" scoped>
.login-container {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: url("./login_bg.png") no-repeat;
  background-size: cover;
}
.login-form {
  background: #fff;
  padding: 50px;
  min-width: 300px;
}
.login-btn {
  width: 100%;
}
.login-head{
    width: 300px;
    height: 57px;
    background: url("./logo_1.jpg") no-repeat;
    background-size: 100% 100%;
    margin-bottom: 30px;
}
</style>