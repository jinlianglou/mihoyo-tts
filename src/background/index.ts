import browser from "webextension-polyfill";
import Logger from "../log.ts";
import { ref, nextTick } from 'vue';

const logger = Logger.getInstance("background");

// Define interfaces for the API response
interface SpeakerEmotions {
  [speaker: string]: string[];
}

interface SpeakerListResponse {
  message: string;
  spklist: SpeakerEmotions;
}

// Store the speaker list globally
let globalSpeakerList: SpeakerEmotions = {};

// 生成的语音列表
// let audioList = ref([]);

class AudioControl {
  private audioList = ref([])
  static instance: null | AudioControl
  private static maxLength = 100
  constructor() {
    if(AudioControl.instance === null) {
      AudioControl.instance = new AudioControl();
    }
    return AudioControl.instance;
  }

  async getAudioList(){
    if(!this.audioList.value.length) {
      const store = await browser.storage.local.get('audioList');
      if(store.audioList && Object.values(store.audioList).length) {
        const newList = Object.values(store.audioList)
        this.audioList.value = newList;
        return newList;
      }
    }
    return this.audioList.value;
  }
  setAudioList(value: string[]){
    const max = AudioControl.maxLength
    this.audioList.value = value.length >= max ? value.slice(0, max) : value;
    nextTick(() => {
      browser.storage.local.set({
        audioList: Array.from(this.audioList.value)
      })
    })
  }
}

let audioList = new AudioControl();


// Function to fetch speaker list
async function fetchSpeakerList() {
  try {
    const response = await fetch("https://infer.acgnai.top/infer/spks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "tts",
        brand: "gpt-sovits",
        name: "anime",
      }),
    });

    const data: SpeakerListResponse = await response.json();
    if (data.spklist) {
      globalSpeakerList = data.spklist;
      logger.info("Speaker list fetched successfully:");
    } else {
      logger.error("Failed to fetch speaker list:" + data.message);
    }
  } catch (error) {
    logger.error("Failed to fetch speaker list:" + error.message);
  }
}

// Initialize when the extension loads
fetchSpeakerList();
// 刷新语音列表
browser.runtime.onMessage.addListener(async (message) => {
  if (message.type === "refreshSpeakerList") {
    await fetchSpeakerList();
    return globalSpeakerList;
  }
  if (message.type === "getSpeakerList") {
    if(Object.keys(globalSpeakerList).length === 0){
      await fetchSpeakerList();
    }
    return globalSpeakerList;
  }
  if(message.type === 'saveAudio') {
    logger.info(`saveAudio: ${message.data}`)
    audioList.setAudioList(message.data)
    // logger.printTable(message.data)
    return '保存成功'
  }
  if(message.type === 'getAudioList') {
    return await audioList.getAudioList()
  }
});
