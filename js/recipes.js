import { gameState } from "./state.js?v=0.4.0";
import { addItem, hasItem, removeItem } from "./inventory.js?v=0.4.0";

function countItems(itemIds) {
  const counts = {};
  for (const itemId of itemIds) {
    counts[itemId] = (counts[itemId] || 0) + 1;
  }
  return counts;
}

function hasSelectedItems(selectedOrder) {
  return Object.entries(countItems(selectedOrder)).every(([itemId, amount]) => hasItem(itemId, amount));
}

function matchesResonance(resonance, selectedOrder) {
  if (resonance.ingredients.length !== selectedOrder.length) return false;
  return resonance.ingredients.every((itemId, index) => itemId === selectedOrder[index]);
}

export function attemptResonance(resonances, selectedOrder) {
  if (!selectedOrder.length) {
    return { ok: false, reason: "공허에 아직 아무것도 넣지 않았다." };
  }

  if (!hasSelectedItems(selectedOrder)) {
    return { ok: false, reason: "선택한 재료 중 일부가 부족하다." };
  }

  const match = Object.entries(resonances).find(([, resonance]) => matchesResonance(resonance, selectedOrder));

  if (!match) {
    return {
      ok: false,
      reason: "공허가 잠시 흔들렸지만 공명은 일어나지 않았다. 재료에는 변화가 없다."
    };
  }

  const [resonanceId, resonance] = match;

  for (const itemId of selectedOrder) {
    removeItem(itemId, 1);
  }

  addItem(resonance.result, resonance.amount || 1);
  gameState.discoveredResonances[resonanceId] = true;
  gameState.discovered[`resonance_${resonance.result}`] = true;

  return {
    ok: true,
    resonanceId,
    resonance,
    reason: resonance.successText || "서로 다른 Awen이 하나의 관계로 공명했다."
  };
}
