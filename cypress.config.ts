export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5000",
  },
  numTestsKeptInMemory: 1000,
  component: {
    devServer: {
      framework: "create-react-app",
      bundler: "webpack",
    },
  },
