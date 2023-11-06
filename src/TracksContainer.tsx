import React, { useEffect, useState } from "react";

import TrackContainer from "./TrackContainer";
import { ConfigData } from "./Page";
import { useQueries } from "react-query";
import { corsUrl } from "./utils/query";
import { Typography } from "@mui/material";
import { CatCell, extractCatsFromTable } from "./utils/godfatParsing";

export type CellData = {
  row: string;
  target?: string;
};

export default function TracksContainer({
  configData,
}: {
  configData: ConfigData;
}) {
  const [hoveredCell, setHoveredCell] = useState<CellData>({ row: "" });

  const urls = configData.bannerData.map((data) => data.url);
  const [parsedQueryData, setParsedQueryData] = useState<{
    trackAs: CatCell[][];
    trackBs: CatCell[][];
  }>({ trackAs: [], trackBs: [] });

  const queries = useQueries(
    urls.map((url) => ({
      queryKey: [url],
      queryFn: () => fetch(corsUrl(url)),
      staleTime: Infinity,
    }))
  );

  const allQueriesResolved = queries.every((query) => query.isFetched);

  useEffect(() => {
    (async () => {
      const res = {
        trackAs: [] as CatCell[][],
        trackBs: [] as CatCell[][],
      };
      const successfulQueries = queries.filter((query) => query.isSuccess);
      for (const query of successfulQueries) {
        const dataText = await query.data!.clone().text(); // Inefficient (parallelizable). Who cares?
        const dataDom = new DOMParser().parseFromString(dataText, "text/html");
        const dataTable = dataDom.getElementsByTagName("table")[0]; // Godfat page is guaranteed to have one table
        const trackACats = extractCatsFromTable(dataTable, "A");
        const trackBCats = extractCatsFromTable(dataTable, "B");
        res.trackAs.push(trackACats);
        res.trackBs.push(trackBCats);
      }
      setParsedQueryData(res);
    })();

    return () => {};
  }, [allQueriesResolved, queries.length]); // TODO fix this?

  if (!allQueriesResolved) {
    return <Typography variant="h5">Loading banner data...</Typography>;
  }
  if (
    parsedQueryData.trackAs.length === 0 ||
    parsedQueryData.trackBs.length === 0 ||
    configData.bannerData.length !== parsedQueryData.trackAs.length ||
    configData.bannerData.length !== parsedQueryData.trackBs.length
  ) {
    return <></>;
  }

  console.log(parsedQueryData);

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "10px",
          padding: "10px",
        }}
        onMouseOver={() => setHoveredCell({ row: "" })}
      >
        <TrackContainer
          configData={configData}
          track="A"
          hoveredCell={hoveredCell}
          setHoveredCell={setHoveredCell}
        />
        <TrackContainer
          configData={configData}
          track="B"
          hoveredCell={hoveredCell}
          setHoveredCell={setHoveredCell}
        />
      </div>
    </>
  );
}
