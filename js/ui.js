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

export function appendLog(text, kind = "normal") {
  const root = document.querySelector("#log");
  const entry = document.createElement("div");
  entry.className = `log-entry ${kind}`;
  entry.textContent = text;
  root.appendChild(entry);
  entry.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

export function renderResonancer({ items, inventory, selectedOrder, discoveredResonances, onSelect, onReset, onResonate }) {
  const root = document.querySelector("#resonancer");

  const materialEntries = Object.entries(inventory).filter(([itemId, amount]) => {
    const item = items[itemId];
    return amount > 0 && item?.type === "material";
  });

  const otherEntries = Object.entries(inventory).filter(([itemId, amount]) => {
    const item = items[itemId];
    return amount > 0 && item?.type !== "material";
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
    : `<span class="muted">공명에 사용할 재료가 없다.</span>`;

  const otherItems = otherEntries.length
    ? `<div class="held-items">${otherEntries.map(([itemId, amount]) => {
        const item = items[itemId];
        return `<div class="held-item"><strong>${item?.name || itemId}</strong> × ${amount}<br><span class="muted">${item?.description || ""}</span></div>`;
      }).join("")}</div>`
    : `<p class="muted small">그 밖의 소지품은 없다.</p>`;

  const selectedNames = selectedOrder.length
    ? selectedOrder.map((id, index) => `${index + 1}. ${items[id]?.name || id}`).join(" → ")
    : "공허는 비어 있다.";

  const discoveredCount = Object.keys(discoveredResonances || {}).length;

  root.innerHTML = `
    <p class="muted">허공의 틈에 재료를 원하는 순서로 넣어 Awen의 관계를 시험한다.</p>
    <div class="void-window">
      <div class="muted resonance-order">${selectedNames}</div>
    </div>

    <p class="section-label">보유 재료</p>
    <div class="resonance-buttons">${materialButtons}</div>
    <button id="resonance-reset" class="secondary">재료 되돌리기</button>
    <button id="resonance-submit">공명 시도</button>
    <p class="muted resonance-count">발견한 공명: ${discoveredCount}</p>

    <details class="other-inventory">
      <summary>기타 소지품</summary>
      ${otherItems}
    </details>
  `;

  root.querySelectorAll("[data-item]").forEach((button) => {
    button.addEventListener("click", () => onSelect(button.dataset.item));
  });
  root.querySelector("#resonance-reset").addEventListener("click", onReset);
  root.querySelector("#resonance-submit").addEventListener("click", onResonate);
}
