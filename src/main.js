import {createApp} from 'vue';
import {createPinia} from 'pinia';
import {VueQueryPlugin} from 'vue-query';
import Toast, {POSITION} from 'vue-toastification';
import App from './App.vue';
import router from './router';
import 'vue-toastification/dist/index.css';

const app = createApp(App);

const pinia = createPinia();

app.use(pinia);
app.use(VueQueryPlugin);
app.use(Toast, {
    position: POSITION.TOP_RIGHT,
    timeout: 5000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: 'button',
    icon: true,
    rtl: false,
});

app.use(router);
app.mount('#app');
