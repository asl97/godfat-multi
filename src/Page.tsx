import React, { useEffect, useState } from "react";

import ConfigContainer from "./ConfigContainer";
import TracksContainer from "./TracksContainer";
import { Typography } from "@mui/material";
import { useGodfatBanners } from "./utils/godfat";
import { useStorageLinkedString } from "./utils/config";

export type BannerData = {
  label: string;
  url: string;
};

export type ConfigData = {
  bannerData: BannerData[];
};

export default function Page() {
  // This is modified in TracksContainer when clicking to update seed, so it's pulled out to this level
  const [seed, setSeed] = useStorageLinkedString("seed");
  // We don't want to reload the track UNLESS the change is from within the track
  const [forceReload, setForceReload] = useState(0);
  const setSeedAndForceReload = (seed: string) => {
    setSeed(seed);
    setForceReload((forceReload) => forceReload + 1);
  };

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
      <ConfigContainer
        banners={banners}
        setConfigData={setConfigData}
        seed={seed}
        setSeed={setSeed}
        forceReload={forceReload}
      />
      <TracksContainer
        configData={configData}
        setSeed={setSeedAndForceReload}
      />
    </>
  );
}
