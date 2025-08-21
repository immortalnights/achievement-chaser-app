// Environment-based API URL configuration for React Native
const { Platform } = require("react-native")

module.exports = {
  API_URL: Platform.OS === "web" ? "http://localhost:4000/graphql/" : "https://steam.seventh.space/graphql/",
}
