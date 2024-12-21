<template>
  <n-flex class="header" align="center">
    <n-h2 style="margin: 0">原神 & 星穹铁道 & 绝区零 & 崩坏3 & 鸣潮 语音合成</n-h2>
  </n-flex>
  <n-flex class="popup-container">
    <n-space vertical style="flex: 1">
      <n-space align="center">
        <n-button
          title="刷新角色列表"
          circle
          size="small"
          @click="refreshSpeakerList"
          :loading="isRefreshing"
          :disabled="isRefreshing"
        >
          <template #icon>
            <Icon><refresh-icon /></Icon>
          </template>
        </n-button>
        <n-form-item label-placement="left" label="角色">
          <n-select
            v-model:value="selectedRole"
            filterable
            :options="roleOptions"
            placeholder="选择角色"
            @update:value="handleRoleChange"
            style="width: 200px"
          />
        </n-form-item>
        <n-form-item label-placement="left" label="语气">
          <n-select
            v-model:value="selectedTone"
            :options="toneOptions"
            placeholder="选择语气"
            :disabled="!selectedRole"
            style="width: 150px"
          />
        </n-form-item>
      </n-space>
      <n-space align="center">
        <n-button
          title="设置"
          circle
          :bordered="false"
          :ghost="true"
          :focusable="false"
          :secondary="true"
          size="small"
        >
          <template #icon>
            <Icon><Settings /></Icon>
          </template>
        </n-button>
        <n-form-item label-placement="left" label="语速" title="语速（范围：0.1 ~ 2.0）">
          <n-slider style="width: 120px" v-model:value="speed" :step="0.1" :max="2.0" :min="0.1" />
        </n-form-item>
        <n-form-item label-placement="left" label="分段间隔" title="分段间隔（秒，范围：0.01 ~ 1.0）">
          <n-slider style="width: 200px" v-model:value="fragment_interval" :step="0.01" :max="1.0" :min="0.01" />
        </n-form-item>
      </n-space>

      <n-form-item label-placement="left" label="待转文本">
        <n-input
          v-model:value="inputText"
          type="textarea"
          placeholder="请输入文字内容"
          :autosize="{
            minRows: 4,
            maxRows: 6,
          }"
        />
      </n-form-item>
      <n-flex justify="end">
        <n-button
          type="primary" 
          @click="handleSubmit"
          :disabled="genLoading"
        >
        <tts-icon :size="16"></tts-icon>&nbsp;
        {{ genLoading ? '生成中...' : '生成语音'}}
      </n-button>
      </n-flex>
    </n-space>
    <div class="audio-wrap">
      <template v-for="item in audioList" :key="item">
        <audio v-if="item"  controls :src="item" />
        <n-skeleton v-else class="gujia" round />
      </template>
    </div>
  </n-flex>
  <Poster />
</template>
<script setup lang="ts">
import browser from "webextension-polyfill";
import debounce from 'lodash.debounce';
import Logger from "../log.ts";
import { reactive, computed, ref, watch, onMounted, nextTick, unref } from "vue";
import {
  NSpace,
  NSelect,
  NInput,
  NButton,
  useMessage,
  NFormItem,
  NFlex,
  useLoadingBar,
  NSkeleton,
  NSlider,
  NH2
} from "naive-ui";
import { Icon } from "@vicons/utils";
import { RefreshOutline as RefreshIcon } from "@vicons/ionicons5";
import { Settings } from '@vicons/carbon'
import Poster from './components/Poster/index.vue'
import TtsIcon from './components/TtsIcon/index.vue'
const logger = Logger.getInstance("popup");
const message = useMessage();
const loadingBar = useLoadingBar();
let speakerList = ref({});
const selectedRole = ref("");
const selectedTone = ref("中立");
const isRefreshing = ref(false);
const audioList = ref([]);
const genLoading = ref(false);
const inputText = ref("");
/**语速 */
const speed = ref(1.0);
/**分断间隔 */
const fragment_interval = ref(0.1)





watch(genLoading, () => {
  if(genLoading.value) {
    loadingBar.start()
  } else {
    loadingBar.finish()
  }
})
watch(audioList, (newList) => {
  if(newList[0] !== '') {
    logger.log(`监听到变动: ${newList}`)
    browser.runtime.sendMessage({ type: "saveAudio", data: Array.from(newList) }).then((data) => {
      logger.log(data)
    })
  } else {
    logger.log('loading...')
  }
}, {deep: true, immediate: false})

const roleOptions = computed(() => {
  return Object.keys(speakerList.value).map((role) => ({
    label: role,
    value: role,
  }));
});

// 根据选择的角色生成对应的语气选项
const toneOptions = computed(() => {
  if (!selectedRole.value) return [];
  if (!Object.keys(speakerList.value).length) return []
  return speakerList.value[selectedRole.value].map((tone) => ({
    label: tone,
    value: tone,
  }));
});



// 提取公共方法：设置角色和对应的语气
const setRoleAndTone = (data: Record<string, string[]>) => {
  if (Object.keys(data).length === 0) return;

  const firstRole = Object.keys(data)[0];
  if(!selectedRole.value) {
    selectedRole.value = firstRole;
    handleRoleChange(firstRole);
  }
};

// 处理角色变更
const handleRoleChange = (role: string) => {
  const tones = speakerList.value[role] || [];
  selectedTone.value = tones.includes("中立") ? "中立" : "";
};


const handleSubmit = async () => {
  const payload = {
    access_token: "45cf7b0e1469345985c5cd0b5b536d4f",
    type: "tts",
    brand: "gpt-sovits",
    name: "anime",
    method: "api",
    prarm: {
      speaker: selectedRole.value, // Use the selected role
      emotion: selectedTone.value, // Use the selected tone
      text: inputText.value, // Use the input text
      text_language: "中英混合",
      text_split_method: "按标点符号切",
      fragment_interval: fragment_interval.value,
      batch_size: 1,
      batch_threshold: 0.75,
      parallel_infer: true,
      split_bucket: true,
      top_k: 10,
      top_p: 1.0,
      temperature: 1.0,
      speed_factor: speed.value,
    },
  };
  genLoading.value = true
  try {
    audioList.value.unshift('');
    const response = await fetch("https://infer.acgnai.top/infer/gen", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (result.message === "合成成功！" || result.audio) {
      // logger.log("Audio URL: " + result.audio); // Handle the audio URL as needed
      // You can also play the audio or display it in the UI
      audioList.value[0] = result.audio;
      message.success(result.message);
    } else {
      message.error(result.message);
    }
  } catch (error) {
    message.error(error.message);
  }
  genLoading.value = false
};

// 刷新角色列表
const refreshSpeakerList = async () => {
  isRefreshing.value = true;
  try {
    const data = await browser.runtime.sendMessage({
      type: "refreshSpeakerList",
    });
    if (Object.keys(data).length > 0) {
      speakerList.value = data;
      message.success("刷新成功");
      if (!selectedRole.value) {
        setRoleAndTone(data);
      }
    }
  } finally {
    isRefreshing.value = false;
  }
};

const debouncedSetData = debounce((data) => {
  browser.storage.local.set(data)
}, 300)

onMounted(() => {
  // browser.storage.local.remove('audioList')
  // 读取并打印存储的数据
  const willGet = ['selectedRole', 'selectedTone', 'inputText', 'speed', 'fragment_interval'];
  browser.storage.local.get(willGet)
  .then((storedData) => {
    if(storedData.inputText) {
      inputText.value = storedData.inputText
    }
    if(storedData.selectedRole) {
      selectedRole.value = storedData.selectedRole
    }
    if(storedData.selectedTone) {
      selectedTone.value = storedData.selectedTone
    }
    if(storedData.speed) {
      speed.value = storedData.speed
    }
    if(storedData.fragment_interval){
      fragment_interval.value = storedData.fragment_interval
    }
    
    nextTick(() => {
      watch([selectedRole, selectedTone, inputText, speed, fragment_interval], (newValue) => {
        const [selectedRole, selectedTone, inputText, speed, fragment_interval] = newValue;
        debouncedSetData({
          selectedRole: selectedRole,
          selectedTone: selectedTone,
          inputText: inputText,
          speed,
          fragment_interval,
        });
      })

      // 初始化角色列表
      browser.runtime.sendMessage({ type: "getSpeakerList" }).then((data) => {
        if (Object.keys(data).length > 0) {
          speakerList.value = data;
          setRoleAndTone(data);
        }
        // logger.printTable(data);
      });
      browser.runtime.sendMessage({ type: "getAudioList" }).then((data) => {
        if(data?.length){
          audioList.value = data;
        }
        console.log(data)
      }); 
    })

  })
})

</script>
<style lang="css">
:root {
  --header-height: 48px;
}
body{
  background-image: url('/images/bg.png');
  background-size: cover;
  /* background-color: #fff; */
}
</style>
<style lang="css" scoped>
.header{
  height: var(--header-height);
  margin-left: -8px;
  margin-right: -8px;
  position: relative;
  top: -8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); /* 添加底部阴影 */
  box-sizing: border-box;
  padding:0 8px;
  padding-left: 48px;
  background-image: url('/icons/icon-300.png');
  background-size: 40px;
  background-repeat: no-repeat;
  background-position: 4px center;
}
.popup-container {
  width: inherit;
  height: calc(100% - var(--header-height) - var(--footer-height));
  :deep(.n-form-item-feedback-wrapper) {
    min-height: unset;
  }
  .audio-wrap{
    width: 288px;
    height: 100%;
    overflow-y: auto;
  }
  audio {
    width: 100%;
    height: 40px;
  }
  .gujia{
    height: 40px;
    margin-bottom: 6px;
  }
}
</style>
