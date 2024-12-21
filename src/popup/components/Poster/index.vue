<template>
  <div class="poster">
    <n-space>
      <n-rate size="small" readonly :default-value="5"></n-rate>
      <a target="_blank" href="https://web.aimix.pro/?user_id=5048">我正在使用AI爆款内容批量生成软件，绑定我的邀请码(5048)送你300积分，快来体验吧！</a>
    </n-space>
  </div>
</template>

<script lang="ts" setup>
import {NRate, NSpace} from 'naive-ui'
</script>

<style>
:root{
  --footer-height: 60px;
}
.poster{
  box-sizing: border-box;
  position: fixed;
  z-index: 10;
  left: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: var(--header-height);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.2);  /* 半透明白色背景 */
  backdrop-filter: blur(8px);  /* 毛玻璃效果 */
  box-shadow: 0 -4px -6px rgba(0, 0, 0, 0.1);  /* 可选：添加阴影效果 */
  a{
    color: #5731ff;
    &:hover{
      color: #ff00b7
    }
  }
}
</style>