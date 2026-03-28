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

async function fetchDocuments() {
    try {
        const response = await fetch('/api/documents');
        const documents = await response.json();
        const tbody = document.getElementById('documents-table-body');
        tbody.innerHTML = '';
        
        documents.forEach(doc => {
            const item = doc.items.length > 0 ? doc.items[0] : {product_id: '-', quantity: '-'};
            const isIncome = ['PZ', 'PW', 'ZW'].includes(doc.type);
            const typeBadge = `<span class="px-2 py-1 rounded text-xs font-bold ${isIncome ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">${doc.type}</span>`;
            const dateObj = new Date(doc.created_at);
            
            const tr = document.createElement('tr');
            const author = doc.created_by ? doc.created_by.substring(0, 12) + '...' : '-';

            tr.innerHTML = `
                <td class="px-4 py-2 text-gray-500">#${doc.id}</td>
                <td class="px-4 py-2">${typeBadge}</td>
                <td class="px-4 py-2 text-gray-500">${dateObj.toLocaleString('pl-PL')}</td>
                <td class="px-4 py-2 text-xs text-gray-400" title="${doc.created_by || ''}">${author}</td> <td class="px-4 py-2 font-medium">${item.product_id}</td>
                <td class="px-4 py-2 font-medium ${isIncome ? 'text-green-600' : 'text-red-600'}">
                    ${isIncome ? '+' : '-'}${item.quantity}
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Błąd pobierania dokumentów:", error);
    }
}

async function sendDocument() {
    const docType = document.getElementById('docType').value;
    const productId = document.getElementById('productId').value;
    const quantity = document.getElementById('quantity').value;

    if(!productId || !quantity) {
        alert("Wypełnij wszystkie pola!");
        return;
    }

    const token = await Clerk.session.getToken();

    const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
            type: docType, 
            product_id: parseInt(productId), 
            quantity: parseInt(quantity) 
        })
    });

    if (response.ok) {
        document.getElementById('productId').value = '';
        document.getElementById('quantity').value = '';
        fetchProducts();
        fetchDocuments();
    } else {
        const errorData = await response.json();
        alert(`Błąd: ${errorData.detail || 'Podczas zapisu dokumentu.'}`);
    }
}



function switchTab(tabName) {
    document.getElementById('content-magazyn').classList.add('hidden');
    document.getElementById('content-konfiguracja').classList.add('hidden');
    
    document.getElementById('tab-magazyn').className = 'px-6 py-2 font-medium text-gray-500';
    document.getElementById('tab-konfiguracja').className = 'px-6 py-2 font-medium text-gray-500';

    document.getElementById('content-' + tabName).classList.remove('hidden');
    document.getElementById('tab-' + tabName).className = 'px-6 py-2 font-medium border-b-2 border-blue-600 text-blue-600';
}

async function createProduct() {
    const sku = document.getElementById('newSku').value;
    const name = document.getElementById('newName').value;

    if(!sku || !name) return alert("Podaj SKU i nazwę!");

    const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, name, stock_quantity: 0 })
    });

    if(response.ok) {
        alert("Produkt dodany!");
        document.getElementById('newSku').value = '';
        document.getElementById('newName').value = '';
        fetchProducts();
    }
}

async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        
        const tbody = document.getElementById('products-table-body');
        if(tbody) tbody.innerHTML = products.map(p => `
            <tr>
                <td class="px-4 py-2">${p.id}</td>
                <td class="px-4 py-2">${p.sku}</td>
                <td class="px-4 py-2">${p.name}</td>
                <td class="px-4 py-2 font-bold">${p.stock_quantity} szt.</td>
            </tr>
        `).join('');

        const selects = ['productId', 'parentProductId', 'componentProductId'];
        selects.forEach(id => {
            const el = document.getElementById(id);
            if(el) {
                const current = el.value;
                el.innerHTML = '<option value="">-- Wybierz produkt --</option>' + 
                    products.map(p => `<option value="${p.id}">[${p.sku}] ${p.name}</option>`).join('');
                el.value = current;
            }
        });
    } catch (e) { console.error(e); }
}