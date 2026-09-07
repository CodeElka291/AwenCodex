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

export function renderCrafting({ recipe, items, inventory, selectedOrder, onSelect, onReset, onCraft }) {
  const root = document.querySelector("#crafting");
  if (!recipe) {
    root.innerHTML = `<span class="muted">아직 사용할 수 있는 조합법이 없다.</span>`;
    return;
  }

  const ingredientButtons = recipe.ingredients.map((itemId) => {
    const item = items[itemId];
    const amount = inventory[itemId] || 0;
    const disabled = amount <= 0 || selectedOrder.length >= recipe.ingredients.length;
    return `<button class="craft-item" data-item="${itemId}" ${disabled ? "disabled" : ""}>${item?.name || itemId} × ${amount}</button>`;
  }).join("");

  const selectedNames = selectedOrder.length
    ? selectedOrder.map((id, index) => `${index + 1}. ${items[id]?.name || id}`).join(" → ")
    : "아직 넣은 재료 없음";

  root.innerHTML = `
    <p><strong>${recipe.name}</strong></p>
    <div class="muted craft-order">${selectedNames}</div>
    <div class="craft-buttons">${ingredientButtons}</div>
    <button id="craft-reset" class="secondary">순서 다시 고르기</button>
    <button id="craft-submit">이 순서로 조합한다</button>
  `;

  root.querySelectorAll("[data-item]").forEach((button) => {
    button.addEventListener("click", () => onSelect(button.dataset.item));
  });
  root.querySelector("#craft-reset").addEventListener("click", onReset);
  root.querySelector("#craft-submit").addEventListener("click", onCraft);
}
