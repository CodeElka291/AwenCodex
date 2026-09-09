import { gameState } from "./state.js?v=0.5.0";
import { addItem } from "./inventory.js?v=0.5.0";
import { attemptResonance } from "./recipes.js?v=0.5.0";
import { canGather, finishGathering, getGatheringCooldownRemaining, isGatheringActive, startGathering } from "./gathering.js?v=0.5.0";
import { setupTabs, renderPlace, renderActions, renderInventory, renderResonancer, appendLog } from "./ui.js?v=0.4.0";

let maps = {};
let items = {};
let resonances = {};
let gatherings = {};
let prologue = {};
let selectedOrder = [];
let storyRun = 0;

async function loadJson(path) { const response = await fetch(path, { cache: "no-store" }); if (!response.ok) throw new Error(`${path} 불러오기 실패`); return response.json(); }
function wait(ms) { return new Promise((resolve) => window.setTimeout(resolve, ms)); }
function storyDelay(line) { const trimmed = line.trim(); if (!trimmed) return 260; if (trimmed === "……" || trimmed === "..." || trimmed === "…") return 900; if (trimmed === "턱." || trimmed === "턱") return 1300; if (trimmed === "휙." || trimmed === "휙") return 650; if (trimmed.length <= 8) return 650; return 520; }
function sceneLines(scene) {
  if (Array.isArray(scene?.lines)) return scene.lines.map(line => ({ text: String(line?.text ?? ""), delay: Number(line?.delay ?? storyDelay(String(line?.text ?? ""))) }));
  return String(scene?.text || "").split("\n").map(text => ({ text, delay: storyDelay(text) }));
}
async function playStoryScene(scene, kind = "normal") {
  const run = ++storyRun;
  for (const line of sceneLines(scene)) {
    if (run !== storyRun) return false;
    if (!line.text.trim()) { await wait(line.delay || 240); continue; }
    appendLog(line.text, kind);
    await wait(Math.max(0, line.delay));
  }
  return run === storyRun;
}
function setResonancerVisible(visible) { const tab = document.querySelector("#tab-resonancer"); const tabbar = document.querySelector(".tabbar"); if (tab) tab.classList.toggle("hidden", !visible); if (tabbar) tabbar.classList.toggle("prologue", !visible); }
function weightedChoice(entries) { const total = entries.reduce((sum, entry) => sum + (entry.weight || 0), 0); if (total <= 0) return null; let roll = Math.random() * total; for (const entry of entries) { roll -= entry.weight || 0; if (roll < 0) return entry; } return entries[entries.length - 1] || null; }
function rollTransitionEncounter(placeId) { const place = maps[placeId]; const encounter = weightedChoice(place?.transition?.encounters || []); if (!encounter) return null; if (encounter.node && getGatheringCooldownRemaining(encounter.node) > 0) return { node: null, text: "젖은 돌과 뿌리 사이를 지나지만, 지금은 새로 눈에 띄는 흔적이 없다." }; return encounter; }

async function start() {
  try {
    setupTabs();
    [maps, items, resonances, gatherings, prologue] = await Promise.all([loadJson("./data/maps.json"), loadJson("./data/items.json"), loadJson("./data/recipes.json"), loadJson("./data/gathering.json"), loadJson("./data/prologue.json")]);
    setResonancerVisible(gameState.mode !== "prologue");
    if (gameState.mode === "prologue") renderPrologueScene(); else renderCurrentPlace();
  } catch (error) { console.error(error); appendLog(`게임을 시작하지 못했다.\n${error.message}`, "error"); }
}

async function renderPrologueScene() {
  const scene = prologue[gameState.prologueScene]; if (!scene) return;
  renderPlace({ name: scene.place, description: scene.description }); renderActions([]); renderInventory(gameState.inventory, items);
  const finished = await playStoryScene(scene, gameState.prologueScene === "first_catch" ? "success" : "normal"); if (!finished) return;
  renderActions((scene.actions || []).map((action) => ({ label: action.label, onClick: () => advancePrologue(action) })));
}

function advancePrologue(action) {
  storyRun++; appendLog(`> ${action.label}`, "action");
  if (action.end) {
    gameState.mode = "world"; gameState.location = "square"; setResonancerVisible(true);
    appendLog("CHAPTER 1\n백만 번 해봤다. 이제 이것이 무엇인지 알아볼 차례다.", "system"); renderCurrentPlace(); return;
  }
  if (!action.next || !prologue[action.next]) return; gameState.prologueScene = action.next; renderPrologueScene();
}

function moveTo(placeId) { if (!maps[placeId] || gameState.activeGathering) return; gameState.location = placeId; const encounter = rollTransitionEncounter(placeId); gameState.transitionEncounter = encounter ? { location: placeId, nodeId: encounter.node || null } : null; renderCurrentPlace(); appendLog(`> ${maps[placeId].name}(으)로 이동한다.\n${maps[placeId].name}에 도착했다.`); if (encounter?.text) appendLog(encounter.text, encounter.node ? "system" : "muted"); }
function investigate(investigation) { appendLog(`> ${investigation.label}`, "action"); if (gameState.discovered[investigation.id]) { appendLog(`${investigation.text}\n이미 이곳에서 가져갈 것은 챙겼다.`); return; } let message = investigation.text; if (investigation.item) { addItem(investigation.item, investigation.amount || 1); message += `\n${investigation.takeText || "아이템을 얻었다."}`; } gameState.discovered[investigation.id] = true; appendLog(message); renderCurrentPlace(); }
function gather(nodeId) { const node = gatherings[nodeId]; if (!node || !canGather(nodeId) || !startGathering(nodeId)) return; appendLog(`> ${node.action}`, "action"); appendLog(node.searchText || "주변을 천천히 살펴보는 중…", "muted"); renderCurrentPlace(); window.setTimeout(() => { const result = finishGathering(nodeId, node); if (!result) return; if (result.ok) { addItem(result.item, result.amount); const itemName = items[result.item]?.name || result.item; appendLog(`${node.successText || "쓸 만한 재료를 발견했다."}\n${itemName} ×${result.amount}을(를) 얻었다.`, "success"); } else appendLog(node.failureText || "쓸 만한 재료를 찾지 못했다.", "failure"); if (gameState.transitionEncounter?.location === gameState.location && gameState.transitionEncounter?.nodeId === nodeId) gameState.transitionEncounter = null; renderCurrentPlace(); }, node.duration || 0); }
function selectResonanceItem(itemId) { const owned = gameState.inventory[itemId] || 0; const alreadySelected = selectedOrder.filter((id) => id === itemId).length; if (alreadySelected >= owned) return; selectedOrder.push(itemId); appendLog(`> ${items[itemId]?.name || itemId}을(를) 공허에 넣는다.`, "action"); renderResonancerPanel(); }
function resetResonancer() { if (!selectedOrder.length) { appendLog("공허는 이미 비어 있다.", "muted"); return; } selectedOrder = []; renderResonancerPanel(); appendLog("공허를 비웠다. 재료들이 다시 손안으로 돌아왔다."); }
function tryResonance() { appendLog("> 공명을 시도한다.", "action"); const result = attemptResonance(resonances, selectedOrder); appendLog(result.reason, result.ok ? "success" : "failure"); if (result.ok) { const resultName = items[result.resonance.result]?.name || result.resonance.result; appendLog(`✦ ${resultName} × ${result.resonance.amount || 1}을(를) 얻었다.`, "success"); selectedOrder = []; } renderCurrentPlace(); }
function renderResonancerPanel() { renderResonancer({ items, inventory: gameState.inventory, selectedOrder, discoveredResonances: gameState.discoveredResonances, onSelect: selectResonanceItem, onReset: resetResonancer, onResonate: tryResonance }); }
function renderGatheringAction(actions, nodeId) { const node = gatherings[nodeId]; if (!node) return; const active = isGatheringActive(nodeId); const cooldown = getGatheringCooldownRemaining(nodeId); actions.push({ label: active ? `${node.action} · 찾는 중…` : cooldown > 0 ? `${node.action} · 다시 살필 수 없다` : node.action, disabled: active || cooldown > 0, onClick: () => gather(nodeId) }); }
function renderCurrentPlace() { const place = maps[gameState.location]; renderPlace(place); const actions = []; for (const investigation of place.investigations || []) actions.push({ label: gameState.discovered[investigation.id] ? `${investigation.label} ✓` : investigation.label, onClick: () => investigate(investigation) }); for (const nodeId of place.gatheringNodes || []) renderGatheringAction(actions, nodeId); const transitionNode = gameState.transitionEncounter?.location === gameState.location ? gameState.transitionEncounter.nodeId : null; if (transitionNode) renderGatheringAction(actions, transitionNode); for (const exit of place.exits || []) actions.push({ label: exit.label, disabled: Boolean(gameState.activeGathering), onClick: () => moveTo(exit.to) }); renderActions(actions); renderInventory(gameState.inventory, items); renderResonancerPanel(); }
start();
