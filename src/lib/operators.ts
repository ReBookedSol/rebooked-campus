// Catalog of South African public-transport operators powering ReBooked Travel.
// Used by the Services tab and to colorise routes consistently across the app.

export type OperatorInfo = {
  key: string;            // matches `routes.operator` value (lowercase)
  name: string;           // human-readable
  short: string;
  type: "Train" | "BRT" | "Bus" | "Mixed";
  color: string;          // hex
  cities: string[];
  website?: string;
  description: string;
  fareNote?: string;
};

export const OPERATORS: OperatorInfo[] = [
  {
    key: "gautrain",
    name: "Gautrain",
    short: "Gautrain",
    type: "Train",
    color: "#f59e0b",
    cities: ["Johannesburg", "Pretoria", "Sandton", "OR Tambo"],
    website: "https://www.gautrain.co.za",
    description:
      "Gauteng's premium high-speed commuter rail linking Johannesburg, Pretoria, Sandton and OR Tambo International. Pay with a Gautrain Gold Card.",
    fareNote: "Distance-based fares (R23 – R110+).",
  },
  {
    key: "metrorail",
    name: "Metrorail",
    short: "Metrorail",
    type: "Train",
    color: "#0ea5e9",
    cities: ["Cape Town", "Johannesburg", "Pretoria", "Durban", "Gqeberha", "East London"],
    website: "https://www.prasa.com",
    description:
      "PRASA's nation-wide commuter rail network serving major metros. The most affordable mass transit option in SA, currently rebuilding lines after vandalism.",
    fareNote: "Single tickets from R10.",
  },
  {
    key: "myciti",
    name: "MyCiTi",
    short: "MyCiTi",
    type: "BRT",
    color: "#e11d48",
    cities: ["Cape Town"],
    website: "https://www.myciti.org.za",
    description:
      "Cape Town's bus-rapid-transit (BRT) system with trunk, feeder, express and area routes. Cashless — top up a myconnect card.",
    fareNote: "Distance + peak/off-peak pricing.",
  },
  {
    key: "rea_vaya",
    name: "Rea Vaya",
    short: "Rea Vaya",
    type: "BRT",
    color: "#16a34a",
    cities: ["Johannesburg"],
    website: "https://www.reavaya.org.za",
    description:
      "Johannesburg's BRT spanning Soweto to the inner city and Sandton, with dedicated red-lane buses and timetabled trunk + complementary services.",
    fareNote: "Zone-based, R8 – R20.",
  },
  {
    key: "a_re_yeng",
    name: "A Re Yeng",
    short: "A Re Yeng",
    type: "BRT",
    color: "#7c3aed",
    cities: ["Pretoria", "Tshwane"],
    website: "https://www.tshwane.gov.za",
    description:
      "Tshwane's BRT system — trunk + feeder buses connecting Hatfield, Menlyn, the CBD and Mamelodi. Tap-and-go Connector card.",
    fareNote: "From R8 per trip.",
  },
  {
    key: "putco",
    name: "PUTCO",
    short: "PUTCO",
    type: "Bus",
    color: "#0891b2",
    cities: ["Gauteng", "Mpumalanga", "Limpopo"],
    website: "https://www.putco.co.za",
    description:
      "South Africa's largest commuter bus operator, running long-distance township-to-city services for daily commuters across multiple provinces.",
    fareNote: "Weekly/monthly clip-cards available.",
  },
  {
    key: "harambee",
    name: "Harambee",
    short: "Harambee",
    type: "Bus",
    color: "#d97706",
    cities: ["Johannesburg"],
    description:
      "Complementary bus services feeding into Joburg's BRT network and key transit hubs.",
  },
];

export const getOperator = (key?: string | null): OperatorInfo | undefined => {
  if (!key) return undefined;
  const k = key.toLowerCase();
  return OPERATORS.find((o) => o.key === k);
};

export const operatorColor = (key?: string | null): string =>
  getOperator(key)?.color ?? "#64748b";

export const operatorLabel = (key?: string | null): string =>
  getOperator(key)?.name ?? (key ? key.replace(/_/g, " ") : "Operator");
