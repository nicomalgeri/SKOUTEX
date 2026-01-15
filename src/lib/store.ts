import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Player, ChatMessage, PlayerSearchFilters } from "./types";

interface AppState {
  // User & Auth
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    clubId: string;
  } | null;
  setUser: (user: AppState["user"]) => void;
  clearUser: () => void;

  // Club Profile
  clubProfile: {
    id: string;
    name: string;
    logo?: string;
    playingModel?: {
      formation: string;
      style: string;
      buildUpPlay: string;
      pressingIntensity: string;
    };
    onboardingCompleted: boolean;
  } | null;
  setClubProfile: (profile: AppState["clubProfile"]) => void;

  // Player Search
  searchFilters: PlayerSearchFilters;
  setSearchFilters: (filters: Partial<PlayerSearchFilters>) => void;
  clearSearchFilters: () => void;

  // Selected Players (for comparison)
  selectedPlayers: Player[];
  addSelectedPlayer: (player: Player) => void;
  removeSelectedPlayer: (playerId: string) => void;
  clearSelectedPlayers: () => void;

  // Watchlist
  watchlistIds: string[];
  addToWatchlist: (playerId: string) => void;
  removeFromWatchlist: (playerId: string) => void;

  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;

  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  language: "en" | "es" | "ar";
  setLanguage: (language: "en" | "es" | "ar") => void;

  // Recent Searches
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
}

const defaultFilters: PlayerSearchFilters = {
  query: "",
  positions: [],
  ageRange: { min: 16, max: 40 },
  leagues: [],
  nationalities: [],
  transferStatus: [],
  sortBy: "fitScore",
  sortOrder: "desc",
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // User & Auth
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),

      // Club Profile
      clubProfile: null,
      setClubProfile: (profile) => set({ clubProfile: profile }),

      // Player Search
      searchFilters: defaultFilters,
      setSearchFilters: (filters) =>
        set((state) => ({
          searchFilters: { ...state.searchFilters, ...filters },
        })),
      clearSearchFilters: () => set({ searchFilters: defaultFilters }),

      // Selected Players
      selectedPlayers: [],
      addSelectedPlayer: (player) =>
        set((state) => {
          if (state.selectedPlayers.length >= 4) return state;
          if (state.selectedPlayers.find((p) => p.id === player.id)) return state;
          return { selectedPlayers: [...state.selectedPlayers, player] };
        }),
      removeSelectedPlayer: (playerId) =>
        set((state) => ({
          selectedPlayers: state.selectedPlayers.filter((p) => p.id !== playerId),
        })),
      clearSelectedPlayers: () => set({ selectedPlayers: [] }),

      // Watchlist
      watchlistIds: [],
      addToWatchlist: (playerId) =>
        set((state) => {
          if (state.watchlistIds.includes(playerId)) return state;
          return { watchlistIds: [...state.watchlistIds, playerId] };
        }),
      removeFromWatchlist: (playerId) =>
        set((state) => ({
          watchlistIds: state.watchlistIds.filter((id) => id !== playerId),
        })),

      // Chat
      chatMessages: [],
      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        })),
      clearChat: () => set({ chatMessages: [] }),

      // UI State
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      language: "en",
      setLanguage: (language) => set({ language }),

      // Recent Searches
      recentSearches: [],
      addRecentSearch: (query) =>
        set((state) => {
          const searches = [query, ...state.recentSearches.filter((s) => s !== query)].slice(0, 10);
          return { recentSearches: searches };
        }),
    }),
    {
      name: "skoutex-storage",
      partialize: (state) => ({
        watchlistIds: state.watchlistIds,
        recentSearches: state.recentSearches,
        sidebarOpen: state.sidebarOpen,
        language: state.language,
      }),
    }
  )
);
