import React, { useEffect } from "react";

import { BannerSelectOption, isGodfatUrl } from "./utils/godfat";

import { FormControl, IconButton, InputLabel, Select } from "@mui/material";
import TextField from "@mui/material/TextField/TextField";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton/ToggleButton";
import { DeleteForever, List, TextFields } from "@mui/icons-material";
import styled from "@emotion/styled";
import { BannerData } from "./Page";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin: 15px 0 10px 0;
`;

export default function UrlInput({
  id,
  bannerSelectOptions,
  removeSelf,
  setSelfValue,
}: {
  id: string;
  bannerSelectOptions: BannerSelectOption[];
  removeSelf: () => void;
  setSelfValue: (value: BannerData) => void;
}) {
  const [inputType, setInputType] = React.useState<"select" | "input">(
    "select"
  );
  const [selectedBanner, setSelectedBanner] = React.useState<string>("");
  const [numFutureUbers, setNumFutureUbers] = React.useState<number>(0);
  const [inputUrl, setInputUrl] = React.useState<string>("");
  const [customName, setCustomName] = React.useState<string>("");

  useEffect(() => {
    if (sessionStorage.getItem(`${id}:inputType`)) {
      setInputType(
        sessionStorage.getItem(`${id}:inputType`) as "select" | "input"
      );
    }
    if (sessionStorage.getItem(`${id}:selectedBanner`)) {
      setSelectedBanner(
        sessionStorage.getItem(`${id}:selectedBanner`) as string
      );
    } else {
      setSelectedBanner(bannerSelectOptions[0].options[0].value);
    }
    if (sessionStorage.getItem(`${id}:numFutureUbers`)) {
      setNumFutureUbers(
        parseInt(sessionStorage.getItem(`${id}:numFutureUbers`) as string)
      );
    } else {
      setNumFutureUbers(0);
    }
    if (sessionStorage.getItem(`${id}:inputUrl`)) {
      setInputUrl(sessionStorage.getItem(`${id}:inputUrl`) as string);
    }
    if (sessionStorage.getItem(`${id}:customName`)) {
      setCustomName(sessionStorage.getItem(`${id}:customName`) as string);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(`${id}:inputType`, inputType);
    sessionStorage.setItem(`${id}:selectedBanner`, selectedBanner);
    sessionStorage.setItem(`${id}:numFutureUbers`, numFutureUbers.toString());
    sessionStorage.setItem(`${id}:inputUrl`, inputUrl);
    sessionStorage.setItem(`${id}:customName`, customName);
    if (inputType === "input") {
      setSelfValue({
        label: customName,
        url: inputUrl,
      });
    } else if (inputType === "select") {
      const baseUrl = new URL("https://bc.godfat.org/");
      if (numFutureUbers > 0) {
        baseUrl.searchParams.set("ubers", numFutureUbers.toString());
      }
      baseUrl.searchParams.set("event", selectedBanner);
      setSelfValue({
        label: customName,
        url: baseUrl.toString(),
      });
    }
  }, [inputType, selectedBanner, numFutureUbers, inputUrl, customName]);

  return (
    <Container>
      <IconButton onClick={removeSelf}>
        <DeleteForever />
      </IconButton>
      <ToggleButtonGroup
        size="small"
        exclusive
        value={inputType}
        onChange={(_, value) => {
          if (value === null) return;
          setInputType(value);
        }}
      >
        <ToggleButton value="select">
          <List />
        </ToggleButton>
        <ToggleButton value="input">
          <TextFields />
        </ToggleButton>
      </ToggleButtonGroup>
      {inputType === "select" ? (
        <>
          <FormControl>
            <InputLabel id={`banner-select-${id}`} shrink>
              Select banner
            </InputLabel>
            <Select
              notched
              native
              size="small"
              labelId={`banner-select-${id}`}
              label="Select banner"
              value={selectedBanner}
              onChange={(event) => {
                setSelectedBanner(event.target.value as string);
              }}
              style={{ flex: 1 }}
            >
              {bannerSelectOptions.map(({ groupLabel, options }) => (
                <optgroup key={groupLabel} label={groupLabel}>
                  {options.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </Select>
          </FormControl>
          <FormControl style={{ minWidth: "120px" }}>
            <InputLabel id={`uber-select-${id}`}>Future ubers</InputLabel>
            <Select
              native
              size="small"
              labelId={`uber-select-${id}`}
              label="Future ubers"
              value={numFutureUbers}
              onChange={(event) =>
                setNumFutureUbers(event.target.value as number)
              }
            >
              {[...Array(10).keys()].map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </Select>
          </FormControl>
        </>
      ) : (
        <TextField
          size="small"
          label="Input direct link"
          placeholder="https://bc.godfat.org/..."
          variant="outlined"
          value={inputUrl}
          onChange={(event) => setInputUrl(event.target.value)}
          error={inputUrl !== "" && !isGodfatUrl(inputUrl)}
          style={{ flex: 1, maxWidth: "1024px" }}
        />
      )}
      <TextField
        id={id}
        size="small"
        label="Custom name"
        placeholder="(Optional)"
        variant="outlined"
        value={customName}
        onChange={(event) => setCustomName(event.target.value)}
        style={{ flex: 1, minWidth: "150px", maxWidth: "150px" }}
      />
    </Container>
  );
}
