import { gameState } from "./state.js?v=0.3.2";
import { addItem } from "./inventory.js?v=0.3.2";
import { attemptResonance } from "./recipes.js?v=0.3.2";
import { setupTabs, renderPlace, renderActions, renderInventory, renderResonancer, appendLog } from "./ui.js?v=0.3.3";

let maps = {};
let items = {};
let resonances = {};
let selectedOrder = [];

async function loadJson(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`${path} 불러오기 실패`);
  return response.json();
}

async function start() {
  try {
    setupTabs();
    [maps, items, resonances] = await Promise.all([
      loadJson("./data/maps.json"),
      loadJson("./data/items.json"),
      loadJson("./data/recipes.json")
    ]);
    renderCurrentPlace();
    appendLog("마을 광장에 도착했다.\n세계의 단서를 읽고, 재료 사이의 관계를 시험해 보자.", "system");
  } catch (error) {
    console.error(error);
    appendLog(`게임을 시작하지 못했다.\n${error.message}`, "error");
  }
}

function moveTo(placeId) {
  if (!maps[placeId]) return;
  gameState.location = placeId;
  renderCurrentPlace();
  appendLog(`> ${maps[placeId].name}(으)로 이동한다.\n${maps[placeId].name}에 도착했다.`);
}

function investigate(investigation) {
  appendLog(`> ${investigation.label}`, "action");

  if (gameState.discovered[investigation.id]) {
    appendLog(`${investigation.text}\n이미 이곳에서 가져갈 것은 챙겼다.`);
    return;
  }

  let message = investigation.text;
  if (investigation.item) {
    addItem(investigation.item, investigation.amount || 1);
    message += `\n${investigation.takeText || "아이템을 얻었다."}`;
  }
  gameState.discovered[investigation.id] = true;
  appendLog(message);
  renderCurrentPlace();
}

function selectResonanceItem(itemId) {
  const owned = gameState.inventory[itemId] || 0;
  const alreadySelected = selectedOrder.filter((id) => id === itemId).length;
  if (alreadySelected >= owned) return;

  selectedOrder.push(itemId);
  appendLog(`> ${items[itemId]?.name || itemId}을(를) 공허에 넣는다.`, "action");
  renderResonancerPanel();
}

function resetResonancer() {
  if (!selectedOrder.length) {
    appendLog("공허는 이미 비어 있다.", "muted");
    return;
  }

  selectedOrder = [];
  renderResonancerPanel();
  appendLog("공허를 비웠다. 재료들이 다시 손안으로 돌아왔다.");
}

function tryResonance() {
  appendLog("> 공명을 시도한다.", "action");
  const result = attemptResonance(resonances, selectedOrder);

  appendLog(result.reason, result.ok ? "success" : "failure");

  if (result.ok) {
    const resultName = items[result.resonance.result]?.name || result.resonance.result;
    appendLog(`✦ ${resultName} × ${result.resonance.amount || 1}을(를) 얻었다.`, "success");
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
