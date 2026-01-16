// Football positions with grouping for multi-select dropdown

export const FOOTBALL_POSITIONS = [
  // Goalkeepers
  { value: "GK", label: "Goalkeeper", group: "Goalkeepers" },

  // Defenders
  { value: "CB", label: "Centre-Back", group: "Defenders" },
  { value: "LB", label: "Left-Back", group: "Defenders" },
  { value: "RB", label: "Right-Back", group: "Defenders" },
  { value: "LWB", label: "Left Wing-Back", group: "Defenders" },
  { value: "RWB", label: "Right Wing-Back", group: "Defenders" },

  // Midfielders
  { value: "CDM", label: "Defensive Midfielder", group: "Midfielders" },
  { value: "CM", label: "Central Midfielder", group: "Midfielders" },
  { value: "CAM", label: "Attacking Midfielder", group: "Midfielders" },
  { value: "LM", label: "Left Midfielder", group: "Midfielders" },
  { value: "RM", label: "Right Midfielder", group: "Midfielders" },

  // Forwards
  { value: "LW", label: "Left Winger", group: "Forwards" },
  { value: "RW", label: "Right Winger", group: "Forwards" },
  { value: "ST", label: "Striker", group: "Forwards" },
  { value: "CF", label: "Centre Forward", group: "Forwards" },
] as const;

export type Position = (typeof FOOTBALL_POSITIONS)[number]["value"];

// Group positions by category
export const POSITION_GROUPS = {
  Goalkeepers: FOOTBALL_POSITIONS.filter((p) => p.group === "Goalkeepers"),
  Defenders: FOOTBALL_POSITIONS.filter((p) => p.group === "Defenders"),
  Midfielders: FOOTBALL_POSITIONS.filter((p) => p.group === "Midfielders"),
  Forwards: FOOTBALL_POSITIONS.filter((p) => p.group === "Forwards"),
} as const;

// Helper to get position label from value
export function getPositionLabel(value: string): string {
  const position = FOOTBALL_POSITIONS.find((p) => p.value === value);
  return position?.label || value;
}

// Helper to validate if a string is a valid position
export function isValidPosition(value: string): value is Position {
  return FOOTBALL_POSITIONS.some((p) => p.value === value);
}
