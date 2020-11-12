<template>
  <div class="login-container">
    <div class="login-head"></div>
    <el-form class="login-form" ref="ruleForm" :model="user" :rules="formRules">
      <el-form-item prop="mobile">
        <el-input v-model="user.mobile" placeholder="请输入手机号"></el-input>
      </el-form-item>

      <el-form-item prop="code">
        <el-input v-model="user.code" placeholder="请输入验证码"></el-input>
      </el-form-item>
      <el-form-item prop="agree">
        <el-checkbox v-model="user.agree"
          >我已阅读并同意用户协议和隐私条款</el-checkbox
        >
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :loading="LoginLoading"
          @click="onLogin"
          class="login-btn"
          >登录</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { login } from "@/api/user";
export default {
  name: "LoginIndex",
  components: {},
  props: {},
  data() {
    return {
      user: {
        mobile: "", //手机号
        code: "", //验证码
        agree: false,
      },
      LoginLoading: false,
      formRules: {
        //表单验证规则配置
        mobile: [
          { required: true, message: "请输入手机号", trigger: "change" },
          {
            pattern: /^1[3|5|7|8|9]\d{9}$/,
            message: "请输入正确的手机号格式",
            trigger: "change",
          },
        ],
        code: [
          { required: true, message: "验证码不能为空", trigger: "blur" },
          { pattern: /^\d{6}$/, message: "请输入正确的验证码格式" },
        ],
        agree: [
          {
            validator: (rule, value, callback) => {
              if (value) {
                callback();
              } else {
                callback(new Error("请勾选同意用户协议"));
              }
            },
            // message: "请勾选同意用户协议",
            trigger: "change",
          },
        ],
      },
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    onLogin() {
      // const user = this.user;
      // 获取表单数据(根据接口数据绑定)  表单验证  验证通过则提交  处理后端相应结果
      this.$refs["ruleForm"].validate((pass) => {
        if (!pass) {
          return;
        }
        this.login();
      });
    },
    async login() {
      this.LoginLoading = true;

      // const loginInfo = await login(this.user);
      // console.log(loginInfo);
      // try {
      //   const loginInfo = await login(this.user);
      //   console.log(loginInfo);
      // } catch (error) {
      //   console.log(error);

      // }
      login(this.user)
        .then((res) => {
          console.log(res);
          this.$message({
            message: "登录成功",
            type: "success",
          });
          this.LoginLoading = false;
        })
        .catch((err) => {
          console.log("登录失败", err);
          this.$message.error("登录失败,手机号或验证码错误");
          this.LoginLoading = false;
        });
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
.login-head {
  width: 300px;
  height: 57px;
  background: url("./logo_1.jpg") no-repeat;
  background-size: 100% 100%;
  margin-bottom: 30px;
}
</style>