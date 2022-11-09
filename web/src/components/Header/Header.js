export default {
  name: 'Header',
  data() {
    return {
      isMobileMenuOpened: false
    }
  },
  methods: {
    logOut() {
      this.$cookie.delete('token', { domain: process.env.VUE_APP_FRONTEND_URL })
      this.$root.user = null
    },
    setLang(lang) {
      this.$root.lang = lang;
      this.$cookie.set('lang', lang);
      this.$i18n.locale = lang;
    }
  },
}
