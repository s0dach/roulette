import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueCookie from 'vue-cookie'
import router from "@/router"
import App from './App.vue'
import datef from 'datef'

Vue.config.productionTip = false

Vue.use(VueAxios, axios)
Vue.use(VueCookie)

axios.defaults.baseURL = `${process.env.VUE_APP_BACKEND_URL}/api`

new Vue({
  data() {
    return {
      user: null
    }
  },
  created() {
    if (this.$cookie.get('token')) {
      this.getUser();
    } else {
      this.redirectToFrontend()
    }
  },
  methods: {
    async getUser() {
        this.request('GET', '/user/profile')
          .then((user) => {
            if (user.role !== 'admin' && user.role !== 'moderator') {
              return this.redirectToFrontend()
            }

            this.user = user
          })
          .catch(() => {
            this.redirectToFrontend()
          })
    },
    async redirectToFrontend() {
      document.location.href = process.env.VUE_APP_FRONTEND_URL
    },
    async request(type, uri, data = {}) {
      if (this.$cookie.get('token')) {
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + this.$cookie.get('token');
      }

      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (res, rej) => {
        try {
          let result = null;

          if (type === 'POST') {
            result = await this.$root.axios.post(uri, data)
          } else {
            result = await this.$root.axios.get(uri, { params: data } )
          }

          return res(result.data);
        } catch (e) {
          if (typeof e.response !== "undefined" && typeof e.response.data.message !== "undefined") {
            return rej(e.response.data.message);
          } else {
            return rej(false);
          }
        }
      });
    },
    parseDate(date) {
      return datef('HH:mm dd.MM.YYYY', date)
    }
  },
  render: h => h(App),
  router
}).$mount('#app')
