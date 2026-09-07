import { gameState } from "./state.js?v=0.3.1";

export function addItem(itemId, amount = 1) {
  gameState.inventory[itemId] = (gameState.inventory[itemId] || 0) + amount;
}

export function hasItem(itemId, amount = 1) {
  return (gameState.inventory[itemId] || 0) >= amount;
}

export function removeItem(itemId, amount = 1) {
  if (!hasItem(itemId, amount)) return false;
  gameState.inventory[itemId] -= amount;
  if (gameState.inventory[itemId] <= 0) delete gameState.inventory[itemId];
  return true;
}
