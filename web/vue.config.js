module.exports = {
  devServer: {
    // proxy: process.env.VUE_APP_API_URL,
    allowedHosts: "all",
  },
  productionSourceMap: process.env.NODE_ENV !== "production",
};
