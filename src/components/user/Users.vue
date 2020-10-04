<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <!-- 搜索与添加 -->
        <el-row :gutter="20">
          <el-col :span="7">
            <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
              <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="addDialogVisible=true">添加</el-button>
          </el-col>
        </el-row>
      <!-- table -->
      <el-table :data="userList" border stripe>
        <el-table-column  type="index" label="#" align="center"></el-table-column>
        <el-table-column  label="姓名" prop="username" align="center"></el-table-column>
        <el-table-column  label="邮箱" prop="email" align="center"></el-table-column>
        <el-table-column  label="电话" prop="mobile" align="center"></el-table-column>
        <el-table-column  label="角色" prop="role_name" align="center"></el-table-column>
        <el-table-column  label="状态" align="center">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateCheanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column  label="操作" width="180px">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="编辑" placement="top">
              <el-button size="mini" type="primary" icon="el-icon-edit" :enterable="false" @click="showEditDialog(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除" placement="top">
              <el-button size="mini" type="danger" icon="el-icon-delete" :enterable="false" @click="delUserById(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button size="mini" type="warning" icon="el-icon-setting"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper">
      </el-pagination>
    </el-card>

    <!-- 添加用户 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%" :show-close="false"
      @close="addDialogClosed">
      <!-- 内容主体区 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
          <el-form-item label="用户名" prop="username">
              <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
              <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
              <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
              <el-input v-model.number="addForm.mobile"></el-input>
          </el-form-item>
      </el-form>
      <!-- 底部区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%" :show-close="false" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
          <el-form-item label="用户名">
              <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
              <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
              <el-input v-model.number="editForm.mobile"></el-input>
          </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if(regEmail.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的邮箱'))
    }
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]18[0-9]|14[57])[0-9]{8}$/
      if(regMobile.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的手机号'))
    }
    return {
      // 获取用户列表参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      userList: [],
      total: 0,
      addDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名的长度在3~10个字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 10, message: '密码的长度在6~15个字符之间', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { type: 'number', message: '手机号必须为数值', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      editDialogVisible: false,
      editForm: {},
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    getUserList() {
      this.$http.get('users', { params: this.queryInfo }).then((res) => {
        if(!res.data.meta.status === 200) return this.$message.error(res.data.meta.msg)
        this.userList = res.data.data.users
        this.total = res.data.data.total
      }).catch((err) => {
        console.log(err)
      })
    },
    // 监听pagesize改变事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听页码值 改变事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听switch开关状态
    userStateCheanged(userinfo) {
      this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`).then((res) => {
        if(res.data.meta.status !== 200) {
          userinfo.mg_state = !userinfo.mg_state
          return this.$message.error('设置用户状态失败!')
        }
        this.$message.success('设置用户状态成功!')
      }).catch((err) => {
        console.log(err)
      })
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮 添加新用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if(!valid) return
        const { data: res } = await this.$http.post('users', this.addForm)
        if(res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        this.addDialogVisible = false
        // 重新获取用户列表 刷新用户列表
        this.getUserList()
      })
    },
    // 通过id查询用户信息绑定到editForm上
    showEditDialog(id) {
      this.$http.get('users/' + id).then((res) => {
        if(res.data.meta.status !== 200) {
          return this.$message.error('获取用户信息失败')
        }
        this.editForm = res.data.data
      }).catch((err) => {
        console.log(err)
      })
      this.editDialogVisible = true
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息并提交
    editUserInfo() {
      this.$refs.editFormRef.validate(valid => {
        // console.log(valid)
        if(!valid) return
        this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        }).then((res) => {
          console.log(res)
          if(res.data.meta.status !== 200) return this.$message.error('更新用户信息失败')
          // 关闭对话框
          this.editDialogVisible = false
          // 刷新数据列表
          this.getUserList()
          this.$message.success('更新用户信息成功')
        }).catch((err) => {
          console.log(err)
        })
      })
    },
    delUserById(id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete('users/' + id).then((result) => {
          console.log(result)
          if(result.data.meta.status !== 200) {
            this.$message.error('删除用户失败')
          }
          this.$message.success('删除用户成功')
          this.getUserList()
        }).catch((err) => {
          console.log(err)
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    }
  }
}
</script>

<style lang="less" scoped>

</style>
