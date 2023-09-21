import React from "react";
import ReactDOM from "react-dom";
import { Helmet } from "react-helmet";

import { QueryClient, QueryClientProvider } from "react-query";

import Page from "./Page";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Helmet>
        <title>Godfat Multitool</title>
      </Helmet>
      <Page />
    </QueryClientProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
