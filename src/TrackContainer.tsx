/** @jsx jsx */
import { Fragment } from "react";
import { jsx } from "@emotion/react";
import { godfatCss } from "./utils/godfat";
import styled from "@emotion/styled";
import { ConfigData } from "./Page";
import { CatCell } from "./utils/godfatParsing";

const zip = (arr: any[]) =>
  Array(Math.min(...arr.map((a) => a.length)))
    .fill(0)
    .map((_, i) => arr.map((a) => a[i]));

const LabelTd = styled.td`
  border: 1px solid black;
  background-color: #f5f5f5;
`;

const TopTd = styled.td<{ color?: string }>`
  border: 1px solid black;
  border-bottom-style: none;
  ${({ color }) => `background-color: ${color};`}
  ${({ color }) => (color === "darkviolet" ? `color: #d8a56f;` : "")}
`;

const BottomTd = styled.td<{ color?: string }>`
  border: 1px solid black;
  border-top-style: none;
  ${({ color }) => `background-color: ${color};`}
  ${({ color }) => (color === "darkviolet" ? `color: #d8a56f;` : "")}
`;

const StickyRow = styled.tr`
  position: sticky;
  top: 0;
  background-color: white;
  box-shadow: inset 0 1px 0 black, inset 0 -1px 0 black, inset 1px 0 0 black,
    inset -1px 0 0 black;
`;

export default function TrackContainer({
  track,
  configData,
  cells,
}: {
  track: "A" | "B";
  configData: ConfigData;
  cells: CatCell[][];
}) {
  const zippedCells: CatCell[][] = zip(cells);
  const isGuaranteedArray = zippedCells[0].map((catCell) =>
    Boolean(catCell?.guaranteeMainCat?.text)
  );

  return (
    <div css={godfatCss}>
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
                        <TopTd color={catCell.color}>
                          {isTrackSwitchCell
                            ? catCell.mainCat.text
                            : catCell.altCat?.text}
                        </TopTd>
                        {isGuaranteeCell && (
                          <TopTd color={catCell.guaranteeColor}>
                            {isTrackSwitchCell
                              ? catCell.guaranteeMainCat?.text
                              : catCell.guaranteeAltCat?.text}
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
                        <BottomTd color={catCell.color}>
                          {isTrackSwitchCell
                            ? catCell.altCat?.text
                            : catCell.mainCat.text}
                        </BottomTd>
                        {isGuaranteeCell && (
                          <BottomTd color={catCell.guaranteeColor}>
                            {isTrackSwitchCell
                              ? catCell.guaranteeAltCat?.text
                              : catCell.guaranteeMainCat?.text}
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
