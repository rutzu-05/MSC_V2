let catVisible = true;

function toggleCatalog() {
    catVisible = !catVisible;
    const content = document.getElementById('catalogContent');
    if (content) content.classList.toggle('hidden');
    const text = document.getElementById('toggleText');
    if (text) text.innerText = catVisible ? 'Ocultar Productos' : 'Mostrar Productos';
    const icon = document.getElementById('toggleIcon');
    if (icon) icon.innerText = catVisible ? '▲' : '▼';
}

function filterProductsManual() {
    const tInput = document.getElementById('manualSearch');
    if (!tInput) return;
    const t = tInput.value.toLowerCase();
    const filtered = database.productos.filter(p =>
        p.nombre.toLowerCase().includes(t) ||
        p.ing.some(i => i.toLowerCase().includes(t)) ||
        p.tags.some(s => s.toLowerCase().includes(t))
    );
    renderProducts(filtered);
    const noResults = document.getElementById('noResults');
    if (noResults) noResults.className = (filtered.length === 0) ? 'py-20 text-center text-slate-300 italic block' : 'hidden';
}

async function consultarIA() {
    const inpEl = document.getElementById('aiSymptomInput');
    if (!inpEl) return;
    const inp = inpEl.value;
    const res = document.getElementById('aiResponse');
    const btn = document.getElementById('aiBtn');
    const content = document.getElementById('aiContent');

    if (!inp || !res || !btn || !content) return;

    btn.disabled = true;
    btn.innerHTML = `<span class="loader"></span> ANALIZANDO CASO...`;
    res.classList.add('hidden');

    try {
        // Llamada a Groq a través del proxy backend definido en api.js
        const text = await callGroq(inp, systemInstruction);
        content.innerHTML = text.replace(/#### (.*?):/g, '<h4>$1</h4>').replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        res.classList.remove('hidden');
    } catch (e) {
        content.innerHTML = `<strong class="text-red-600">Error detectado:</strong><br>${e.message}`;
        res.classList.remove('hidden');
    } finally {
        btn.disabled = false;
        btn.innerHTML = "<span>Generar Reporte Clínico ✨</span>";
    }
}

function renderProducts(list = database.productos) {
    const g = document.getElementById('productGrid');
    if (!g) return;

    const count = document.getElementById('productCount');
    if (count) count.innerText = list.length;

    g.innerHTML = list.map(p => `
        <div class="product-card bg-white p-4 rounded-xl flex flex-col justify-between h-full relative overflow-hidden group">
            <div class="absolute top-0 right-0 bg-slate-50 text-slate-400 text-[8px] font-bold px-2 py-1 rounded-bl-lg">${p.pres}</div>
            <div>
                <div class="text-[10px] font-bold text-msc-primary mb-1 uppercase tracking-tighter">S/ ${p.precio.toFixed(2)}</div>
                <h4 class="font-bold text-[11px] text-slate-700 uppercase leading-tight group-hover:text-msc-primary transition">${p.nombre}</h4>
                <div class="flex flex-wrap gap-1 mt-2">${p.tags.slice(0, 3).map(t => `<span class="text-[7px] bg-slate-100 px-1 rounded-sm text-slate-500 uppercase">${t}</span>`).join('')}</div>
            </div>
            <button onclick="openModal('${p.id}')" class="w-full mt-4 text-[9px] font-bold text-slate-500 bg-slate-50 border py-1.5 rounded hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition">VER FICHA</button>
        </div>
    `).join('');
}

function openModal(id) {
    const p = database.productos.find(x => x.id === id);
    if (!p) return;
    const title = document.getElementById('modalTitle');
    const meta = document.getElementById('modalMeta');
    const desc = document.getElementById('modalDesc');
    const ing = document.getElementById('modalIngredients');
    const symptoms = document.getElementById('modalSymptoms');
    const modal = document.getElementById('productModal');

    if (title) title.innerText = p.nombre;
    if (meta) meta.innerHTML = `<span class="text-xs font-bold text-msc-primary">S/ ${p.precio.toFixed(2)}</span><span class="text-[10px] text-slate-300 font-bold uppercase tracking-widest">${p.pres}</span>`;
    if (desc) desc.innerText = p.desc;
    if (ing) ing.innerHTML = p.ing.map(i => `<span class="bg-emerald-50 text-emerald-700 text-[9px] px-2 py-0.5 rounded border border-emerald-100 font-bold uppercase">${i}</span>`).join('');
    if (symptoms) symptoms.innerHTML = p.tags.map(s => `<span class="bg-amber-50 text-amber-700 text-[9px] px-2 py-0.5 rounded border border-amber-100 font-bold uppercase">${s}</span>`).join('');

    if (modal) modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('productModal');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function copyResponse() {
    const content = document.getElementById('aiContent');
    if (!content) return;

    const textToCopy = content.innerText;
    const btn = document.getElementById('copyBtn');

    // Método moderno si hay HTTPS
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy).then(() => showCopiedFeedback(btn));
    } else {
        // FALLBACK DE INGENIERO: Para archivos locales file:// o HTTP
        let textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showCopiedFeedback(btn);
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }
        document.body.removeChild(textArea);
    }
}

function showCopiedFeedback(btn) {
    if (!btn) return;
    btn.innerText = "¡COPIADO!";
    btn.classList.add('bg-emerald-200', 'text-emerald-800');
    setTimeout(() => {
        btn.innerText = "COPIAR";
        btn.classList.remove('bg-emerald-200', 'text-emerald-800');
    }, 2000);
}

window.onload = () => {
    renderProducts();
    const pList = document.getElementById('packsList');
    if (pList) pList.innerHTML = database.packs.map(p => `<div class="p-3 border rounded-xl bg-white shadow-sm flex justify-between items-center"><div class="max-w-[70%]"><h5 class="font-bold text-xs uppercase text-slate-700">${p.n}</h5><p class="text-[8px] text-slate-400 mt-0.5">${p.d}</p></div><div class="text-right"><div class="text-[10px] font-bold text-emerald-600">S/ ${p.o}</div><div class="text-[8px] text-slate-300 line-through">S/ ${p.r}</div></div></div>`).join('');

    const canvas = document.getElementById('packsChart');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        new Chart(ctx, { type: 'bar', data: { labels: database.packs.map(x => x.n.replace('Pack ', '')), datasets: [{ label: 'Oferta', data: database.packs.map(x => x.o), backgroundColor: '#059669', borderRadius: 4 }, { label: 'Reg', data: database.packs.map(x => x.r), backgroundColor: '#e2e8f0', borderRadius: 4 }] }, options: { maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { ticks: { font: { size: 9 } } } } } });
    }
};
