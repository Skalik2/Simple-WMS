window.addEventListener('load', async function () {
    try {
        await Clerk.load({
            signInUrl: '/',
            afterSignInUrl: '/',
        });
        
        console.log("Clerk załadowany, użytkownik:", Clerk.user);
        
        if (Clerk.user) {
            document.getElementById('clerk-container').innerHTML = '';
            Clerk.mountUserButton(document.getElementById('clerk-container'));
            document.getElementById('app-content').classList.remove('hidden');
            
            fetchProducts();
            fetchDocuments();
        } else {
            Clerk.mountSignIn(document.getElementById('clerk-container'));
        }
    } catch (error) {
        console.error("Błąd ładowania Clerka:", error);
    }
});

let currentDocumentItems = [];

function addDocumentItem() {
    const productId = document.getElementById('productId').value;
    const quantity = document.getElementById('quantity').value;

    if (!productId || !quantity || quantity <= 0) {
        alert("Wybierz produkt i wpisz poprawną ilość!");
        return;
    }

    const selectEl = document.getElementById('productId');
    const productName = selectEl.options[selectEl.selectedIndex].text;

    currentDocumentItems.push({
        product_id: parseInt(productId),
        quantity: parseInt(quantity),
        name: productName
    });

    renderDocumentItemsList();
    document.getElementById('quantity').value = '';
}

function removeDocumentItem(index) {
    currentDocumentItems.splice(index, 1);
    renderDocumentItemsList();
}

function renderDocumentItemsList() {
    const listDiv = document.getElementById('document-items-list');
    listDiv.innerHTML = currentDocumentItems.map((item, index) => `
        <div class="flex justify-between bg-gray-50 p-2 border rounded">
            <span>${item.name} | <b>${item.quantity} szt.</b></span>
            <button type="button" onclick="removeDocumentItem(${index})" class="text-red-500 font-bold px-2">X</button>
        </div>
    `).join('');
}


async function fetchDocuments() {
    try {
        const response = await fetch('/api/documents');
        const documents = await response.json();
        const tbody = document.getElementById('documents-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        documents.forEach(doc => {
            const isIncome = ['PZ', 'PW', 'ZW'].includes(doc.type);
            const typeBadge = `<span class="px-2 py-1 rounded text-xs font-bold ${isIncome ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">${doc.type}</span>`;
            const dateObj = new Date(doc.created_at);
            const author = doc.created_by ? doc.created_by.substring(0, 12) + '...' : '-';

            const itemsHtml = doc.items.map(item => 
                `<div class="text-sm"><span class="text-gray-700 font-medium">${item.product.sku}</span> <span class="${isIncome ? 'text-green-600' : 'text-red-600'} font-bold">(${isIncome ? '+' : '-'}${item.quantity} szt.)</span></div>`).join('');
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-4 py-2 text-gray-500">#${doc.id}</td>
                <td class="px-4 py-2">${typeBadge}</td>
                <td class="px-4 py-2 text-gray-500">${dateObj.toLocaleString('pl-PL')}</td>
                <td class="px-4 py-2 text-xs text-gray-400" title="${doc.created_by || ''}">${author}</td>
                <td class="px-4 py-2">${itemsHtml || '-'}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Błąd pobierania dokumentów:", error);
    }
}

async function sendDocument() {
    const docType = document.getElementById('docType').value;

    if (currentDocumentItems.length === 0) {
        alert("Dodaj co najmniej jedną pozycję do dokumentu!");
        return;
    }

    const token = await Clerk.session.getToken();

    const payloadItems = currentDocumentItems.map(i => ({
        product_id: i.product_id,
        quantity: i.quantity
    }));

    const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
            type: docType, 
            items: payloadItems 
        })
    });

    if (response.ok) {
        currentDocumentItems = [];
        renderDocumentItemsList();
        document.getElementById('productId').value = '';
        fetchProducts();
        fetchDocuments();
    } else {
        const errorData = await response.json();
        alert(`Błąd: ${errorData.detail || 'Podczas zapisu dokumentu.'}`);
    }
}


function openProductModal() {
    document.getElementById('product-modal').classList.remove('hidden');
}

function closeProductModal() {
    document.getElementById('product-modal').classList.add('hidden');
}

async function openRecipeModal(productId, productName) {
    document.getElementById('parentProductId').value = productId;
    document.getElementById('recipe-parent-name').innerText = productName;
    
    currentRecipeItems = [];
    renderRecipeItemsList();

    try {
        const response = await fetch(`/api/products/${productId}/recipe`);
        if (response.ok) {
            const existingRecipe = await response.json();
            currentRecipeItems = existingRecipe.map(item => ({
                component_product_id: item.component_product_id,
                quantity: item.quantity,
                name: item.name
            }));
            renderRecipeItemsList();
        }
    } catch (error) {
        console.error("Błąd podczas pobierania receptury:", error);
    }
    
    document.getElementById('recipe-modal').classList.remove('hidden');
}

function closeRecipeModal() {
    document.getElementById('recipe-modal').classList.add('hidden');
}

async function createProduct() {
    const sku = document.getElementById('newSku').value;
    const name = document.getElementById('newName').value;
    const type = document.getElementById('newType').value;
    const unit = document.getElementById('newUnit').value;

    if(!sku || !name) return alert("Podaj SKU i nazwę!");

    const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku: sku, name: name, type: type, unit: unit })
    });

    if(response.ok) {
        alert("Produkt dodany!");
        document.getElementById('newSku').value = '';
        document.getElementById('newName').value = '';
        closeProductModal();
        fetchProducts();
    } else {
        const errorData = await response.json();
        alert(`Błąd: ${errorData.detail}`);
    }
}

async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        allProducts = await response.json();
        
        const tbody = document.getElementById('products-table-body');
        if(tbody) {
            tbody.innerHTML = allProducts.map(p => {
                const isComponent = p.type === 'POLPRODUKT';
                const typeLabel = isComponent ? 'Półprodukt' : 'Produkt';
                const typeBadge = `<span class="px-2 py-1 rounded text-xs font-bold ${isComponent ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}">${typeLabel}</span>`;
                
                const safeName = p.name.replace(/'/g, "\\'");

                return `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-2">${p.id}</td>
                    <td class="px-4 py-2">${p.sku}</td>
                    <td class="px-4 py-2">${p.name}</td>
                    <td class="px-4 py-2">${typeBadge}</td>
                    <td class="px-4 py-2 font-bold">${p.stock_quantity} ${p.unit}</td> <td class="px-4 py-2 text-center">
                    <td class="px-4 py-2 text-center">
                        <button onclick="openRecipeModal(${p.id}, '${safeName}')" class="text-gray-500 hover:text-indigo-600 text-lg transition-transform hover:scale-110" title="Zdefiniuj recepturę / powiąż z półproduktem">
                            ⚙️
                        </button>
                    </td>
                </tr>
                `;
            }).join('');
        }

        const docProductSelect = document.getElementById('productId');
        if(docProductSelect) {
            docProductSelect.innerHTML = '<option value="">-- Wybierz produkt --</option>' + 
                allProducts.map(p => `<option value="${p.id}">[${p.sku}] ${p.name}</option>`).join('');
        }

        const compSelect = document.getElementById('componentProductId');
        if(compSelect) {
            compSelect.innerHTML = '<option value="">-- Wybierz półprodukt --</option>' + 
                allProducts
                    .filter(p => p.type === 'POLPRODUKT')
                    .map(p => `<option value="${p.id}">[${p.sku}] ${p.name}</option>`).join('');
        }
    } catch (e) { console.error(e); }
}

let currentRecipeItems = [];

async function openRecipeModal(productId, productName) {
    document.getElementById('parentProductId').value = productId;
    document.getElementById('recipe-parent-name').innerText = productName;
    
    currentRecipeItems = [];
    renderRecipeItemsList();

    try {
        const response = await fetch(`/api/products/${productId}/recipe`);
        if (response.ok) {
            const existingRecipe = await response.json();
            currentRecipeItems = existingRecipe.map(item => ({
                component_product_id: item.component_product_id,
                quantity: item.quantity,
                name: item.name
            }));
            renderRecipeItemsList();
        }
    } catch (error) {
        console.error("Błąd podczas pobierania receptury:", error);
    }
    
    document.getElementById('recipe-modal').classList.remove('hidden');
}

function addRecipeItemToList() {
    const compId = document.getElementById('componentProductId').value;
    const quantity = document.getElementById('compQuantity').value;

    if (!compId || !quantity || quantity <= 0) {
        alert("Wybierz półprodukt i podaj poprawną ilość!");
        return;
    }

    const selectEl = document.getElementById('componentProductId');
    const compName = selectEl.options[selectEl.selectedIndex].text;

    const parentId = document.getElementById('parentProductId').value;
    if (compId === parentId) {
        alert("Produkt nie może być swoim własnym półproduktem!");
        return;
    }

    currentRecipeItems.push({
        component_product_id: parseInt(compId),
        quantity: parseInt(quantity),
        name: compName
    });

    renderRecipeItemsList();
    document.getElementById('compQuantity').value = '';
}

function removeRecipeItem(index) {
    currentRecipeItems.splice(index, 1);
    renderRecipeItemsList();
}

function renderRecipeItemsList() {
    const listDiv = document.getElementById('recipe-items-list');
    
    if (currentRecipeItems.length === 0) {
        listDiv.innerHTML = '<p class="text-gray-400 text-center italic">Brak przypisanych półproduktów</p>';
        return;
    }

    listDiv.innerHTML = currentRecipeItems.map((item, index) => `
        <div class="flex justify-between bg-gray-50 p-2 border rounded">
            <span class="truncate pr-2">${item.name} | <b>${item.quantity} szt.</b></span>
            <button type="button" onclick="removeRecipeItem(${index})" class="text-red-500 hover:text-red-700 font-bold px-2">X</button>
        </div>
    `).join('');
}

async function saveRecipe() {
    const parentId = document.getElementById('parentProductId').value;

    if (currentRecipeItems.length === 0) {
        return alert("Dodaj co najmniej jeden półprodukt do listy!");
    }

    const payloadItems = currentRecipeItems.map(i => ({
        component_product_id: i.component_product_id,
        quantity: i.quantity
    }));

    const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            parent_product_id: parseInt(parentId), 
            items: payloadItems 
        })
    });

    if (response.ok) {
        alert("Receptura została poprawnie zapisana!");
        closeRecipeModal();
    } else {
        const errorData = await response.json();
        alert(`Błąd: ${errorData.detail || 'Podczas zapisu receptury.'}`);
    }
}