"use client";

import { useEffect, useState } from "react";
import type { ClubContext } from "@/lib/club/context";
import { getFitScoreGate, FitScoreGateResult } from "@/lib/club-context/fitScoreGate";

type GateState = {
  gate: FitScoreGateResult;
  loading: boolean;
};

export function useFitScoreGate(): GateState {
  const [state, setState] = useState<GateState>(() => ({
    gate: getFitScoreGate(null),
    loading: true,
  }));

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/club/context");
        const result = response.ok ? await response.json() : null;
        const context = result?.context as ClubContext | undefined;
        if (active) {
          setState({ gate: getFitScoreGate(context ?? null), loading: false });
        }
      } catch {
        if (active) {
          setState({ gate: getFitScoreGate(null), loading: false });
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  return state;
}
