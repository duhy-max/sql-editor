# 1. 查看当前状态
git status
# 输出示例：
# modified:   src/components/Header.vue
# modified:   src/App.vue

# 2. 添加所有修改
git add .

# 3. 再次确认状态
git status
# 输出示例：
# Changes to be committed:
#   modified:   src/components/Header.vue
#   modified:   src/App.vue

# 4. 提交到本地
git commit -m "feat: 新增智能造数抽屉及AI聊天窗口"

# 5. 推送到远程
git push
