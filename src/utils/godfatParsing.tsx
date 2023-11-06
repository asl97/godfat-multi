export type CatCell = {
  color: string;
  mainCat: {
    text: string;
  };
  altCat?: {
    text: string;
    destinationRow: number;
    destinationTrack: string;
  };

  guaranteeColor: string;
  guaranteeMainCat?: {
    text: string;
    destinationRow: number;
    destinationTrack: string;
  };
  guaranteeAltCat?: {
    text: string;
    destinationRow: number;
    destinationTrack: string;
  };
};

const getColorFromClass = (className: string): string => {
  const COLOR_MAP = {
    rare: "white",
    owned: "azure",
    supa_fest: "yellow",
    supa: "gold",
    uber_fest: "salmon",
    uber: "red",
    exclusive: "aqua",
    found: "lime",
    legend: "darkviolet",
  };

  for (const classNameEntry of className.split(" ")) {
    if (classNameEntry in COLOR_MAP) {
      return COLOR_MAP[classNameEntry as keyof typeof COLOR_MAP];
    }
  }
  return "white";
};

const extractCatStringFromTd = (td: HTMLElement): string => {
  return td.textContent!.replace("🐾", "").replace("\n", "").trim();
};

const extractMovementDataFromCatString = (
  catString: string
): { text: string; destinationRow: number; destinationTrack: string } => {
  const splitCatString = catString.split(" ");
  const destination =
    splitCatString[0] === "<-"
      ? splitCatString[1]
      : splitCatString[splitCatString.length - 1];
  const destinationTrack = destination.slice(destination.length - 1);
  const destinationRow = parseInt(
    destination.slice(0, destination.length - 1),
    10
  );
  return {
    text: catString,
    destinationRow,
    destinationTrack,
  };
};

export const extractCatsFromTable = (
  table: HTMLElement,
  track: "A" | "B"
): CatCell[] => {
  const trackA = track === "A";
  const res: CatCell[] = [];

  let numDataRows = 0;
  let numSkipRows = 0;
  let currentCatCell: CatCell | null = null;
  for (const row of table.getElementsByTagName("tr")) {
    const lastIndex = row.children.length - 1;

    const dataRowsDeterminer =
      row.children[trackA ? 0 : lastIndex].getAttribute("rowspan");
    const skipRowsDeterminer =
      row.children[trackA ? 1 : lastIndex - 1].getAttribute("rowspan");
    if (
      isNaN(Number(dataRowsDeterminer)) ||
      isNaN(Number(skipRowsDeterminer))
    ) {
      continue;
    }

    if (numSkipRows > 0) {
      // Skip this row
      numSkipRows--;
      numDataRows--;
    } else if (numDataRows > 0) {
      // Still have more data to read
      const normalCol = row.children[trackA ? 0 : lastIndex - 1];
      const guaranteeCol = row.children[trackA ? 1 : lastIndex];
      const data = extractCatStringFromTd(normalCol as HTMLElement);
      const guaranteeData = extractCatStringFromTd(guaranteeCol as HTMLElement);
      if (currentCatCell?.mainCat) {
        currentCatCell.altCat = extractMovementDataFromCatString(data);
        currentCatCell.guaranteeAltCat =
          extractMovementDataFromCatString(guaranteeData);
      } else {
        currentCatCell = {
          color: getColorFromClass(normalCol.getAttribute("class")!),
          guaranteeColor: getColorFromClass(
            guaranteeCol.getAttribute("class")!
          ),
          mainCat: { text: data },
          guaranteeMainCat: extractMovementDataFromCatString(guaranteeData),
        };
      }
      numDataRows--;
    } else {
      // Start a new data section, but don't read the current row (it's blank)
      if (currentCatCell) {
        res.push(currentCatCell);
        currentCatCell = null;
      }
      numDataRows = Number(dataRowsDeterminer) - 1;
      numSkipRows = Number(skipRowsDeterminer) - 1;
    }
  }
  if (currentCatCell) {
    res.push(currentCatCell);
  }

  return res;
};
