/* JS files and framework components are HMR-ed */

import { createApp } from "vue";
// import Popup from "./Popup.vue";
import Logger from "../log.ts";
import PopupWrap from "./PopupWrap.vue";
const Log = Logger.getInstance('main')
Log.info("Loaded popup/main.ts");

createApp(PopupWrap).mount("#app");
