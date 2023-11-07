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

export const serSelectedCell = ({
  bannerUrl,
  num,
  track,
  isMainCat,
  isGuaranteed,
}: {
  bannerUrl: string;
  num: number;
  track: "A" | "B";
  isMainCat: boolean;
  isGuaranteed: boolean;
}) => `${bannerUrl};${num};${track};${isMainCat};${isGuaranteed}`;

export const desSelectedCell = (
  str: string
): {
  bannerUrl: string;
  num: number;
  track: "A" | "B";
  isMainCat: boolean;
  isGuaranteed: boolean;
} => {
  const split = str.split(";");
  return {
    bannerUrl: split[0],
    num: parseInt(split[1], 10),
    track: split[2] as "A" | "B",
    isMainCat: split[3] === "true",
    isGuaranteed: split[4] === "true",
  };
};

export default function TracksContainer({
  configData,
  setSeed,
}: {
  configData: ConfigData;
  setSeed: (seed: string) => void;
}) {
  // num(int);track(A|B);mainCat(bool);guaranteed(bool)
  const [selectedCell, setSelectedCell] = useState("");

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

  if (selectedCell) {
    const { bannerUrl, num, track, isMainCat, isGuaranteed } =
      desSelectedCell(selectedCell);

    const trackIndex = configData.bannerData.findIndex(
      (data) => data.url === bannerUrl
    );

    let currentTrackList =
      track === "A"
        ? parsedQueryData.trackAs[trackIndex]
        : parsedQueryData.trackBs[trackIndex];
    // If not main cat, set lastCatName to a dupe to force the alt track
    let lastCatName = isMainCat ? "" : currentTrackList[num - 1].mainCat.name;
    let currentNum = num;
    let currentTrack = track;
    for (let i = 0; i < 10; i++) {
      console.log(lastCatName);
      console.log(currentNum);
      console.log(currentTrack);
      // Find the cat
      currentTrackList =
        currentTrack === "A"
          ? parsedQueryData.trackAs[trackIndex]
          : parsedQueryData.trackBs[trackIndex];
      const currentCatCell = currentTrackList[currentNum - 1];
      if (!currentCatCell) {
        break; // Probably went out of bounds
      }

      // Determine if it's a rare dupe
      const isRareDupe =
        currentCatCell.color === "white" &&
        currentCatCell.mainCat.name === lastCatName;
      if (!isRareDupe) {
        lastCatName = currentCatCell.mainCat.name;
        currentNum += 1;
      } else {
        lastCatName = currentCatCell.altCat!.name;
        currentNum = currentCatCell.altCat!.destinationRow;
        currentTrack = currentCatCell.altCat!.destinationTrack as "A" | "B";
      }
    }
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "10px",
          padding: "10px",
        }}
      >
        <TrackContainer
          track="A"
          configData={configData}
          cells={parsedQueryData.trackAs}
          setSeed={setSeed}
          setSelectedCell={setSelectedCell}
        />
        <TrackContainer
          track="B"
          configData={configData}
          cells={parsedQueryData.trackBs}
          setSeed={setSeed}
          setSelectedCell={setSelectedCell}
        />
      </div>
    </>
  );
}
