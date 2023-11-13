/** @jsx jsx */
import React, { useState } from "react";
import { jsx, css } from "@emotion/react";
import { Box, Modal, Typography } from "@mui/material";

const CURRENT_VERSION = "1.2.1";

const UPDATES = [
  [
    CURRENT_VERSION,
    "Planning mode now disables clicking cat names to update the seed",
  ],
  [
    "1.2.0",
    "The planning mode controls now float at the bottom right of the screen when you scroll down",
  ],
  ["1.1.1", "Added icons to planning buttons, updated default templates"],
  ["1.1.0", "Added version update dialog"],
  ["1.0.0", "Initial release (beginning of version history)"],
];

const LOCALSTORAGE_KEY = "godfatMultitoolVersion";

const boxCss = css`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;

  padding: 20px;
`;

const grey = css`
  color: rgba(0, 0, 0, 0.6);
`;

export default function VersionUpdateModal() {
  const versionFromLocalStorage = localStorage.getItem(LOCALSTORAGE_KEY);
  const lastSeenUpdateIndex = UPDATES.findIndex(([version]) => {
    return version === versionFromLocalStorage;
  });

  // If -1 (localstorage version invalid) or > 0 (localstorage version outdated), show the modal
  const shouldDisplayUpdates = lastSeenUpdateIndex !== 0;

  // Default is for -1
  let newUpdates = UPDATES;
  let seenUpdates: typeof UPDATES = [];
  if (lastSeenUpdateIndex > 0) {
    newUpdates = UPDATES.slice(0, lastSeenUpdateIndex);
    seenUpdates = UPDATES.slice(lastSeenUpdateIndex);
  }

  const [open, setOpen] = useState(shouldDisplayUpdates);

  return (
    <Modal
      open={open}
      onClose={() => {
        localStorage.setItem(LOCALSTORAGE_KEY, CURRENT_VERSION);
        setOpen(false);
      }}
    >
      <Box css={boxCss}>
        <Typography variant="h6">
          <strong>Version Update</strong>
        </Typography>
        <Typography
          variant="caption"
          component="div"
          lineHeight="1.5em"
          css={grey}
        >
          <i>
            This dialog should only pop up once per device when the version
            updates.
            <br />
            Let me know if it shows up more frequently than that.
          </i>
        </Typography>
        <Typography variant="body2" css={{ marginTop: "8px" }}>
          <strong>New Updates</strong>
        </Typography>
        <ul css={{ margin: 0 }}>
          {newUpdates.map(([version, update]) => (
            <li key={version}>
              <Typography variant="caption" component="div" lineHeight="1.5em">
                <strong>v{version}</strong>: {update}
              </Typography>
            </li>
          ))}
        </ul>
        <Typography variant="body2" css={{ marginTop: "8px" }}>
          <strong>Seen Updates</strong>
        </Typography>
        <div css={grey}>
          <ul css={{ margin: 0 }}>
            {seenUpdates.map(([version, update]) => (
              <li key={version}>
                <Typography
                  variant="caption"
                  component="div"
                  lineHeight="1.5em"
                >
                  <strong>v{version}</strong>: {update}
                </Typography>
              </li>
            ))}
          </ul>
        </div>
      </Box>
    </Modal>
  );
}
