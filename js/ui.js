export function setupTabs() {
  const buttons = [...document.querySelectorAll("[data-tab]")];
  const panels = [...document.querySelectorAll(".tab-panel")];

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.tab;

      buttons.forEach((item) => item.classList.toggle("active", item === button));
      panels.forEach((panel) => panel.classList.toggle("active", panel.id === `panel-${target}`));
    });
  });
}

export function renderPlace(place) {
  document.querySelector("#place").innerHTML = `<h2>${place.name}</h2><p>${place.description}</p>`;
}

export function renderActions(actions) {
  const root = document.querySelector("#actions");
  root.innerHTML = "";
  actions.forEach(({ label, onClick, disabled = false }) => {
    const button = document.createElement("button");
    button.textContent = label;
    button.disabled = disabled;
    button.addEventListener("click", onClick);
    root.appendChild(button);
  });
}

export function appendLog(text, kind = "normal") {
  const root = document.querySelector("#log");
  const entry = document.createElement("div");
  entry.className = `log-entry ${kind}`;
  entry.textContent = text;
  root.appendChild(entry);

  requestAnimationFrame(() => {
    root.scrollTop = root.scrollHeight;
  });
}

export function renderInventory(inventory, items) {
  const root = document.querySelector("#inventory");
  const entries = Object.entries(inventory).filter(([, amount]) => amount > 0);

  if (!entries.length) {
    root.innerHTML = `<div class="empty-state">아직 가지고 있는 물건이 없다.</div>`;
    return;
  }

  root.innerHTML = entries.map(([itemId, amount]) => {
    const item = items[itemId];
    return `<div class="held-item"><strong>${item?.name || itemId}</strong> × ${amount}<br><span class="muted small">${item?.description || ""}</span></div>`;
  }).join("");
}

export function renderResonancer({ items, inventory, selectedOrder, discoveredResonances, onSelect, onReset, onResonate }) {
  const root = document.querySelector("#resonancer");

  const materialEntries = Object.entries(inventory).filter(([itemId, amount]) => {
    const item = items[itemId];
    return amount > 0 && item?.type === "material";
  });

  const selectedCounts = {};
  for (const itemId of selectedOrder) {
    selectedCounts[itemId] = (selectedCounts[itemId] || 0) + 1;
  }

  const materialButtons = materialEntries.length
    ? materialEntries.map(([itemId, amount]) => {
        const item = items[itemId];
        const used = selectedCounts[itemId] || 0;
        const available = amount - used;
        const disabled = available <= 0;
        return `<button class="resonance-item" data-item="${itemId}" ${disabled ? "disabled" : ""}>${item?.name || itemId} × ${amount}${used ? ` <span class="muted">(공허 ${used})</span>` : ""}</button>`;
      }).join("")
    : `<div class="empty-state">공명에 사용할 재료가 없다.</div>`;

  const selectedNames = selectedOrder.length
    ? selectedOrder.map((id, index) => `${index + 1}. ${items[id]?.name || id}`).join(" → ")
    : "공허는 비어 있다.";

  const discoveredCount = Object.keys(discoveredResonances || {}).length;

  root.innerHTML = `
    <p class="panel-note">허공의 틈에 재료를 원하는 순서로 넣어 Awen의 관계를 시험한다.</p>
    <div class="void-window">
      <div class="muted resonance-order">${selectedNames}</div>
    </div>

    <p class="section-label">사용할 재료</p>
    <div class="resonance-buttons">${materialButtons}</div>
    <button id="resonance-reset" class="secondary">재료 되돌리기</button>
    <button id="resonance-submit">공명 시도</button>
    <p class="muted resonance-count">발견한 공명: ${discoveredCount}</p>
  `;

  root.querySelectorAll("[data-item]").forEach((button) => {
    button.addEventListener("click", () => onSelect(button.dataset.item));
  });
  root.querySelector("#resonance-reset").addEventListener("click", onReset);
  root.querySelector("#resonance-submit").addEventListener("click", onResonate);
}
