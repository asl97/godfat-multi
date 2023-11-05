import React from "react";
import ReactDOM from "react-dom";

import { QueryClient, QueryClientProvider } from "react-query";

import Page from "./Page";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Page />
    </QueryClientProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
