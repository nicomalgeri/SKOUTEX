import { getSportmonksClient } from "@/lib/sportmonks";
import type { SportmonksPlayer } from "@/lib/sportmonks/types";

export async function getPlayer(playerId: number): Promise<SportmonksPlayer> {
  const client = getSportmonksClient();
  const response = await client.getPlayerById(
    playerId,
    "teams.team;position;nationality"
  );
  if (!response?.data) {
    throw new Error("Sportmonks player not found");
  }
  return response.data;
}
