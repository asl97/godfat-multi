import React, { useEffect } from "react";
import { useGodfatQuery } from "./utils/godfat";
import UrlInput, { BannerSelectOption } from "./UrlInput";
import {
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import styled from "@emotion/styled";
import { BannerData, ConfigData } from "./Page";

const generateKey = () => Math.random().toString(36).substring(7);

type UrlInputData = {
  key: string;
  value: BannerData;
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

const Row = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  margin: 10px 0;
`;

export default function ConfigContainer({
  setConfigData,
}: {
  setConfigData: (data: ConfigData) => void;
}) {
  const { query: eventsQuery } = useGodfatQuery("https://bc.godfat.org/");

  const [seed, setSeed] = React.useState<string>("");
  const [overrideSeeds, setOverrideSeeds] = React.useState<boolean>(true);
  const [inputs, setInputs] = React.useState<UrlInputData[]>([]);

  // Will be scraped from godfat
  const [bannerSelectOptions, setBannerSelectOptions] = React.useState<
    BannerSelectOption[]
  >([]);

  useEffect(() => {
    const parseQueryResult = async () => {
      if (!eventsQuery?.data) return;
      const dataText = await eventsQuery.data.text();
      const dataDom = new DOMParser().parseFromString(dataText, "text/html");
      const parsedBanners = parseBannersFromHtml(dataDom);
      setBannerSelectOptions(parsedBanners);
    };
    parseQueryResult();

    return () => {};
  }, [eventsQuery?.data]);

  if (eventsQuery?.isLoading) {
    return <Typography variant="h5">Loading banner data...</Typography>;
  }
  if (eventsQuery?.isError) {
    return <Typography variant="h5">Error fetching banner data!</Typography>;
  }

  const addNewInput = () => {
    setInputs((inputs) => [
      ...inputs,
      { key: generateKey(), value: { label: "", url: "" } },
    ]);
  };

  const removeInput = (key: string) => {
    setInputs((inputs) => inputs.filter((input) => input.key !== key));
  };

  const setInputValue = (key: string, value: BannerData) => {
    setInputs((inputs) => {
      const index = inputs.findIndex((input) => input.key === key);
      return [
        ...inputs.slice(0, index),
        { key, value },
        ...inputs.slice(index + 1),
      ];
    });
  };

  const onSubmit = () => {
    const bannerData = inputs.map(({ value }) => {
      const baseUrl = new URL(value.url);
      // Selecting a banner will construct a URL without a seed, so just do it here
      if (overrideSeeds || !baseUrl.searchParams.has("seed")) {
        baseUrl.searchParams.set("seed", seed);
      }
      return {
        label: value.label,
        url: baseUrl.toString(),
      };
    });
    setConfigData({ bannerData });
  };

  return (
    <div>
      <Row>
        <TextField
          id="seed-input"
          size="small"
          label="Gacha seed"
          placeholder="123456..."
          variant="outlined"
          value={seed}
          onChange={(event) => {
            setSeed(event.target.value);
          }}
          error={isNaN(Number(seed)) || Number(seed) === 0}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={overrideSeeds}
              onChange={(event) => setOverrideSeeds(event.target.checked)}
            />
          }
          label="Use to override seeds in direct links"
        />
      </Row>
      <Row>
        <Button variant="outlined" onClick={addNewInput}>
          Add new track
        </Button>
      </Row>
      {inputs.map(({ key }) => (
        <UrlInput
          key={key}
          id={key}
          bannerSelectOptions={bannerSelectOptions}
          removeSelf={() => removeInput(key)}
          setSelfValue={(value) => setInputValue(key, value)}
        />
      ))}
      <Row>
        <Button variant="contained" onClick={() => onSubmit()}>
          Submit / Update
        </Button>
      </Row>
    </div>
  );
}
