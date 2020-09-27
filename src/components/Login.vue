<template>
    <div class="login_container">
        <div class="login_box">
            <!-- 头像 -->
            <div class="avatar_box">
                <img src="../assets/logo.png">
            </div>
            <!-- 登录form -->
            <el-form class="login_form" ref="loginFormRef" :model="loginform" :rules="loginrules">
                <el-form-item prop="username">
                    <el-input prefix-icon="iconfont icon-user1" v-model="loginform.username"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input prefix-icon="iconfont icon-password-b" v-model="loginform.password" type="password"></el-input>
                </el-form-item>
                <el-form-item class="btns">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="resetLoginfrom">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
export default {
  data () {
    return {
      loginform: {
        username: 'admin',
        password: '123456'
      },
      //   验证
      loginrules: {
        username: [
          { required: true, message: '请输入登录名称', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入登录m密码', trigger: 'blur' },
          { min: 6, max: 15, messagr: '长度在3 到15 字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    login() {
      this.$refs.loginFormRef.validate(valid => {
        if (!valid) return
        this.$http.post('login', this.loginform).then((res) => {
          if (res.data.meta.status === 200) {
            this.$message.success('登录成功')
            // 登录成功后将token报存到sessionStorage
            window.sessionStorage.setItem('token', res.data.data.token)
            this.$router.push('/home')
          } else {
            this.$message.error('登录失败')
          }
        }).catch((err) => {
          console.log(err)
        })
      })
    },
    resetLoginfrom() {
      this.$refs.loginFormRef.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
.login_container{
    height: 100%;
    background-color: #2b4b6b;
}
.login_box{
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top:50%;
    transform: translate(-50%,-50%);
    .avatar_box{
        height: 130px;
        width: 130px;
        border:1px solid #eee;
        border-radius: 50%;
        padding:10px;
        box-shadow: 0 0 10px #ddd;
        position: absolute;
        left: 50%;
        transform: translate(-50%,-50%);
        background-color: #fff;
        img{
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: #eee;
        }
    }
}
.login_form{
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
}
.btns{
    display: flex;
    justify-content: flex-end;
}
</style>
