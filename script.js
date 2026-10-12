const PRODUCTS = [
  { id: "classico", name: "Clássico da Casa", category: "hamburgueres", categoryLabel: "Hambúrgueres", description: "Blend bovino, queijo prato, alface, tomate e molho da casa.", price: 28.9, art: "🍔", tone: "#e9dfc7", tag: "queridinho" },
  { id: "brasa", name: "Brasa Duplo", category: "hamburgueres", categoryLabel: "Hambúrgueres", description: "Dois blends na brasa, cheddar cremoso e cebola caramelizada.", price: 36.9, art: "🍔", tone: "#e7d7c8", tag: "mais pedido" },
  { id: "veg", name: "Verde & Sabor", category: "hamburgueres", categoryLabel: "Hambúrgueres", description: "Burger de grão-de-bico, queijo coalho, rúcula e aioli.", price: 29.9, art: "🥬", tone: "#dfe5d4", tag: "sem carne" },
  { id: "fritas", name: "Fritas da Casa", category: "acompanhamentos", categoryLabel: "Acompanhamentos", description: "Batatas crocantes com páprica e maionese temperada.", price: 16.9, art: "🍟", artClass: "fries", tone: "#f0dfbd", tag: "crocantes" },
  { id: "aneis", name: "Anéis Crocantes", category: "acompanhamentos", categoryLabel: "Acompanhamentos", description: "Anéis de cebola empanados, douradinhos e sequinhos.", price: 18.9, art: "🧅", tone: "#eadbc7", tag: "pra dividir" },
  { id: "limonada", name: "Limonada Fresca", category: "bebidas", categoryLabel: "Bebidas", description: "Limão espremido na hora, gelo e um toque de hortelã.", price: 9.9, art: "🍋", artClass: "drink", tone: "#e7e9ce", tag: "natural" }
];

const cart = new Map();
const money = value => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const grid = document.querySelector("#product-grid");
const cartPanel = document.querySelector("#sacola");
const scrim = document.querySelector("#scrim");
let toastTimer;

function renderProducts(filter = "todos") {
  const products = filter === "todos" ? PRODUCTS : PRODUCTS.filter(product => product.category === filter);
  grid.innerHTML = products.map(product => `
    <article class="product-card">
      <div class="product-visual" style="--tone:${product.tone}">
        <span class="product-tag">${product.tag}</span>
        <span class="food-art ${product.artClass || ""}" aria-hidden="true">${product.art}</span>
      </div>
      <div class="product-info">
        <p class="product-category">${product.categoryLabel}</p>
        <h3>${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-footer"><span class="product-price">${money(product.price)}</span><button class="add-button" type="button" data-add="${product.id}" aria-label="Adicionar ${product.name} à sacola">+</button></div>
      </div>
    </article>`).join("");
}

function updateCart() {
  const entries = [...cart.entries()];
  const quantity = entries.reduce((sum, [, count]) => sum + count, 0);
  const total = entries.reduce((sum, [id, count]) => sum + PRODUCTS.find(product => product.id === id).price * count, 0);
  document.querySelector("#header-count").textContent = quantity;
  document.querySelector("#floating-count").textContent = quantity;
  document.querySelector("#cart-count").textContent = `(${quantity})`;
  document.querySelector("#cart-total").textContent = money(total);
  document.querySelector("#checkout").disabled = quantity === 0;

  const container = document.querySelector("#cart-items");
  if (!quantity) {
    container.innerHTML = '<div class="cart-empty"><span aria-hidden="true">▱</span><p>Sua sacola está esperando<br>por algo gostoso.</p><a href="#cardapio" id="browse-menu">Explorar cardápio ↗</a></div>';
    return;
  }
  container.innerHTML = entries.map(([id, count]) => {
    const product = PRODUCTS.find(item => item.id === id);
    return `<article class="cart-item"><div><h3>${product.name}</h3><span class="cart-item-price">${money(product.price * count)}</span></div><div class="cart-item-controls"><button class="qty-button" type="button" data-change="${id}" data-delta="-1" aria-label="Remover um ${product.name}">−</button><span class="qty">${count}</span><button class="qty-button" type="button" data-change="${id}" data-delta="1" aria-label="Adicionar um ${product.name}">+</button></div></article>`;
  }).join("");
}

function showCart(open = true) {
  cartPanel.classList.toggle("open", open);
  scrim.classList.toggle("visible", open);
  document.body.classList.toggle("cart-open", open);
  if (open) document.querySelector("#cart-title").focus?.();
}

function toast(message) {
  const element = document.querySelector("#toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove("show"), 1900);
}

document.addEventListener("click", event => {
  const addButton = event.target.closest("[data-add]");
  if (addButton) {
    const id = addButton.dataset.add;
    cart.set(id, (cart.get(id) || 0) + 1);
    updateCart();
    toast(`${PRODUCTS.find(product => product.id === id).name} adicionado à sacola`);
    return;
  }
  const changeButton = event.target.closest("[data-change]");
  if (changeButton) {
    const id = changeButton.dataset.change;
    const nextCount = (cart.get(id) || 0) + Number(changeButton.dataset.delta);
    if (nextCount > 0) cart.set(id, nextCount); else cart.delete(id);
    updateCart();
    return;
  }
  const categoryButton = event.target.closest("[data-filter]");
  if (categoryButton) {
    document.querySelectorAll(".category").forEach(button => button.classList.toggle("active", button === categoryButton));
    renderProducts(categoryButton.dataset.filter);
  }
});

document.querySelector("#floating-cart").addEventListener("click", () => showCart());
document.querySelector(".bag-shortcut").addEventListener("click", event => { event.preventDefault(); showCart(); });
document.querySelector("#close-cart").addEventListener("click", () => showCart(false));
scrim.addEventListener("click", () => showCart(false));
document.addEventListener("keydown", event => { if (event.key === "Escape") showCart(false); });
document.querySelector("#checkout").addEventListener("click", () => {
  if (!cart.size) return;
  const order = [...cart.entries()].map(([id, count]) => `${count}x ${PRODUCTS.find(product => product.id === id).name}`).join("\n");
  const total = [...cart.entries()].reduce((sum, [id, count]) => sum + PRODUCTS.find(product => product.id === id).price * count, 0);
  const message = `Olá gostaria de fazer um pedido\n\n${order}\n\nTotal: ${money(total)}`;
  window.open(`https://wa.me/5592995268193?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
});

document.querySelector("#year").textContent = new Date().getFullYear();
renderProducts();
updateCart();
