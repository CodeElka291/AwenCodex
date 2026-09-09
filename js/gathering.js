import { gameState } from "./state.js?v=0.5.0";

function weightedRoll(entries) {
  const total = entries.reduce((sum, entry) => sum + (entry.weight || 0), 0);
  let roll = Math.random() * total;
  for (const entry of entries) {
    roll -= entry.weight || 0;
    if (roll < 0) return entry;
  }
  return entries[entries.length - 1] || null;
}

function randomAmount(min = 1, max = min) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function isGatheringActive(nodeId) { return gameState.activeGathering === nodeId; }
export function getGatheringCooldownRemaining(nodeId) {
  const readyAt = gameState.gatheringCooldowns[nodeId] || 0;
  return Math.max(0, readyAt - Date.now());
}
export function canGather(nodeId) { return !gameState.activeGathering && getGatheringCooldownRemaining(nodeId) <= 0; }
export function startGathering(nodeId) {
  if (!canGather(nodeId)) return false;
  gameState.activeGathering = nodeId;
  return true;
}
export function finishGathering(nodeId, node) {
  if (gameState.activeGathering !== nodeId) return null;
  const loot = weightedRoll(node.loot || []);
  gameState.activeGathering = null;
  gameState.gatheringCooldowns[nodeId] = Date.now() + (node.respawn || 0);
  if (!loot || !loot.item) return { ok: false };
  return { ok: true, item: loot.item, amount: randomAmount(loot.min || 1, loot.max || loot.min || 1) };
}
