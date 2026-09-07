export function renderPlace(place) {
  document.querySelector("#place").innerHTML = `<h2>${place.name}</h2><p>${place.description}</p>`;
}

export function renderActions(actions) {
  const root = document.querySelector("#actions");
  root.innerHTML = "";
  actions.forEach(({ label, onClick }) => {
    const button = document.createElement("button");
    button.textContent = label;
    button.addEventListener("click", onClick);
    root.appendChild(button);
  });
}

export function showMessage(text) {
  document.querySelector("#message").textContent = text;
}

export function renderInventory(inventory, items) {
  const root = document.querySelector("#inventory");
  const entries = Object.entries(inventory);
  if (!entries.length) {
    root.className = "muted";
    root.textContent = "비어 있음";
    return;
  }
  root.className = "";
  root.innerHTML = entries.map(([id, amount]) => {
    const item = items[id];
    return `<div class="item"><strong>${item?.name || id}</strong> × ${amount}<br><span class="muted">${item?.description || ""}</span></div>`;
  }).join("");
}

export function renderResonancer({ items, inventory, selectedOrder, discoveredResonances, onSelect, onReset, onResonate }) {
  const root = document.querySelector("#crafting");

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
        const disabled = used >= amount;
        return `<button class="craft-item" data-item="${itemId}" ${disabled ? "disabled" : ""}>${item?.name || itemId} × ${amount}</button>`;
      }).join("")
    : `<span class="muted">공명에 사용할 재료가 없다.</span>`;

  const selectedNames = selectedOrder.length
    ? selectedOrder.map((id, index) => `${index + 1}. ${items[id]?.name || id}`).join(" → ")
    : "공허는 비어 있다.";

  const discoveredCount = Object.keys(discoveredResonances || {}).length;

  root.innerHTML = `
    <p><strong>Resonancer</strong></p>
    <p class="muted">허공의 틈에 재료를 원하는 순서로 넣어 Awen의 관계를 시험한다.</p>
    <div class="void-window">
      <div class="muted craft-order">${selectedNames}</div>
    </div>
    <div class="craft-buttons">${materialButtons}</div>
    <button id="craft-reset" class="secondary">공허 비우기</button>
    <button id="craft-submit">공명 시도</button>
    <p class="muted resonance-count">발견한 공명: ${discoveredCount}</p>
  `;

  root.querySelectorAll("[data-item]").forEach((button) => {
    button.addEventListener("click", () => onSelect(button.dataset.item));
  });
  root.querySelector("#craft-reset").addEventListener("click", onReset);
  root.querySelector("#craft-submit").addEventListener("click", onResonate);
}
