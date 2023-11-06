import React, { useEffect } from "react";

import ConfigContainer from "./ConfigContainer";
import TracksContainer from "./TracksContainer";
import { Typography } from "@mui/material";
import { useGodfatBanners } from "./utils/godfat";

export type BannerData = {
  label: string;
  url: string;
};

export type ConfigData = {
  bannerData: BannerData[];
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

  return (
    <>
      <ConfigContainer banners={banners} setConfigData={setConfigData} />
      <TracksContainer configData={configData} />
    </>
  );
}
