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
