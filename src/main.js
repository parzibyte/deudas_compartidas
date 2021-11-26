import Vue from 'vue'
import App from './App.vue'
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
import '@mdi/font/css/materialdesignicons.css'

Vue.use(Buefy);
import router from "./router";
Vue.config.productionTip = false
const formateadorDinero = new Intl.NumberFormat("en", { style: "currency", "currency": "MXN" });
const formateadorFecha = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'medium' });
Vue.filter("dinero", (dinero) => formateadorDinero.format(dinero));
Vue.filter("fecha", (timestamp) => formateadorFecha.format(new Date(timestamp)));

new Vue({
  render: h => h(App),
  router,
}).$mount('#app')
