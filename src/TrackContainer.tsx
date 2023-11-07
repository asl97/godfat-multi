/** @jsx jsx */
import { Fragment } from "react";
import { jsx } from "@emotion/react";
import styled from "@emotion/styled";
import { ConfigData } from "./Page";
import { CatCell } from "./utils/godfatParsing";
import { serSelectedCell } from "./TracksContainer";

const zip = (arr: any[]) =>
  Array(Math.min(...arr.map((a) => a.length)))
    .fill(0)
    .map((_, i) => arr.map((a) => a[i]));

const LabelTd = styled.td`
  border: 1px solid black;
  background-color: #f5f5f5;
`;

const TopTd = styled.td<{ color?: string }>`
  cursor: pointer;
  border: 1px solid black;
  border-bottom-style: none;
  ${({ color }) => `background-color: ${color};`}
  ${({ color }) => (color === "darkviolet" ? `color: #d8a56f; !important` : "")}
`;

const BottomTd = styled.td<{ color?: string }>`
  cursor: pointer;
  border: 1px solid black;
  border-top-style: none;
  ${({ color }) => `background-color: ${color};`}
  ${({ color }) => (color === "darkviolet" ? `color: #d8a56f !important;` : "")}
`;

const StickyRow = styled.tr`
  position: sticky;
  top: 0;
  background-color: white;
  box-shadow: inset 0 1px 0 black, inset 0 -1px 0 black, inset 1px 0 0 black,
    inset -1px 0 0 black;
`;

const CatAnchor = ({
  cat,
  setSeed,
}: {
  cat?: {
    text: string;
    href: string;
  };
  setSeed: (seed: string) => void;
}) => {
  if (!cat) {
    return null;
  }
  return (
    <a
      css={{ cursor: "pointer", ":hover": { textDecoration: "underline" } }}
      onClick={(e) => {
        const destinationSeed = new URL(cat.href)?.searchParams?.get("seed");
        if (destinationSeed) {
          setSeed(destinationSeed);
        }
        e.stopPropagation();
      }}
    >
      {cat.text}
    </a>
  );
};

export default function TrackContainer({
  track,
  configData,
  cells,
  setSeed,
  setSelectedCell,
}: {
  track: "A" | "B";
  configData: ConfigData;
  cells: CatCell[][];
  setSeed: (seed: string) => void;
  setSelectedCell: (selectedCell: string) => void;
}) {
  const zippedCells: CatCell[][] = zip(cells);
  const isGuaranteedArray = zippedCells[0].map((catCell) =>
    Boolean(catCell?.guaranteeMainCat?.text)
  );

  return (
    <div>
      <table css={{ backgroundColor: "black" }}>
        <tbody>
          <StickyRow>
            <th>No.</th>
            {zippedCells[0].map((_, i) => (
              <th key={i} colSpan={isGuaranteedArray[i] ? 2 : 1}>
                {Boolean(configData.bannerData[i].label)
                  ? configData.bannerData[i].label
                  : "Banner " + (i + 1)}
              </th>
            ))}
          </StickyRow>
          {track === "B" && (
            <tr>
              <td
                style={{
                  border: "1px solid black",
                  backgroundColor: "white",
                }}
                colSpan={isGuaranteedArray.reduce(
                  (sum, guaranteed) => sum + (guaranteed ? 2 : 1),
                  1
                )}
              />
            </tr>
          )}
          {zippedCells.map((row, i) => {
            const rowLabel = `${i + 1}${track}`;
            return (
              <Fragment key={i}>
                <tr>
                  <LabelTd rowSpan={2}>{rowLabel}</LabelTd>
                  {row.map((catCell, j) => {
                    // Top row
                    const isTrackSwitchCell = Boolean(catCell.altCat?.text);
                    const isGuaranteeCell = isGuaranteedArray[j];
                    return (
                      <Fragment key={j}>
                        <TopTd
                          onClick={() => {
                            setSelectedCell(
                              serSelectedCell({
                                bannerUrl: configData.bannerData[j].url,
                                num: i + 1,
                                track,
                                isMainCat: true,
                                isGuaranteed: false,
                              })
                            );
                          }}
                          color={catCell.color}
                        >
                          {isTrackSwitchCell ? (
                            <CatAnchor
                              cat={catCell.mainCat}
                              setSeed={setSeed}
                            ></CatAnchor>
                          ) : (
                            <CatAnchor
                              cat={catCell.altCat}
                              setSeed={setSeed}
                            ></CatAnchor>
                          )}
                        </TopTd>
                        {isGuaranteeCell && (
                          <TopTd
                            onClick={() => {
                              setSelectedCell(
                                serSelectedCell({
                                  bannerUrl: configData.bannerData[j].url,
                                  num: i + 1,
                                  track,
                                  isMainCat: true,
                                  isGuaranteed: true,
                                })
                              );
                            }}
                            color={catCell.guaranteeColor}
                          >
                            {isTrackSwitchCell ? (
                              <CatAnchor
                                cat={catCell.guaranteeMainCat}
                                setSeed={setSeed}
                              ></CatAnchor>
                            ) : (
                              <CatAnchor
                                cat={catCell.guaranteeAltCat}
                                setSeed={setSeed}
                              ></CatAnchor>
                            )}
                          </TopTd>
                        )}
                      </Fragment>
                    );
                  })}
                </tr>
                <tr>
                  {row.map((catCell, j) => {
                    // Bottom row
                    const isTrackSwitchCell = Boolean(catCell.altCat?.text);
                    const isGuaranteeCell = isGuaranteedArray[j];
                    return (
                      <Fragment key={j}>
                        <BottomTd
                          onClick={() => {
                            setSelectedCell(
                              serSelectedCell({
                                bannerUrl: configData.bannerData[j].url,
                                num: i + 1,
                                track,
                                isMainCat: !isTrackSwitchCell,
                                isGuaranteed: false,
                              })
                            );
                          }}
                          color={catCell.color}
                        >
                          {isTrackSwitchCell ? (
                            <CatAnchor
                              cat={catCell.altCat}
                              setSeed={setSeed}
                            ></CatAnchor>
                          ) : (
                            <CatAnchor
                              cat={catCell.mainCat}
                              setSeed={setSeed}
                            ></CatAnchor>
                          )}
                        </BottomTd>
                        {isGuaranteeCell && (
                          <BottomTd
                            onClick={() => {
                              setSelectedCell(
                                serSelectedCell({
                                  bannerUrl: configData.bannerData[j].url,
                                  num: i + 1,
                                  track,
                                  isMainCat: !isTrackSwitchCell,
                                  isGuaranteed: true,
                                })
                              );
                            }}
                            color={catCell.guaranteeColor}
                          >
                            {isTrackSwitchCell ? (
                              <CatAnchor
                                cat={catCell.guaranteeAltCat}
                                setSeed={setSeed}
                              ></CatAnchor>
                            ) : (
                              <CatAnchor
                                cat={catCell.guaranteeMainCat}
                                setSeed={setSeed}
                              ></CatAnchor>
                            )}
                          </BottomTd>
                        )}
                      </Fragment>
                    );
                  })}
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
