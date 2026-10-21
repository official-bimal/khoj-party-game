"use client";
import { useGame } from "@/stores/game-store";
import { OfflineGame } from "./offline-game";
// Keep the offline round inside the already-loaded shell. An offline App Router
// navigation can otherwise fall back to a document reload and erase private state.
export function Experience({ children }: { children: React.ReactNode }) {
  const active = useGame((s) => s.round !== null);
  return active ? <OfflineGame /> : children;
}
