import React from "react";

import ConfigContainer from "./ConfigContainer";
import TracksContainer from "./TracksContainer";

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

  return (
    <>
      <ConfigContainer setConfigData={setConfigData} />
      <TracksContainer configData={configData} />
    </>
  );
}
