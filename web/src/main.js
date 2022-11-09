import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import axios from "axios";
import VueAxios from "vue-axios";
import Notifications from "vue-notification";
import VueSocketIOExt from "vue-socket.io-extended";
import io from "socket.io-client";
import VModal from "vue-js-modal";
import { MediaQueries } from "vue-media-queries";
import VueCookie from "vue-cookie";
import "hacktimer/HackTimer.min";
import VueI18n from "vue-i18n";
import Messages from "./messages";

const mediaQueries = new MediaQueries();

const socket = io(`:4000`);

Vue.use(Notifications);
Vue.use(VueAxios, axios);
Vue.use(VueSocketIOExt, socket);
Vue.use(VModal);
Vue.use(mediaQueries);
Vue.use(VueCookie);
Vue.use(VueI18n);

let lang = "RU";
if (VueCookie.get("lang")) {
  lang = VueCookie.get("lang");
}

const i18n = new VueI18n({
  locale: lang,
  fallbackLocale: lang,
  messages: Messages,
});

Vue.config.productionTip = false;

axios.defaults.withCredentials = true;
axios.defaults.baseURL = `${process.env.VUE_APP_API_URL}/api`;

new Vue({
  data() {
    return {
      user: null,
      config: {},
      backendUri: `${process.env.VUE_APP_API_URL}/api`,
      tech: {
        status: false,
        message: "",
      },
      lang: "RU",
    };
  },
  created() {
    this.getConfig();

    if (this.$cookie.get("token")) {
      this.getUser();
    }

    if (this.$cookie.get("lang")) {
      this.lang = this.$cookie.get("lang");
    }
  },
  methods: {
    async request(type, uri, data = {}) {
      if (this.$cookie.get("token")) {
        axios.defaults.headers.common["Authorization"] =
          "Bearer " + this.$cookie.get("token");
      }

      if (this.$cookie.get("ref")) {
        axios.defaults.headers.common["Ref"] = this.$cookie.get("ref");
      }

      return new Promise(async (res, rej) => {
        try {
          let result;

          if (type === "POST") {
            result = await this.$root.axios.post(uri, data);
          } else {
            result = await this.$root.axios.get(uri, { params: data });
          }

          return res(result.data);
        } catch (e) {
          if (
            typeof e.response !== "undefined" &&
            typeof e.response.data.message !== "undefined"
          ) {
            let message;

            if (typeof e.response.data.message !== "object") {
              message = e.response.data.message;
            } else {
              message = e.response.data.message[0];
            }

            return rej(message);
          } else {
            return rej(false);
          }
        }
      });
    },
    getUser() {
      this.request("GET", "/user/profile")
        .then((user) => {
          this.user = user;
        })
        .catch(() => {
          this.$cookie.delete("token");
        });
    },
    getConfig() {
      this.request("GET", "/config")
        .then((config) => {
          this.config = config;
        })
        .catch((err) => {
          this.tech = {
            status: true,
            message: err,
          };
        });
    },
    getStyleItem(rarity) {
      let style = "consumer";
      rarity = rarity.toLowerCase();

      if (rarity.indexOf("industrial") > -1) {
        style = "industrial";
      } else if (rarity.indexOf("mil-spec") > -1) {
        style = "mil-spec";
      } else if (rarity.indexOf("restricted") > -1) {
        style = "restricted";
      } else if (rarity.indexOf("classified") > -1) {
        style = "classified";
      } else if (rarity.indexOf("covert") > -1) {
        style = "covert";
      } else if (rarity.indexOf("★") > -1) {
        style = "covert";
      } else if (rarity.indexOf("exceedingly") > -1) {
        style = "exceedingly-rare";
      } else if (rarity.indexOf("contraband") > -1) {
        style = "contraband";
      }

      return style;
    },
    showNotify(type, message) {
      let title = "Успешно";

      if (type === "error") {
        title = "Ошибка";
      } else if (type === "warn") {
        title = "Оповещение";
      }

      this.$notify({
        type: type,
        group: "main",
        title: title,
        text: message,
      });
    },
    redirectToSteam() {
      let width = 860;
      let height = 500;
      let left = screen.width / 2 - width / 2;
      let top = screen.height / 2 - height / 2;
      let windowOptions = `menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=${width}, height=${height}, top=${top}, left=${left}`;
      let type = "auth";

      window.open(
        `${process.env.VUE_APP_API_URL}/api/auth/steam`,
        type,
        windowOptions
      );

      window.addEventListener("message", this.initToken, false);
    },
    async initToken(event) {
      if (event.data.length > 0) {
        const token = event.data.slice(7);
        this.$cookie.set("token", token, {
          domain: process.env.VUE_APP_FRONTEND_URL,
          expires: "1Y",
        });

        await this.$root.getUser();

        this.$root.$emit("updateInventory");
      }
    },
  },
  mediaQueries: mediaQueries,
  router,
  i18n,
  render: (h) => h(App),
}).$mount("#app");
