import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import ThemeProvider from "./theme/ThemeProvider";
import { BrowserRouter } from "react-router-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { isEmpty as _isEmpty } from 'lodash';
import packageJson from '../package.json';

import DefaultAppContextProvider from "./components/context/DefaultAppContextProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      cacheTime: 600000, // 10 mins
    },
  },
});


let basename = '/';
try{
  basename = new URL(packageJson.homepage).pathname;
} catch(e) {}
basename = _isEmpty(basename) ? '/' : basename;

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter basename={basename}>
        <DefaultAppContextProvider basename={basename}>
          <QueryClientProvider client={queryClient}>
            <CssBaseline />
            <ReactQueryDevtools />

            <App />
          </QueryClientProvider>
        </DefaultAppContextProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
