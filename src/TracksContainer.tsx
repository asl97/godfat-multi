import React from "react";

import TrackContainer from "./TrackContainer";
import { ConfigData } from "./Page";

export type CellData = {
  row: string;
  text?: string;
  target?: string;
};

export default function TracksContainer({
  configData,
}: {
  configData: ConfigData;
}) {
  const [hoveredCell, setHoveredCell] = React.useState<CellData>({ row: "" });

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
