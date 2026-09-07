import { gameState } from "./state.js";
import { addItem, hasItem, removeItem } from "./inventory.js";

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

function matchesRecipe(recipe, selectedOrder) {
  if (recipe.ingredients.length !== selectedOrder.length) return false;
  return recipe.ingredients.every((itemId, index) => itemId === selectedOrder[index]);
}

export function attemptResonance(recipes, selectedOrder) {
  if (!selectedOrder.length) {
    return { ok: false, reason: "공허에 아직 아무것도 넣지 않았다." };
  }

  if (!hasSelectedItems(selectedOrder)) {
    return { ok: false, reason: "선택한 재료 중 일부가 부족하다." };
  }

  const match = Object.entries(recipes).find(([, recipe]) => matchesRecipe(recipe, selectedOrder));

  if (!match) {
    return {
      ok: false,
      reason: "공허가 잠시 흔들렸지만 공명은 일어나지 않았다. 재료들은 다시 현실로 돌아왔다."
    };
  }

  const [resonanceId, recipe] = match;

  for (const itemId of selectedOrder) {
    removeItem(itemId, 1);
  }

  addItem(recipe.result, recipe.amount || 1);
  gameState.discoveredResonances[resonanceId] = true;
  gameState.discovered[`crafted_${recipe.result}`] = true;

  return {
    ok: true,
    resonanceId,
    recipe,
    reason: recipe.successText || "서로 다른 Awen이 하나의 관계로 공명했다."
  };
}
