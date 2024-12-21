<template>
  <n-loading-bar-provider>
    <n-message-provider>
      <icon-config-provider size="16">
        <popup />
      </icon-config-provider>
    </n-message-provider>
  </n-loading-bar-provider>
</template>
<script>
  import { NMessageProvider, NLoadingBarProvider } from 'naive-ui'
  import { defineComponent } from 'vue'
  import {IconConfigProvider} from '@vicons/utils'
  import Popup from './Popup.vue';
  // content
  export default defineComponent({
    components: {
      'popup': Popup,
      'n-message-provider': NMessageProvider,
      'icon-config-provider': IconConfigProvider,
      'n-loading-bar-provider': NLoadingBarProvider,
    },
  })
</script>