<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="rolelist" border stripe>
        <!-- 展开行 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom', i1 === 0 ? 'bdtop':'', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级权限 -->
              <el-col :span="19" >
                <el-row :class="[i2 !== 0 ? 'bdtop':'', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag type="warning" closable v-for="item3 in item2.children" :key="item3.id" @close="removeRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引 -->
        <el-table-column type="index" label="#" align="center"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="editRoleDialog(scope.row)">编辑</el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="delRoleById(scope.row.id)">删除</el-button>
            <el-button type="warning" size="mini" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色 -->
    <el-dialog
      title="添加角色" :visible.sync="addRoleDialogVisible"
      width="50%" :show-close="false" @close="addRoleclose">
      <el-form :model="addform" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
              <el-input v-model="addform.roleName"></el-input>
          </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addform.roleDesc" placeholder="可选"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色信息 -->
    <el-dialog
      title="编辑角色信息" :visible.sync="editRoleDialogVisible"
      width="50%" :show-close="false" @close="editRoleclose">
      <el-form :model="editform" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
              <el-input v-model="editform.roleName"></el-input>
          </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="editform.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限 -->
    <el-dialog
      title="分配权限" :visible.sync="setRightDialogVisible"
      width="50%" :show-close='false' @close="setRightDialogClosed">
      <el-tree :data="rightslist" :props="treeProps" show-checkbox node-key="id"
      default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolelist: [],
      addRoleDialogVisible: false,
      addform: {
        roleName: '',
        roleDesc: ''
      },
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      },
      editform: {
        id: '',
        roleName: '',
        roleDesc: ''
      },
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      },
      editRoleDialogVisible: false,
      setRightDialogVisible: false,
      rightslist: [],
      // 树形控件的属性绑定
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的节点Id值数组
      defKeys: [],
      // 当前即将分配权限的角色id
      rowId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    getRolesList() {
      this.$http.get('roles').then((res) => {
        if(res.data.meta.status !== 200) {
          return this.$message.error('获取角色列表失败')
        }
        this.rolelist = res.data.data
      }).catch((err) => console.log(err))
    },
    removeRightById(role, rightId) {
      this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then((result) => {
        if(result === 'confirm') {
          this.$http.delete(`roles/${role.id}/rights/${rightId}`).then((res) => {
            if(res.data.meta.status !== 200) {
              return this.$message.error('删除权限失败！')
            }
            role.children = res.data.data
            this.$message.success('删除成功！')
          }).catch((err) => console.log(err))
        }
      }).catch(() => this.$message.info('取消删除成功！'))
    },
    showSetRightDialog(row) {
      // 将角色id保存下来
      this.rowId = row.id
      // 获取所有权限列表
      this.$http.get('rights/tree').then((res) => {
        if(res.data.meta.status !== 200) {
          return this.$message.error('获取权限数据失败！')
        }
        this.rightslist = res.data.data
      }).catch((err) => err)
      // 递归获取三级节点的ID
      this.getLeafKeys(row, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色下的所有三级权限的id，并保存到defKeys数组中
    getLeafKeys(node, arr) {
      // 如果当前node节点中不包含children属性，则是三级节点
      if(!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    setRightDialogClosed() {
      this.defKeys = []
    },
    allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idstr = keys.join(',')
      this.$http.post(`roles/${this.rowId}/rights`, { rids: idstr }).then((res) => {
        if(res.data.meta.status !== 200) {
          return this.message.error('分配权限失败')
        }
        this.$message.success('分配权限成功')
        this.getRolesList()
        this.setRightDialogVisible = false
      }).catch((err) => err)
    },
    addRole() {
      this.$refs.addFormRef.validate(valid => {
        console.log(valid)
        if(!valid) return
        this.$http.post('roles', this.addform).then((res) => {
          console.log(res)
          if(res.data.meta.status !== 201) {
            return this.$message.error('添加角色失败')
          }
          this.$message.success('添加角色成功')
          this.getRolesList()
        }).catch((err) => err)
      })
      this.addRoleDialogVisible = false
    },
    addRoleclose() {
      this.$refs.addFormRef.resetFields()
    },
    editRoleDialog(row) {
      const rowData = {
        id: row.id,
        roleName: row.roleName,
        roleDesc: row.roleDesc
      }
      this.editform = rowData
      this.editRoleDialogVisible = true
    },
    editRole() {
      this.$refs.editFormRef.validate(valid => {
        if(!valid) return
        this.$http.put(`roles/${this.editform.id}`, {
          roleName: this.editform.roleName,
          roleDesc: this.editform.roleDesc
        }).then((res) => {
          if(res.data.meta.status !== 200) {
            return this.$message.error('编辑角色信息失败')
          }
          this.$message.success('编辑角色信息成功')
          this.getRolesList()
          this.editRoleDialogVisible = false
        }).catch((err) => err)
      })
    },
    editRoleclose() {
      this.$refs.editFormRef.resetFields()
    },
    delRoleById(id) {
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`roles/${id}`).then((res) => {
          if(res.data.meta.status !== 200) {
            return this.$message.error('删除角色失败')
          }
          this.$message.success('删除角色成功')
          this.getRolesList()
        }).catch((err) => err)
      }).catch(() => this.$message.info('已取消删除！'))
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag{
  margin: 7px;
}
.bdtop{
  border-top:1px solid #eee;
}
.bdbottom{
  border-bottom: 1px solid #eee;
}
.vcenter{
  display: flex;
  align-items: center;
}
</style>
