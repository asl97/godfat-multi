/** @jsx jsx */
import { Fragment } from "react";
import { jsx } from "@emotion/react";
import styled from "@emotion/styled";
import { ConfigData } from "./Page";
import { CatCell } from "./utils/godfatParsing";
import { serSelectedCell } from "./utils/cellSelection";

const zip = (arr: any[]) =>
  Array(Math.min(...arr.map((a) => a.length)))
    .fill(0)
    .map((_, i) => arr.map((a) => a[i]));

const LabelTd = styled.td`
  border: 1px solid black;
  background-color: #f5f5f5;
  padding: 1px !important;
`;

const TopTd = styled.td<{
  color?: string;
  backgroundType?: string;
  planBackgroundType?: string;
}>`
  cursor: pointer;
  border: 1px solid black;
  border-bottom-style: none;
  ${({ color }) => {
    if (color === "darkviolet") {
      return `background-color: ${color}; color: #d8a56f !important;`;
    }
    return `background-color: ${color};`;
  }}
  ${({ backgroundType, planBackgroundType }) => {
    if (planBackgroundType === "selected") {
      return `background-image: linear-gradient(#0000ff50, #0000ff50);`;
    } else if (planBackgroundType === "next") {
      return `background-image: repeating-linear-gradient(90deg, #0000ff54  5px, #0000ff55 15px, #0000ff33 15px, #0000ff33 25px)`;
    }
    if (backgroundType === "selected") {
      return `background-image: linear-gradient(#00000050, #00000050);`;
    } else if (backgroundType === "next") {
      return `background-image: repeating-linear-gradient(90deg, #00000055  5px, #00000055 15px, #00000033 15px, #00000033 25px)`;
    }
  }}
`;

const BottomTd = styled.td<{
  color?: string;
  backgroundType?: string;
  planBackgroundType?: string;
}>`
  cursor: pointer;
  border: 1px solid black;
  border-top-style: none;
  ${({ color }) => {
    if (color === "darkviolet") {
      return `background-color: ${color}; color: #d8a56f !important;`;
    }
    return `background-color: ${color};`;
  }}
  ${({ backgroundType, planBackgroundType }) => {
    if (planBackgroundType === "selected") {
      return `background-image: linear-gradient(#0000ff50, #0000ff50);`;
    } else if (planBackgroundType === "next") {
      return `background-image: repeating-linear-gradient(90deg, #0000ff54  5px, #0000ff55 15px, #0000ff33 15px, #0000ff33 25px)`;
    }
    if (backgroundType === "selected") {
      return `background-image: linear-gradient(#00000050, #00000050);`;
    } else if (backgroundType === "next") {
      return `background-image: repeating-linear-gradient(90deg, #00000055  5px, #00000055 15px, #00000033 15px, #00000033 25px)`;
    }
  }}
`;

const StickyRow = styled.tr`
  position: sticky;
  top: 0;
  background-color: white;
  box-shadow: inset 0 1px 0 black, inset 0 -1px 0 black, inset 1px 0 0 black,
    inset -1px 0 0 black;
`;

const CatAnchor = ({
  mode,
  cat,
  setSeed,
}: {
  mode: string;
  cat?: {
    text: string;
    href: string;
  };
  setSeed: (seed: string) => void;
}) => {
  if (!cat) {
    return null;
  }
  if (mode === "plan") {
    return <span>{cat.text}</span>;
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
  addPlannedCell,
  mode,
}: {
  track: "A" | "B";
  configData: ConfigData;
  cells: CatCell[][];
  setSeed: (seed: string) => void;
  setSelectedCell: (selectedCell: string) => void;
  addPlannedCell: (plannedCell: string) => void;
  mode: string;
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
                {configData.bannerData[i].label}
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
                            const serializedCell = serSelectedCell({
                              bannerUrl: configData.bannerData[j].url,
                              num: i + 1,
                              track,
                              isMainCat: true,
                              isGuaranteed: false,
                            });
                            if (mode === "simulate") {
                              setSelectedCell(serializedCell);
                            } else if (
                              mode === "plan" &&
                              catCell.mainCat?.planBackgroundType === "next"
                            ) {
                              addPlannedCell(serializedCell);
                            }
                          }}
                          color={catCell.color}
                          backgroundType={catCell.mainCat?.backgroundType}
                          planBackgroundType={
                            catCell.mainCat?.planBackgroundType
                          }
                        >
                          {isTrackSwitchCell ? (
                            <CatAnchor
                              mode={mode}
                              cat={catCell.mainCat}
                              setSeed={setSeed}
                            ></CatAnchor>
                          ) : (
                            <CatAnchor
                              mode={mode}
                              cat={catCell.altCat}
                              setSeed={setSeed}
                            ></CatAnchor>
                          )}
                        </TopTd>
                        {isGuaranteeCell && (
                          <TopTd
                            onClick={() => {
                              const serializedCell = serSelectedCell({
                                bannerUrl: configData.bannerData[j].url,
                                num: i + 1,
                                track,
                                isMainCat: true,
                                isGuaranteed: true,
                              });
                              if (mode === "simulate") {
                                setSelectedCell(serializedCell);
                              } else if (
                                mode === "plan" &&
                                catCell.guaranteeMainCat?.planBackgroundType ===
                                  "next"
                              ) {
                                addPlannedCell(serializedCell);
                              }
                            }}
                            color={catCell.guaranteeColor}
                            backgroundType={
                              catCell.guaranteeMainCat?.backgroundType
                            }
                            planBackgroundType={
                              catCell.guaranteeMainCat?.planBackgroundType
                            }
                          >
                            {isTrackSwitchCell ? (
                              <CatAnchor
                                mode={mode}
                                cat={catCell.guaranteeMainCat}
                                setSeed={setSeed}
                              ></CatAnchor>
                            ) : (
                              <CatAnchor
                                mode={mode}
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
                            const serializedCell = serSelectedCell({
                              bannerUrl: configData.bannerData[j].url,
                              num: i + 1,
                              track,
                              isMainCat: !isTrackSwitchCell,
                              isGuaranteed: false,
                            });
                            if (mode === "simulate") {
                              setSelectedCell(serializedCell);
                            } else if (
                              mode === "plan" &&
                              (isTrackSwitchCell
                                ? catCell.altCat
                                : catCell.mainCat
                              )?.planBackgroundType === "next"
                            ) {
                              addPlannedCell(serializedCell);
                            }
                          }}
                          color={catCell.color}
                          backgroundType={
                            isTrackSwitchCell
                              ? catCell.altCat?.backgroundType
                              : catCell.mainCat?.backgroundType
                          }
                          planBackgroundType={
                            isTrackSwitchCell
                              ? catCell.altCat?.planBackgroundType
                              : catCell.mainCat?.planBackgroundType
                          }
                        >
                          {isTrackSwitchCell ? (
                            <CatAnchor
                              mode={mode}
                              cat={catCell.altCat}
                              setSeed={setSeed}
                            ></CatAnchor>
                          ) : (
                            <CatAnchor
                              mode={mode}
                              cat={catCell.mainCat}
                              setSeed={setSeed}
                            ></CatAnchor>
                          )}
                        </BottomTd>
                        {isGuaranteeCell && (
                          <BottomTd
                            onClick={() => {
                              const serializedCell = serSelectedCell({
                                bannerUrl: configData.bannerData[j].url,
                                num: i + 1,
                                track,
                                isMainCat: !isTrackSwitchCell,
                                isGuaranteed: true,
                              });
                              if (mode === "simulate") {
                                setSelectedCell(serializedCell);
                              } else if (
                                mode === "plan" &&
                                (isTrackSwitchCell
                                  ? catCell.guaranteeAltCat
                                  : catCell.guaranteeMainCat
                                )?.planBackgroundType === "next"
                              ) {
                                addPlannedCell(serializedCell);
                              }
                            }}
                            color={catCell.guaranteeColor}
                            backgroundType={
                              isTrackSwitchCell
                                ? catCell.guaranteeAltCat?.backgroundType
                                : catCell.guaranteeMainCat?.backgroundType
                            }
                            planBackgroundType={
                              isTrackSwitchCell
                                ? catCell.guaranteeAltCat?.planBackgroundType
                                : catCell.guaranteeMainCat?.planBackgroundType
                            }
                          >
                            {isTrackSwitchCell ? (
                              <CatAnchor
                                mode={mode}
                                cat={catCell.guaranteeAltCat}
                                setSeed={setSeed}
                              ></CatAnchor>
                            ) : (
                              <CatAnchor
                                mode={mode}
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
