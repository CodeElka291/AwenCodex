import { gameState } from "./state.js";
import { addItem } from "./inventory.js";
import { attemptResonance } from "./recipes.js";
import { renderPlace, renderActions, renderInventory, renderResonancer, showMessage } from "./ui.js";

let maps = {};
let items = {};
let recipes = {};
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
    showMessage("마을 광장에 도착했다. 세계의 단서를 읽고, 재료 사이의 관계를 시험해 보자.");
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

function selectResonanceItem(itemId) {
  const owned = gameState.inventory[itemId] || 0;
  const alreadySelected = selectedOrder.filter((id) => id === itemId).length;
  if (alreadySelected >= owned) return;

  selectedOrder.push(itemId);
  renderResonancerPanel();
}

function resetResonancer() {
  selectedOrder = [];
  renderResonancerPanel();
  showMessage("공허를 비웠다. 재료들은 다시 손안으로 돌아왔다.");
}

function tryResonance() {
  const result = attemptResonance(recipes, selectedOrder);
  showMessage(result.reason);

  if (result.ok) {
    selectedOrder = [];
  }

  renderCurrentPlace();
}

function renderResonancerPanel() {
  renderResonancer({
    items,
    inventory: gameState.inventory,
    selectedOrder,
    discoveredResonances: gameState.discoveredResonances,
    onSelect: selectResonanceItem,
    onReset: resetResonancer,
    onResonate: tryResonance
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
  renderResonancerPanel();
}

start();
