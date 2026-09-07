import { gameState } from "./state.js";
import { addItem } from "./inventory.js";
import { craftInOrder } from "./recipes.js";
import { renderPlace, renderActions, renderInventory, renderCrafting, showMessage } from "./ui.js";

let maps = {};
let items = {};
let recipes = {};
let selectedRecipeId = "letter_restoration_ink";
let selectedOrder = [];

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${path} 불러오기 실패`);
  return response.json();
}

async function start() {
  try {
    [maps, items, recipes] = await Promise.all([
      loadJson("./data/maps.json"),
      loadJson("./data/items.json"),
      loadJson("./data/recipes.json")
    ]);
    renderCurrentPlace();
    showMessage("마을 광장에 도착했다. 재료를 찾아 글자 복원 잉크를 만들어 보자.");
  } catch (error) {
    console.error(error);
    showMessage(`게임을 시작하지 못했다.\n${error.message}`);
  }
}

function moveTo(placeId) {
  if (!maps[placeId]) return;
  gameState.location = placeId;
  renderCurrentPlace();
  showMessage(`${maps[placeId].name}에 도착했다.`);
}

function investigate(investigation) {
  if (gameState.discovered[investigation.id]) {
    showMessage(`${investigation.text}\n\n이미 이곳에서 가져갈 것은 챙겼다.`);
    return;
  }

  let message = investigation.text;
  if (investigation.item) {
    addItem(investigation.item, investigation.amount || 1);
    message += `\n\n${investigation.takeText || "아이템을 얻었다."}`;
  }
  gameState.discovered[investigation.id] = true;
  showMessage(message);
  renderCurrentPlace();
}

function selectCraftItem(itemId) {
  const owned = gameState.inventory[itemId] || 0;
  const alreadySelected = selectedOrder.filter((id) => id === itemId).length;
  if (alreadySelected >= owned) return;

  const recipe = recipes[selectedRecipeId];
  if (!recipe || selectedOrder.length >= recipe.ingredients.length) return;

  selectedOrder.push(itemId);
  renderCraftingPanel();
}

function resetCrafting() {
  selectedOrder = [];
  renderCraftingPanel();
  showMessage("조합 순서를 비웠다. 재료를 처음부터 다시 골라 보자.");
}

function tryCraft() {
  const recipe = recipes[selectedRecipeId];
  if (!recipe) return;

  const result = craftInOrder(recipe, selectedOrder);
  showMessage(result.reason);

  if (result.ok) {
    selectedOrder = [];
  }

  renderCurrentPlace();
}

function renderCraftingPanel() {
  const recipe = recipes[selectedRecipeId];
  renderCrafting({
    recipe,
    items,
    inventory: gameState.inventory,
    selectedOrder,
    onSelect: selectCraftItem,
    onReset: resetCrafting,
    onCraft: tryCraft
  });
}

function renderCurrentPlace() {
  const place = maps[gameState.location];
  renderPlace(place);

  const actions = [];
  for (const investigation of place.investigations || []) {
    actions.push({
      label: gameState.discovered[investigation.id]
        ? `${investigation.label} ✓`
        : investigation.label,
      onClick: () => investigate(investigation)
    });
  }
  for (const exit of place.exits || []) {
    actions.push({ label: exit.label, onClick: () => moveTo(exit.to) });
  }

  renderActions(actions);
  renderInventory(gameState.inventory, items);
  renderCraftingPanel();
}

start();
