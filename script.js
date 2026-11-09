let cart = [];

// Lista de acréscimos disponíveis para adicionar aos lanches
const availableAddons = [
    { name: 'Salada', price: 2.50 },
    { name: 'Mussarela', price: 3.00 },
    { name: 'Presunto', price: 3.00 },
    { name: 'Ovo', price: 3.00 },
    { name: 'Milho', price: 3.00 },
    { name: 'Batata Palha', price: 3.00 },
    { name: 'Banana', price: 3.50 },
    { name: 'Cheddar', price: 4.00 },
    { name: 'Bife', price: 4.00 },
    { name: 'Bacon', price: 5.00 },
    { name: 'Bife Picanha', price: 5.00 },
    { name: 'Frango', price: 6.00 },
    { name: 'Bife Gourmet', price: 7.00 },
    { name: 'Maionese', price: 2.50 },
    { name: 'Mostarda', price: 2.50 },
    { name: 'Cortado Ao Meio', price: 2.00 }
];

let currentCustomizeItem = null;

// Filtrar categorias
function filterCategory(category, event) {
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const sections = document.querySelectorAll('.category-section');
    sections.forEach(section => {
        if (category === 'all' || section.getAttribute('data-category') === category) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
}

// Adicionar direto (bebidas, entradas e acréscimos avulsos)
function addToCartDirect(name, price) {
    const existingItem = cart.find(i => i.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    updateCartUI();
}

// Abrir modal para customizar lanches com acréscimos específicos
function openCustomizeModal(itemName, basePrice) {
    currentCustomizeItem = { name: itemName, basePrice: basePrice };
    document.getElementById('modal-item-title').innerText = itemName;

    const addonsContainer = document.getElementById('modal-addons-list');
    addonsContainer.innerHTML = '';

    availableAddons.forEach((addon, index) => {
        const div = document.createElement('label');
        div.className = 'addon-label';
        div.innerHTML = `
            <span>${addon.name} (+ R$ ${addon.price.toFixed(2).replace('.', ',')})</span>
            <input type="checkbox" value="${index}" onchange="updateCustomizeTotal()">
        `;
        addonsContainer.appendChild(div);
    });

    updateCustomizeTotal();
    document.getElementById('customize-modal').classList.remove('hidden');
}

function closeCustomizeModal() {
    document.getElementById('customize-modal').classList.add('hidden');
    currentCustomizeItem = null;
}

function updateCustomizeTotal() {
    if (!currentCustomizeItem) return;
    let total = currentCustomizeItem.basePrice;

    const checkboxes = document.querySelectorAll('#modal-addons-list input[type="checkbox"]:checked');
    checkboxes.forEach(cb => {
        const addon = availableAddons[cb.value];
        total += addon.price;
    });

    document.getElementById('modal-item-total').innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function confirmCustomizedItem() {
    if (!currentCustomizeItem) return;

    let finalName = currentCustomizeItem.name;
    let finalPrice = currentCustomizeItem.basePrice;
    let selectedAddons = [];

    const checkboxes = document.querySelectorAll('#modal-addons-list input[type="checkbox"]:checked');
    checkboxes.forEach(cb => {
        const addon = availableAddons[cb.value];
        selectedAddons.push(addon.name);
        finalPrice += addon.price;
    });

    if (selectedAddons.length > 0) {
        finalName += ` (Adicionais: ${selectedAddons.join(', ')})`;
    }

    addToCartDirect(finalName, finalPrice);
    closeCustomizeModal();
}

function changeQuantity(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    updateCartUI();
}

function removeItem(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function updateCartUI() {
    const countElem = document.getElementById('cart-count');
    const cartButtonContainer = document.getElementById('cart-button-container');
    const itemsContainer = document.getElementById('cart-items');
    const totalElem = document.getElementById('cart-total');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    countElem.innerText = totalItems;

    if (totalItems > 0) {
        cartButtonContainer.classList.remove('hidden');
    } else {
        cartButtonContainer.classList.add('hidden');
        toggleCartModal(false);
    }

    itemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
            <div>
                <div style="font-weight: bold;">${item.name}</div>
                <div style="color: var(--gold);">R$ ${item.price.toFixed(2).replace('.', ',')} un</div>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
                <button onclick="changeQuantity(${index}, -1)" class="qty-btn">-</button>
                <span style="font-weight: bold; width: 16px; text-align: center;">${item.quantity}</span>
                <button onclick="changeQuantity(${index}, 1)" class="qty-btn">+</button>
                <button onclick="removeItem(${index})" class="trash-btn">🗑️</button>
            </div>
        `;
        itemsContainer.appendChild(row);
    });

    totalElem.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function toggleCartModal(show) {
    const modal = document.getElementById('cart-modal');
    if (show) {
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }
}

function checkoutWhatsApp() {
    const clientName = document.getElementById('client-name').value.trim();
    const clientAddress = document.getElementById('client-address').value.trim();
    const clientObs = document.getElementById('client-obs').value.trim();

    if (!clientName) {
        alert('Por favor, informe seu nome.');
        document.getElementById('client-name').focus();
        return;
    }

    if (!clientAddress) {
        alert('Por favor, informe o endereço de entrega ou retirada.');
        document.getElementById('client-address').focus();
        return;
    }

    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }

    let message = `🍔 *Vem pro Guin’s!* 🍔\n\n`;
    message += `👤 *Cliente:* ${clientName}\n`;
    message += `📍 *Endereço/Entrega:* ${clientAddress}\n`;
    if (clientObs) {
        message += `📝 *Observações gerais:* ${clientObs}\n`;
    }
    message += `\n----------------------------------\n`;
    message += `*ITENS DO PEDIDO:*\n`;

    let total = 0;
    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        message += `• ${item.quantity}x ${item.name} - R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
    });

    message += `----------------------------------\n`;
    message += `💰 *TOTAL A PAGAR: R$ ${total.toFixed(2).replace('.', ',')}*`;

    const phone = '5527996598704';
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
}