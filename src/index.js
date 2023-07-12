import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import ThemeProvider from "./theme/ThemeProvider";
import { BrowserRouter } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import DefaultAppContextProvider from "./components/context/DefaultAppContextProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      cacheTime: 600000, // 10 mins
    },
  },
});

ReactDOM.render(
  <ThemeProvider>
    <BrowserRouter>
      <DefaultAppContextProvider>
        <QueryClientProvider client={queryClient}>
          <CssBaseline />
          <ReactQueryDevtools />

          <App />
        </QueryClientProvider>
      </DefaultAppContextProvider>
    </BrowserRouter>
  </ThemeProvider>,
  document.getElementById("root"),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
