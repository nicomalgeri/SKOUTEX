export const ALLOWED_LEAGUES = [
  { id: 573, name: "Allsvenskan", country: "Sweden" },
  { id: 591, name: "Super League", country: "Switzerland" },
  { id: 600, name: "Super Lig", country: "Turkey" },
  { id: 609, name: "Premier League", country: "Ukraine" },
  { id: 181, name: "Admiral Bundesliga", country: "Austria" },
  { id: 208, name: "Pro League", country: "Belgium" },
  { id: 244, name: "1. HNL", country: "Croatia" },
  { id: 271, name: "Superliga", country: "Denmark" },
  { id: 72, name: "Eredivisie", country: "Netherlands" },
  { id: 444, name: "Eliteserien", country: "Norway" },
  { id: 453, name: "Ekstraklasa", country: "Poland" },
  { id: 462, name: "Liga Portugal", country: "Portugal" },
  { id: 486, name: "Premier League", country: "Russia" },
  { id: 501, name: "Premiership", country: "Scotland" },
  { id: 564, name: "La Liga", country: "Spain" },
  { id: 567, name: "La Liga 2", country: "Spain" },
  { id: 570, name: "Copa Del Rey", country: "Spain" },
  { id: 301, name: "Ligue 1", country: "France" },
  { id: 82, name: "Bundesliga", country: "Germany" },
  { id: 384, name: "Serie A", country: "Italy" },
  { id: 387, name: "Serie B", country: "Italy" },
  { id: 390, name: "Coppa Italia", country: "Italy" },
  { id: 8, name: "Premier League", country: "England" },
  { id: 9, name: "Championship", country: "England" },
  { id: 24, name: "FA Cup", country: "England" },
  { id: 27, name: "Carabao Cup", country: "England" },
  { id: 1371, name: "UEFA Europa League Play-offs", country: "Europe" },
] as const;

export const ALLOWED_LEAGUE_IDS: Set<number> = new Set(
  ALLOWED_LEAGUES.map((league) => league.id)
);
