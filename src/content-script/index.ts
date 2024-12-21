import { createApp } from "vue";
import Overlay from "./Overlay.vue";
import "./styles.css";
const vite = document.createElement('div');
vite.id = 'vite';
document.body.appendChild(vite);
createApp(Overlay).mount(vite);
