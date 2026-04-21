// app.js

let currentUser = null;
let userPreferences = {};
let currentAuthTab = 'login';
let currentQuestionIndex = 1;
const totalQuestions = 10;
// Streak replaced with Aura Flow dynamic calculation
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// LocalStorage Initialization for Wardrobe
const defaultWardrobe = [
    { id: 1, category: "Tops", color: "White Basic Tshirt", img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80", lastWorn: "recently" },
    { id: 2, category: "Bottoms", color: "Blue Denim Jeans", img: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=400&q=80", lastWorn: "recently" },
    { id: 3, category: "Tops", color: "white crop top", img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=400&q=80", lastWorn: "recently" },
    { id: 4, category: "Ethnic", color: "Yellow Kurti", img: "", lastWorn: "never worn" }
];

let wardrobeItems = JSON.parse(localStorage.getItem('trendaura_wardrobe')) || defaultWardrobe;

function saveWardrobe() {
    localStorage.setItem('trendaura_wardrobe', JSON.stringify(wardrobeItems));
}

let loggedOutfits = JSON.parse(localStorage.getItem('trendaura_calendar')) || [
    { date: "2026-04-12", items: [1, 2], img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80" },
    { date: "2026-04-13", items: [3], img: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=200&q=80" }
];

function saveCalendar() {
    localStorage.setItem('trendaura_calendar', JSON.stringify(loggedOutfits));
}

function updateAuraFlow() {
    const uniqueDays = new Set(loggedOutfits.map(o => o.date)).size;
    const sidebarStreak = document.getElementById('sidebar-streak');
    if (sidebarStreak) sidebarStreak.textContent = uniqueDays + " days styled";

    const overlayCount = document.getElementById('streak-count-overlay');
    if (overlayCount) overlayCount.textContent = uniqueDays;
}

function triggerAuraFlowOverlay() {
    updateAuraFlow();
    const overlay = document.getElementById('streak-overlay');
    overlay.classList.remove('hidden');
    setTimeout(() => overlay.classList.add('hidden'), 2500);
}

let aiContext = { memory: [], lastOccasion: null, ratingHistory: [] };

// BG Images
const bgImages = [
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80", // Start (Shopping)
    "https://images.unsplash.com/photo-1622519407650-3df9883f76a5?auto=format&fit=crop&w=1200&q=80", // Q1-5 (Casual)
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80"  // Q6-10 (Formal)
];

function updateBackground(index) {
    const bg = document.getElementById('dynamic-bg');
    bg.style.opacity = 0;
    setTimeout(() => {
        bg.src = bgImages[index];
        bg.style.opacity = 1;
    }, 400);
}

// ==== Auth ====
function switchAuthTab(tab) {
    currentAuthTab = tab;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    if (tab === 'register') {
        document.getElementById('name-group').classList.remove('hidden');
        document.getElementById('auth-submit-btn').textContent = 'Register';
    } else {
        document.getElementById('name-group').classList.add('hidden');
        document.getElementById('auth-submit-btn').textContent = 'Login';
    }
}

function simulateReturningUser() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('returning-user-section').classList.remove('hidden');
    currentUser = { name: "AuraUser", email: "user@trendaura.com" };
}

function handleAuth(e) {
    e.preventDefault();
    const isReturning = currentAuthTab === 'login';
    let name = document.getElementById('auth-name').value || "Stylist";
    currentUser = { name, email: document.getElementById('auth-email').value };

    document.getElementById('auth-section').classList.add('hidden');

    if (isReturning) {
        document.getElementById('returning-user-section').classList.remove('hidden');
    } else {
        startPreferenceUpdate();
    }
}

function startPreferenceUpdate() {
    document.getElementById('returning-user-section').classList.add('hidden');
    document.getElementById('personalization-section').classList.remove('hidden');
    document.getElementById('welcome-name').textContent = currentUser.name;
    updateBackground(1);
}

function skipToDashboard() {
    transitionToDashboard();
}

// ==== Personalization ====
function updateQuestionNav() {
    document.getElementById('prev-btn').classList.toggle('hidden', currentQuestionIndex === 1);
    if (currentQuestionIndex === totalQuestions) {
        document.getElementById('next-btn').classList.add('hidden');
        document.getElementById('submit-prefs-btn').classList.remove('hidden');
    } else {
        document.getElementById('next-btn').classList.remove('hidden');
        document.getElementById('submit-prefs-btn').classList.add('hidden');
    }

    if (currentQuestionIndex <= 5) updateBackground(1);
    else updateBackground(2);
}

function nextQuestion() {
    if (currentQuestionIndex < totalQuestions) {
        document.getElementById(`qb-${currentQuestionIndex}`).classList.remove('active');
        currentQuestionIndex++;
        const next = document.getElementById(`qb-${currentQuestionIndex}`);
        if (next) next.classList.add('active');
        updateQuestionNav();
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 1) {
        document.getElementById(`qb-${currentQuestionIndex}`).classList.remove('active');
        currentQuestionIndex--;
        document.getElementById(`qb-${currentQuestionIndex}`).classList.add('active');
        updateQuestionNav();
    }
}

function handlePersonalization(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    userPreferences = Object.fromEntries(formData.entries());
    transitionToDashboard();
}

// ==== Transition ====
function transitionToDashboard() {
    document.getElementById('personalization-section').classList.add('hidden');
    document.getElementById('returning-user-section').classList.add('hidden');
    document.getElementById('auth-section').classList.add('hidden');

    const layout = document.getElementById('app-container');
    layout.classList.add('dashboard-view');

    setTimeout(() => {
        document.getElementById('dashboard-section').classList.remove('hidden');
        initDashboard();
    }, 800);
}

// ==== Dashboard Init ====
function initDashboard() {
    updateAuraFlow();
    renderWardrobe('All');
    renderCalendar();

    const underusedCount = wardrobeItems.filter(i => i.lastWorn.match(/month|never/i)).length;
    if (underusedCount > 0) {
        document.getElementById('underused-alert').classList.remove('hidden');
    } else {
        document.getElementById('underused-alert').classList.add('hidden');
    }

    generateForecast();
}

function switchTab(tabId) {
    document.querySelectorAll('.view-tab').forEach(tab => tab.classList.add('hidden'));
    document.getElementById(`${tabId}-tab`).classList.remove('hidden');
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

// ==== Wardrobe & Uploading ====
function openUploadModal() {
    document.getElementById('upload-modal').classList.remove('hidden');
}

function closeUploadModal() {
    document.getElementById('upload-modal').classList.add('hidden');
}

function simulateUpload() {
    const nameStr = document.getElementById('upload-name').value.trim();
    const cat = document.getElementById('upload-category').value;
    const occasion = document.getElementById('upload-occasion').value;
    const color = document.getElementById('upload-color').value.trim();
    const fileInput = document.getElementById('upload-file');
    const file = fileInput.files[0];

    if (!nameStr || !color) {
        alert("Please provide an Item Name and Description/Color.");
        console.error("Upload failed: Missing required fields (Name or Color).");
        return;
    }

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const imgObj = new Image();
            imgObj.onload = function () {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 500;
                let scale = 1;
                if (imgObj.width > MAX_WIDTH) {
                    scale = MAX_WIDTH / imgObj.width;
                }
                canvas.width = imgObj.width * scale;
                canvas.height = imgObj.height * scale;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(imgObj, 0, 0, canvas.width, canvas.height);

                const resizedBase64 = canvas.toDataURL('image/jpeg', 0.8);

                wardrobeItems.push({
                    id: Date.now(),
                    name: nameStr,
                    category: cat,
                    occasion: occasion,
                    color: color,
                    img: resizedBase64,
                    lastWorn: "never worn"
                });

                try {
                    saveWardrobe();
                } catch (err) {
                    alert("Storage full! Cannot save new item. Try clearing data.");
                    console.error("Storage limit exceeded", err);
                    wardrobeItems.pop();
                    return;
                }

                closeUploadModal();
                document.getElementById('upload-name').value = '';
                document.getElementById('upload-color').value = '';
                fileInput.value = '';
                filterWardrobe('All');
                console.log("Successfully added new item to Wardrobe.");
            };
            imgObj.onerror = function () {
                alert("Invalid image file.");
                console.error("Upload failed: Could not load image.");
            };
            imgObj.src = e.target.result;
        };
        reader.onerror = function () {
            console.error("FileReader Error during file reading.");
        }
        reader.readAsDataURL(file);
    } else {
        // Fallback if no file
        const img = "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?auto=format&fit=crop&w=400&q=80";
        wardrobeItems.push({
            id: Date.now(),
            name: nameStr,
            category: cat,
            occasion: occasion,
            color: color,
            img: img,
            lastWorn: "never worn"
        });
        saveWardrobe();
        closeUploadModal();
        document.getElementById('upload-name').value = '';
        document.getElementById('upload-color').value = '';
        if (fileInput) fileInput.value = '';
        filterWardrobe('All');
        console.log("Successfully added new item to Wardrobe (No Image).");
    }
}

function renderWardrobe(category) {
    const grid = document.getElementById('wardrobe-grid');
    grid.innerHTML = '';
    const filtered = category === 'All' ? wardrobeItems : wardrobeItems.filter(i => i.category === category);

    filtered.forEach(item => {
        const isUnderused = item.lastWorn.match(/month|never/i);
        const visual = item.img ? `<img src="${item.img}" class="wardrobe-card-img item-img" alt="${item.color}">` :
            `<div class="wardrobe-card-img item-img ghost-outline"><i class="fa-solid fa-shirt"></i></div>`;

        let itemNameHtml = '';
        if (item.name) {
            itemNameHtml = `<div class="item-name">${item.name}</div>`;
        }

        let occasionHtml = '';
        if (item.occasion) {
            occasionHtml = `<div class="item-color"><i>Occasion: ${item.occasion}</i></div>`;
        }

        grid.innerHTML += `
            <div class="clothing-item outfit-card" onclick="openWearModal(${item.id}, this)" data-id="${item.id}">
                ${isUnderused ? '<div class="underused-badge"><i class="fa-solid fa-triangle-exclamation"></i> Underused</div>' : ''}
                ${visual}
                <div class="item-info wardrobe-card-info">
                    <div class="item-cat wardrobe-card-cat">${item.category}</div>
                    ${itemNameHtml}
                    <div class="item-color wardrobe-card-color">${item.color}</div>
                    ${occasionHtml}
                    <i class="fa-solid fa-trash delete-icon" onclick="deleteItem(${item.id}); event.stopPropagation();"></i>
                </div>
                <div class="checkmark"><i class="fa-solid fa-check"></i></div>
            </div>
        `;
    });
}

// --- Wear Modal Logic ---
let wearModalOutfitId = null;
let wearModalOutfitEl = null;
function openWearModal(id, el) {
    wearModalOutfitId = id;
    wearModalOutfitEl = el;
    // Remove previous selection
    document.querySelectorAll('.outfit-card.selected').forEach(e => e.classList.remove('selected'));
    if (el) el.classList.add('selected');
    const item = wardrobeItems.find(i => i.id === id);
    const modal = document.getElementById('wear-modal');
    const modalOutfit = document.getElementById('wear-modal-outfit');
    modalOutfit.innerHTML = `
        <img src="${item.img}" alt="Outfit" />
        <div class="wear-modal-name">${item.name || item.color}</div>
        <div class="wear-modal-cat">${item.category}</div>
    `;
    modal.classList.remove('hidden');
    setTimeout(() => { modal.querySelector('.wear-modal-content').style.transform = 'scale(1)'; }, 10);
    // Attach Yes button handler
    document.getElementById('wear-yes-btn').onclick = confirmWearModal;
}
function closeWearModal() {
    const modal = document.getElementById('wear-modal');
    modal.classList.add('hidden');
    if (wearModalOutfitEl) wearModalOutfitEl.classList.remove('selected');
    wearModalOutfitId = null;
    wearModalOutfitEl = null;
}
function confirmWearModal() {
    if (!wearModalOutfitId) return;
    const today = new Date().toISOString().split('T')[0];
    // Prevent duplicate log for today
    if (!loggedOutfits.find(l => l.date === today)) {
        const item = wardrobeItems.find(i => i.id === wearModalOutfitId);
        loggedOutfits.push({ date: today, items: [item.id], img: item.img });
        // Update lastWorn
        item.lastWorn = 'today';
        saveWardrobe();
        saveCalendar();
        triggerAuraFlowOverlay();
        renderCalendar();
    } else {
        alert("Outfit already logged for today!");
    }
    closeWearModal();
}
// Close modal on outside click
window.addEventListener('click', function (e) {
    const modal = document.getElementById('wear-modal');
    if (!modal.classList.contains('hidden') && e.target === modal) closeWearModal();
});
function filterWardrobe(category) {
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.classList.remove('active');
        if (tag.textContent.trim() === category || (tag.textContent.trim() === 'Ethnic wear' && category === 'Ethnic')) {
            tag.classList.add('active');
        }
    });
    renderWardrobe(category);
}
function toggleSelect(el) {
    el.classList.toggle('selected');
}
function deleteItem(id) {
    wardrobeItems = wardrobeItems.filter(i => i.id !== id);
    saveWardrobe();
    filterWardrobe('All');
}

// ==== Stylist Chatbot ====
let isMicActive = false;
function toggleMic() {
    isMicActive = !isMicActive;
    document.getElementById('mic-btn').classList.toggle('recording', isMicActive);
}
function handleChatEnter(e) { if (e.key === 'Enter') sendMessage(); }
function sendQuickReply(txt) {
    document.getElementById('chat-input').value = txt;
    sendMessage();
}
function sendMessage() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg) return;

    appendChatMsg(msg, 'user');
    input.value = '';

    setTimeout(() => { processAI(msg.toLowerCase()); }, 800);
}
function appendChatMsg(text, sender, isHTML = false) {
    const box = document.getElementById('chat-box');
    const div = document.createElement('div');
    div.className = `luxury-chat-msg luxury-msg-${sender}`;
    if (isHTML) div.innerHTML = text; else div.textContent = text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

// Global Rating Function
window.rateOutfit = function (el, rating) {
    const stars = el.parentElement.querySelectorAll('i');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.replace('fa-regular', 'fa-solid');
            star.classList.add('filled');
        } else {
            star.classList.replace('fa-solid', 'fa-regular');
            star.classList.remove('filled');
        }
    });
    aiContext.ratingHistory.push({ occasion: aiContext.lastOccasion, rating: rating });

    setTimeout(() => {
        appendChatMsg(`Thanks! I've saved your rating of ${rating} stars to memory for future suggestions. ✨`, 'ai');
    }, 600);
}

function processAI(msg) {
    aiContext.memory.push(msg);
    let reply = "I love exploring styles! What vibe are we going for?";

    if (["wedding", "party", "office", "travel", "beach", "ethnic"].some(w => msg.includes(w))) {
        const rx = new RegExp("(wedding|party|office|travel|beach|ethnic)");
        const match = msg.match(rx);
        aiContext.lastOccasion = match ? match[0] : 'event';

        let candidates = [];

        // Filtering Contextually
        if (aiContext.lastOccasion === 'party' || aiContext.lastOccasion === 'wedding') {
            candidates = wardrobeItems.filter(i => ["Dresses", "Tops", "Ethnic"].includes(i.category) && (i.color.includes("Black") || i.color.includes("Elegant") || i.color.includes("Pink") || i.category === "Dresses"));
        } else if (aiContext.lastOccasion === 'office') {
            candidates = wardrobeItems.filter(i => ["Tops"].includes(i.category) && (i.color.includes("White") || i.color.includes("Blouse")));
        } else if (aiContext.lastOccasion === 'ethnic') {
            candidates = wardrobeItems.filter(i => i.category === 'Ethnic');
        } else {
            candidates = wardrobeItems.filter(i => ["Tops", "Dresses"].includes(i.category));
        }

        if (candidates.length === 0) candidates = wardrobeItems.filter(i => i.category === "Tops" || i.category === "Dresses");
        if (candidates.length === 0) candidates = wardrobeItems; // Fallback

        // Add randomness so suggestions are dynamic per run
        const randomItem = candidates[Math.floor(Math.random() * candidates.length)];

        reply = `For the ${aiContext.lastOccasion}, I highly recommend this curated item! Based on your feedback, how much do you like this?
        <div class="luxury-outfit-card">
            <div class="luxury-outfit-img-wrapper">
                <img src="${randomItem.img || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=100'}" alt="rec">
            </div>
            <div class="luxury-outfit-details">
                <div class="luxury-outfit-title">${randomItem.color} Look</div>
                <div class="luxury-outfit-tags">
                    <span class="luxury-outfit-tag">${randomItem.category}</span>
                    <span class="luxury-outfit-tag">Top Match</span>
                </div>
                <div class="luxury-rating">
                     <i class="fa-solid fa-star filled" onclick="rateOutfit(this, 1)"></i>
                     <i class="fa-solid fa-star filled" onclick="rateOutfit(this, 2)"></i>
                     <i class="fa-solid fa-star filled" onclick="rateOutfit(this, 3)"></i>
                     <i class="fa-solid fa-star filled" onclick="rateOutfit(this, 4)"></i>
                     <i class="fa-regular fa-star" onclick="rateOutfit(this, 5)"></i>
                </div>
            </div>
        </div>`;
        appendChatMsg(reply, 'ai', true);
    } else if (msg.includes('yes') || msg.includes('have one')) {
        reply = "Awesome! Let me analyze what you've selected in your wardrobe to suggest accessories and improvements based on colors.";
        appendChatMsg(reply, 'ai');
    } else {
        // Checking for "memory"
        if (aiContext.ratingHistory.length > 0) {
            reply = `I remember your past preferenecs! Your last rated outfit got ${aiContext.ratingHistory[aiContext.ratingHistory.length - 1].rating} hearts. Would you like something similar today? Mention an occasion!`;
        } else {
            reply = "I'm analyzing your preferences. Try mentioning an occasion like 'party', 'office', or 'beach'!";
        }
        appendChatMsg(reply, 'ai');
    }
}
function shiftVibe(vibe) {
    const chatContainer = document.querySelector('.frosted-glass');
    chatContainer.style.background = vibe === 'Dark Colors' ? 'rgba(43,45,66,0.8)' : 'rgba(255,255,255,0.6)';
    chatContainer.style.color = vibe === 'Dark Colors' ? 'white' : 'inherit';
    appendChatMsg(`Vibe shifted to ${vibe}! Curating suggestions...`, 'ai');
}

// ==== Style Forecast ====
function generateForecast() {
    const grid = document.getElementById('forecast-grid');
    grid.innerHTML = '';

    // Construct unique 4 or 5 combos
    const tops = wardrobeItems.filter(x => x.category === 'Tops' && x.img);
    const bots = wardrobeItems.filter(x => x.category === 'Bottoms' && x.img);
    const dresses = wardrobeItems.filter(x => (x.category === 'Dresses' || x.category === 'Ethnic') && x.img);

    let combos = [];
    if (tops.length > 0 && bots.length > 0) {
        tops.forEach(t => {
            bots.forEach(b => {
                combos.push({ type: 'top-bot', top: t, bot: b });
            });
        });
    }
    dresses.forEach(d => {
        combos.push({ type: 'dress', top: d });
    });

    // Fallback if not enough valid images
    if (combos.length === 0) {
        grid.innerHTML = '<p class="subtitle mt-1">Please add items with image URLs to see forecast combinations!</p>';
        return;
    }

    // Pick up to 4 unique combinations
    combos = combos.sort(() => 0.5 - Math.random()).slice(0, 4);

    combos.forEach((combo, i) => {
        const score = 91 + Math.floor(Math.random() * 8);
        const tags = ["Highly Rated", "Great for Casual", "Top Match", "Trending"];
        const tag = tags[i % tags.length]; // cycle tags

        let imgsHtml = '';
        if (combo.type === 'dress') {
            imgsHtml = `<div class="forecast-img-wrapper"><img src="${combo.top.img}"></div>`;
        } else {
            imgsHtml = `<div class="forecast-img-wrapper split"><img src="${combo.top.img}"><img src="${combo.bot.img}"></div>`;
        }

        grid.innerHTML += `
            <div class="forecast-item" onclick="selectForecast(this)">
                <div class="forecast-img-wrapper">
                    <div class="confidence-meter"><i class="fa-solid fa-bolt"></i> ${score}% Match</div>
                    ${combo.type === 'dress' ? `<img src="${combo.top.img}">` : `<div style="display:flex; width:100%; height:100%;"><img src="${combo.top.img}" style="width:50%; object-fit:cover;"><img src="${combo.bot.img}" style="width:50%; object-fit:cover;"></div>`}
                </div>
                <div class="forecast-info">
                    <h3 class="forecast-item-title">${combo.type === 'dress' ? combo.top.name || combo.top.color : 'Two-Piece Combo'}</h3>
                    <p class="forecast-item-desc">${combo.type === 'dress' ? 'Effortless single piece outfit' : 'Perfectly matched top and bottom'}</p>
                    <span class="benefit-tag">${tag}</span>
                </div>
                <div class="checkmark"><i class="fa-solid fa-check"></i></div>
            </div>
        `;
    });
}
function selectForecast(el) {
    document.querySelectorAll('.forecast-item').forEach(e => e.classList.remove('selected'));
    el.classList.add('selected');
}

function commitForecast() {
    const selected = document.querySelector('.forecast-item.selected');
    if (!selected) { alert("Please select a forecast outfit first!"); return; }

    const today = new Date().toISOString().split('T')[0];
    if (!loggedOutfits.find(l => l.date === today)) {
        // Find which img was used
        const imgTag = selected.querySelector('.forecast-img-wrapper img').src;
        loggedOutfits.push({ date: today, items: [], img: imgTag });
        saveCalendar();
        triggerAuraFlowOverlay();
        renderCalendar();
    } else {
        alert("Outfit already logged for today!");
    }
}

window.rewearOutfit = function (dateStr) {
    const today = new Date().toISOString().split('T')[0];
    const pastLogged = loggedOutfits.find(l => l.date === dateStr);
    if (!pastLogged) return;

    if (!loggedOutfits.find(l => l.date === today)) {
        loggedOutfits.push({ date: today, items: pastLogged.items ? [...pastLogged.items] : [], img: pastLogged.img });
        saveCalendar();
        triggerAuraFlowOverlay();
        renderCalendar();
        alert("Outfit logged for today!");
    } else {
        alert("Outfit already logged for today!");
    }
}

function incrementStreak() {
    // Deprecated. Covered by triggerAuraFlowOverlay and updateAuraFlow.
}

// ==== Calendar ====
function renderCalendar() {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    document.getElementById('current-month').textContent = `${months[currentMonth]} ${currentYear}`;

    const daysMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();

    const grid = document.getElementById('calendar-days');
    grid.innerHTML = '';

    for (let i = 0; i < firstDay; i++) grid.innerHTML += `<div></div>`;

    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 1; i <= daysMonth; i++) {
        const dStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const logged = loggedOutfits.find(l => l.date === dStr);
        const isToday = dStr === todayStr;

        let html = `<div class="cal-day ${logged ? 'has-outfit' : ''} ${isToday ? 'today' : ''}" onclick="viewDay('${dStr}')">
            <span class="date-num">${i}</span>`;

        if (logged) {
            html += `<img src="${logged.img}" class="cal-day-thumb">
                     <div class="aura-dot"></div>`;
        }
        html += `</div>`;
        grid.innerHTML += html;
    }
}
function changeMonth(dir) {
    currentMonth += dir;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    renderCalendar();
}
function viewDay(dateStr) {
    document.querySelectorAll('.cal-day').forEach(d => d.classList.remove('selected'));
    event.currentTarget.classList.add('selected');

    const logged = loggedOutfits.find(l => l.date === dateStr);
    const summary = document.getElementById('calendar-summary');

    if (logged) {
        summary.innerHTML = `
            <h3>${new Date(dateStr).toDateString()}</h3>
            <span class="benefit-tag mb-1 mt-1">Status: Logged</span>
            <img src="${logged.img}" class="summary-img" alt="Logged Outfit">
            <p><strong>Weather Context:</strong> 24°C, Sunny</p>
            <button class="btn-primary w-100 mt-1" onclick="rewearOutfit('${dateStr}')">Re-wear this</button>
        `;
    } else {
        summary.innerHTML = `
            <h3>${new Date(dateStr).toDateString()}</h3>
            <p class="subtitle mt-1">No outfit logged for this date.</p>
        `;
    }
}

function logout() {
    currentUser = null;
    const layout = document.getElementById('app-container');
    layout.classList.remove('dashboard-view');
    updateBackground(0);
    setTimeout(() => {
        document.getElementById('dashboard-section').classList.add('hidden');
        document.getElementById('auth-section').classList.remove('hidden');
    }, 800);
}
