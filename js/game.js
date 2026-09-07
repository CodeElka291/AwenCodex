import { gameState } from "./state.js";
import { addItem } from "./inventory.js";
import { renderPlace, renderActions, renderInventory, showMessage } from "./ui.js";

let maps = {};
let items = {};

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${path} 불러오기 실패`);
  return response.json();
}

async function start() {
  try {
    [maps, items] = await Promise.all([
      loadJson("./data/maps.json"),
      loadJson("./data/items.json")
    ]);
    renderCurrentPlace();
    showMessage("마을 광장에 도착했다.");
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
}

start();
