import React, { useEffect } from "react";

import ConfigContainer from "./ConfigContainer";
import TracksContainer from "./TracksContainer";
import { useQuery } from "react-query";
import { corsUrl } from "./utils/query";
import { Typography } from "@mui/material";
import { BannerSelectOption, useGodfatBanners } from "./utils/godfat";

const BASE_GODFAT_URL = "https://bc.godfat.org/";

export type BannerData = {
  label: string;
  url: string;
};

export type ConfigData = {
  bannerData: BannerData[];
};

const parseBannersFromHtml = (html: Document): BannerSelectOption[] => {
  const eventSelect = html.getElementById("event_select");
  if (!eventSelect) return [];

  const results = [];
  for (const optGroup of eventSelect.children) {
    if ((optGroup as HTMLOptGroupElement).label === "Custom:") {
      continue;
    }

    results.push({
      groupLabel: (optGroup as HTMLOptGroupElement).label,
      options: Array.from(optGroup.children).map((option) => ({
        value: (option as HTMLOptionElement).value,
        label: (option as HTMLOptionElement).text,
      })),
    });
  }

  return results;
};

export default function Page() {
  const [configData, setConfigData] = React.useState<ConfigData>({
    bannerData: [],
  });

  const { isLoading, isError, banners } = useGodfatBanners();

  if (isLoading) {
    return <Typography variant="h5">Loading banner data...</Typography>;
  }
  if (isError) {
    return <Typography variant="h5">Error fetching banner data!</Typography>;
  }
  console.log(banners);
  return (
    <>
      <ConfigContainer banners={banners} setConfigData={setConfigData} />
      <TracksContainer configData={configData} />
    </>
  );
}
