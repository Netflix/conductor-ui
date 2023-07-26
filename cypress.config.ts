import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5000",
  },
  numTestsKeptInMemory: 1000,
  requestTimeout:120000,
  taskTimeout:120000,
  pageLoadTimeout:120000,
  defaultCommandTimeout:120000,
  execTimeout:120000,
  responseTimeout:120000,
  component: {
    devServer: {
      framework: "create-react-app",
      bundler: "webpack",
    },
  },
});