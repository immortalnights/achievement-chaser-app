// Environment-based API URL configuration
const isDev = process.env.NODE_ENV !== "production"

module.exports = {
  API_URL: isDev ? "http://localhost:4000/graphql/" : "https://steam.seventh.space/graphql/",
}
