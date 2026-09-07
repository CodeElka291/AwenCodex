import { gameState } from "./state.js";
import { addItem, hasItem, removeItem } from "./inventory.js";

export function canCraft(recipe) {
  const counts = {};
  for (const itemId of recipe.ingredients) {
    counts[itemId] = (counts[itemId] || 0) + 1;
  }
  return Object.entries(counts).every(([itemId, amount]) => hasItem(itemId, amount));
}

export function craftInOrder(recipe, selectedOrder) {
  if (selectedOrder.length !== recipe.ingredients.length) {
    return { ok: false, reason: "재료를 모두 순서대로 넣어야 한다." };
  }

  const correct = recipe.ingredients.every((itemId, index) => itemId === selectedOrder[index]);
  if (!correct) {
    return { ok: false, reason: "재료의 순서가 맞지 않는다. 아직 잉크가 안정되지 않았다." };
  }

  if (!canCraft(recipe)) {
    return { ok: false, reason: "필요한 재료가 부족하다." };
  }

  for (const itemId of recipe.ingredients) {
    removeItem(itemId, 1);
  }
  addItem(recipe.result, recipe.amount || 1);
  gameState.discovered[`crafted_${recipe.result}`] = true;

  return { ok: true, reason: recipe.successText || "조합에 성공했다." };
}
