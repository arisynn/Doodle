// ── USER DATA & STATE ──

const coinIcon = '<svg class="icon-sm" viewBox="0 0 24 24" fill="#fbbf24" stroke="#d97706" stroke-width="2" style="width:14px;height:14px;vertical-align:middle;margin-right:2px;"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>';
const gemIcon = '<svg class="icon-sm" viewBox="0 0 24 24" fill="#34d399" stroke="#059669" stroke-width="2" style="width:14px;height:14px;vertical-align:middle;margin-right:2px;"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon></svg>';

let coins = parseInt(localStorage.getItem('doodle_coins') || '0');
let playerGems = parseInt(localStorage.getItem('doodle_gems') || '0');
let powerupLevels = JSON.parse(localStorage.getItem('doodle_powerup_levels') || '{"hat":1, "rocket":1, "dj":1, "balloon":1, "headStart":0, "extraHeart":0}');
let unlockedItems = JSON.parse(localStorage.getItem('doodle_unlocked') || '["default"]');
// Ensure default is always there
if (!unlockedItems.includes('default')) unlockedItems.push('default');

let stats = JSON.parse(localStorage.getItem('doodle_stats') || '{"gamesPlayed": 0, "totalJumps": 0, "maxHeight": 0}');

// Daily Challenge
const todayStr = new Date().toDateString();
let dailyChallenge = JSON.parse(localStorage.getItem('doodle_daily') || '{}');
if (dailyChallenge.date !== todayStr) {
    dailyChallenge = {
        date: todayStr,
        type: ['jump', 'height', 'play'][Math.floor(Math.random() * 3)],
        progress: 0,
        target: 0,
        reward: 50,
        completed: false
    };
    if(dailyChallenge.type === 'jump') { dailyChallenge.target = 50; dailyChallenge.text = "Jump 50 times today!"; }
    if(dailyChallenge.type === 'height') { dailyChallenge.target = 500; dailyChallenge.text = "Reach 500m total today!"; }
    if(dailyChallenge.type === 'play') { dailyChallenge.target = 3; dailyChallenge.text = "Play 3 games today!"; }
    localStorage.setItem('doodle_daily', JSON.stringify(dailyChallenge));
}

// Achievements
const achievementsList = [
    { id: 'first_jump', name: 'First Steps', desc: 'Jump for the first time', reward: 10, req: { type: 'jumps', val: 1 } },
    { id: 'high_flyer', name: 'High Flyer', desc: 'Reach 1000m max height', reward: 100, req: { type: 'maxHeight', val: 1000 } },
    { id: 'veteran', name: 'Veteran', desc: 'Play 10 games', reward: 50, req: { type: 'games', val: 10 } }
];
let unlockedAch = JSON.parse(localStorage.getItem('doodle_ach') || '[]');

function saveUserData() {
    localStorage.setItem('doodle_gems', playerGems);
    localStorage.setItem('doodle_powerup_levels', JSON.stringify(powerupLevels));
    localStorage.setItem('doodle_coins', coins);
    localStorage.setItem('doodle_unlocked', JSON.stringify(unlockedItems));
    localStorage.setItem('doodle_stats', JSON.stringify(stats));
    localStorage.setItem('doodle_daily', JSON.stringify(dailyChallenge));
    localStorage.setItem('doodle_ach', JSON.stringify(unlockedAch));
    updateUI();
}

function updateUI() {
    let mcp = document.getElementById('menuCharPreview');
    if (mcp && window.characterManager) {
        let eq = window.characterManager.skins.find(s => s.id === window.characterManager.selectedSkin);
        if (eq) {
            mcp.innerHTML = '';
            
            let testUrl = 'assets/player/skins/' + eq.id + '/idle.png';
            if (eq.id === 'default') testUrl = 'assets/player/base/idle.png';
            let tmp = new Image();
            tmp.onload = () => { 
                mcp.style.backgroundImage = 'url("' + testUrl + '")'; 
                mcp.style.backgroundColor = 'transparent';
            };
            tmp.onerror = () => { 
                mcp.style.backgroundImage = 'none'; 
                mcp.style.backgroundColor = eq.id === 'default' ? '#3b82f6' : '#94a3b8';
            };
            tmp.src = testUrl;

        }
    }

    document.getElementById('coinDisplay').innerText = coins;
    let gd = document.getElementById('gemDisplay'); if(gd) gd.innerText = playerGems;
    let sgd = document.getElementById('shopGemDisplay'); if(sgd) sgd.innerText = playerGems;
    
    
    document.getElementById('shopCoinDisplay').innerText = coins; let hc = document.getElementById('hudCoinDisplay'); if(hc) hc.innerText = coins; let hg = document.getElementById('hudGemDisplay'); if(hg) hg.innerText = playerGems; let ucd = document.getElementById('upgCoinDisplay'); if(ucd) ucd.innerText = coins; let ugd = document.getElementById('upgGemDisplay'); if(ugd) ugd.innerText = playerGems;
    
    // Daily challenge UI
    document.getElementById('dcText').innerText = dailyChallenge.text;
    document.getElementById('dcReward').innerHTML = dailyChallenge.completed ? 'COMPLETED' : 'Reward: ' + dailyChallenge.reward + ' ' + coinIcon;
    let pct = Math.min(100, (dailyChallenge.progress / dailyChallenge.target) * 100);
    document.getElementById('dcFill').style.width = pct + '%';
    if(dailyChallenge.completed) document.getElementById('dcFill').style.background = '#10b981';

    // Shop UI
    renderShopSelection();
    const charRow = document.getElementById('charRow');
    if (charRow) {
        charRow.innerHTML = '';
        if (window.characterManager) {
            window.characterManager.skins.forEach(skin => {
                let isUnlocked = unlockedItems.includes(skin.id);
                let isEquipped = window.characterManager.selectedSkin === skin.id;
                
                let el = document.createElement('div');
                el.className = 'skin-card ' + (isUnlocked ? 'unlocked' : 'locked') + (isEquipped ? ' selected' : '');
                
                // Styling
                el.style.width = '70px';
                el.style.height = '90px';
                el.style.borderRadius = '12px';
                el.style.border = isEquipped ? '3px solid #3b82f6' : '3px solid #cbd5e1';
                el.style.background = isUnlocked ? '#f8fafc' : '#e2e8f0';
                el.style.display = 'flex';
                el.style.flexDirection = 'column';
                el.style.alignItems = 'center';
                el.style.justifyContent = 'center';
                el.style.cursor = 'pointer';
                el.style.position = 'relative';
                el.style.overflow = 'hidden';
                
                
                // Add preview image as a div (spritesheet support)
                let img = document.createElement('div');
                img.style.width = '40px';
                img.style.height = '40px';
                img.style.marginBottom = '5px';
                img.style.backgroundImage = 'url("' + skin.previewImage + '")';
                img.style.backgroundSize = '400% 100%';
                img.style.backgroundPosition = '0% 0%';
                img.style.backgroundRepeat = 'no-repeat';

                
                let tempIconImg = new Image();
                let iconUrl = skin.id === 'default' ? 'assets/player/base/idle.png' : skin.previewImage;
                tempIconImg.onload = () => {
                    img.style.backgroundImage = 'url("' + iconUrl + '")';
                    img.style.backgroundColor = 'transparent';
                };
                tempIconImg.onerror = () => {
                    img.style.backgroundImage = 'none';
                    img.style.backgroundColor = skin.id === 'default' ? '#3b82f6' : '#94a3b8';
                };
                tempIconImg.src = iconUrl;


                
                // Name or price
                let text = document.createElement('div');
                text.style.fontSize = '0.7rem';
                text.style.fontWeight = '800';
                text.style.color = '#475569';
                
                if (isUnlocked) {
                    text.innerText = isEquipped ? 'EQUIPPED' : skin.name;
                    text.style.color = isEquipped ? '#3b82f6' : '#475569';
                } else {
                    text.innerText = skin.priceCoins;
                    let icon = document.createElement('span');
                    // Gem or Coin logic
                    if (skin.isGem) {
                        text.style.color = '#059669';
                        text.innerHTML = '<svg class="icon-sm" viewBox="0 0 24 24" fill="#34d399" stroke="#059669" stroke-width="2" style="width:12px;height:12px;vertical-align:middle;margin-right:2px;"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon></svg>' + skin.priceCoins;
                    } else {
                        text.innerHTML = '<svg class="icon-sm" viewBox="0 0 24 24" fill="#fbbf24" stroke="#d97706" stroke-width="2" style="width:12px;height:12px;vertical-align:middle;margin-right:2px;"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>' + skin.priceCoins;
                    }
                }
                
                el.appendChild(img);
                el.appendChild(text);
                
                // Lock overlay
                if (!isUnlocked) {
                    let overlay = document.createElement('div');
                    overlay.style.position = 'absolute';
                    overlay.style.inset = '0';
                    overlay.style.background = 'rgba(255,255,255,0.4)';
                    el.appendChild(overlay);
                }
                
                el.onclick = () => handleSkinClick(skin, el);
                charRow.appendChild(el);
            });
        }
    }
}

// ── NAVIGATION ──
const screens = {
    login: document.getElementById('loginScreen'),
    main: document.getElementById('mainMenuScreen'),
    shop: document.getElementById('shopScreen'),
    missions: document.getElementById('missionsScreen'),
    achievements: document.getElementById('achievementsScreen'),
    settings: document.getElementById('settingsScreen'),
    stats: document.getElementById('statsScreen'),
    upgrades: document.getElementById('upgradesScreen'),
    gameOver: document.getElementById('gameOverScreen')
};


function renderUpgrades() {
    let upgDefs = {
        'hat': { name: 'Propeller Hat', desc: 'Terbang lebih lama', max: 5, baseCost: 100 },
        'rocket': { name: 'Jetpack', desc: 'Roket lebih lama', max: 5, baseCost: 150 },
        'dj': { name: 'Golden Wings', desc: 'Double jump window lebih lama', max: 5, baseCost: 80 },
        'balloon': { name: 'Balloon', desc: 'Jatuh lambat lebih lama', max: 5, baseCost: 80 },
        'headStart': { name: 'Head Start', desc: 'Mulai dengan roket super (Passive)', max: 5, baseCost: 200 },
        'extraHeart': { name: 'Extra Heart', desc: 'Kebal 1x saat kena duri (Passive)', max: 1, baseCost: 500 }
    };
    
    let html = '';
    for (let k in upgDefs) {
        let def = upgDefs[k];
        let lvl = powerupLevels[k] || (k==='headStart'||k==='extraHeart' ? 0 : 1);
        let cost = def.baseCost * (lvl + 1);
        let maxed = lvl >= def.max;
        
        html += `
            <div style="background:#f8fafc; border:2px solid #cbd5e1; border-radius:12px; padding:10px; display:flex; justify-content:space-between; align-items:center;">
                <div style="flex:1;">
                    <div style="font-weight:800; color:#1e293b; font-size:1.1rem;">${def.name} <span style="color:#059669;">(Lv ${lvl})</span></div>
                    <div style="font-size:0.8rem; color:#64748b; font-weight:700;">${def.desc}</div>
                </div>
                <div>
                    ${maxed ? 
                        '<span style="font-weight:800; color:#ef4444;">MAX</span>' : 
                        '<button class="btn-primary" onclick="buyUpgrade(\''+k+'\', '+cost+')" style="padding:5px 10px; font-size:0.9rem; display:flex; align-items:center; justify-content:center; gap:4px;"><svg class="icon-sm" viewBox="0 0 24 24" fill="#fde68a" stroke="#b45309" stroke-width="2" style="width:14px;height:14px;"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>' + cost + '</button>'
                    }
                </div>
            </div>
        `;
    }
    let ul = document.getElementById('upgradesList');
    if(ul) ul.innerHTML = html;
}

window.buyUpgrade = function(k, cost) {
    if (coins >= cost) {
        coins -= cost;
        powerupLevels[k] = (powerupLevels[k] || 0) + 1;
        saveUserData();
        renderUpgrades();
        
        // update top UI as well
        let ucd = document.getElementById('upgCoinDisplay'); if(ucd) ucd.innerText = coins;
        let hc = document.getElementById('hudCoinDisplay'); if(hc) hc.innerText = coins;
    } else {
        alert("Koin tidak cukup!");
    }
};

function showScreen(name) {
    for(let k in screens) screens[k].style.display = 'none';
    screens[name].style.display = 'block';
    updateUI();
}

// Check auto login
if (localStorage.getItem('doodle_n12')) {
    playerName = localStorage.getItem('doodle_n12');
    document.getElementById('nameInput').value = playerName;
    document.getElementById('menuPlayerName').innerText = playerName;
    showScreen('main');
} else {
    showScreen('login');
}

// ── LISTENERS ──
document.getElementById('loginBtn').onclick = () => {
    let name = document.getElementById('nameInput').value.trim();
    if (!name || name.length < 2) {
        document.getElementById('errMsg').textContent = 'Minimal 2 huruf!';
        return;
    }
    playerName = name;
    localStorage.setItem('doodle_n12', playerName);
    document.getElementById('menuPlayerName').innerText = playerName;
    showScreen('main');
};

document.getElementById('btnPlay').onclick = () => {
    stats.gamesPlayed++;
    saveUserData();
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('hudHeader').style.display = 'flex';
    document.getElementById('chatFab').style.display = 'block';
    document.getElementById('touchZone').style.display = 'block';
    
    // Check if Ably is connected, otherwise connect
    if(!window.ablyConnected) {
        connectAbly(playerName);
        window.ablyConnected = true;
    }
    resetGame();
    lbFetch();
};

document.getElementById('btnShop').onclick = () => { showScreen('shop'); };
document.getElementById('shopBack').onclick = () => { showScreen('main'); };

document.getElementById('btnMissions').onclick = () => { 
    renderMissions(); let hc = document.getElementById('hudCoinDisplay'); if(hc) hc.innerText = coins;
    showScreen('missions'); 
};
document.getElementById('missionsBack').onclick = () => { showScreen('main'); };

document.getElementById('btnAchievements').onclick = () => { 
    renderAchievements();
    showScreen('achievements'); 
};
document.getElementById('achievementsBack').onclick = () => { showScreen('main'); };

// ── SHOP LOGIC ──


var currentShopSkin = null;

function renderShopSelection() {
    let msgArea = document.getElementById('shopMsg');
    let buyBtn = document.getElementById('buyBtn');
    let previewImg = document.getElementById('shopBigPreview');
    let nameEl = document.getElementById('shopSkinName');
    
    if (!currentShopSkin) {
        if (window.characterManager) {
            let eq = window.characterManager.skins.find(s => s.id === window.characterManager.selectedSkin);
            if(eq) currentShopSkin = eq;
        }
    }
    
    
    if(!currentShopSkin) return;
    
    let skin = currentShopSkin;
    let imgUrl = 'assets/player/skins/' + skin.id + '/idle.png';
    
    // Test if image exists (fallback to base)
    
    let tempImg = new Image();
    if (skin.id === 'default') {
        imgUrl = 'assets/player/base/idle.png';
    } else {
        imgUrl = skin.previewImage;
    }
    tempImg.onload = () => {
        previewImg.style.backgroundImage = 'url("' + imgUrl + '")';
        previewImg.style.backgroundColor = 'transparent';
    };
    tempImg.onerror = () => {
        previewImg.style.backgroundImage = 'none';
        previewImg.style.backgroundColor = skin.id === 'default' ? '#3b82f6' : '#94a3b8';
    };
    tempImg.src = imgUrl;


    nameEl.innerText = skin.name;

    
    if (unlockedItems.includes(skin.id)) {
        if(window.characterManager && window.characterManager.selectedSkin === skin.id) {
            msgArea.innerText = "EQUIPPED";
            msgArea.style.color = "#3b82f6";
            buyBtn.style.display = 'none';
        } else {
            msgArea.innerText = "Sudah dimiliki";
            msgArea.style.color = "#94a3b8";
            buyBtn.style.display = 'inline-block';
            buyBtn.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
            buyBtn.style.borderColor = '#1d4ed8';
            buyBtn.style.boxShadow = '0 4px 0 #1d4ed8';
            buyBtn.innerText = "GUNAKAN";
            
            buyBtn.onclick = () => {
                if (window.characterManager) {
                    window.characterManager.loadSkin(skin.id);
                }
                updateUI();
            };
        }
    } else {
        msgArea.innerHTML = 'Harga: ' + skin.priceCoins + ' ' + (skin.isGem ? gemIcon : coinIcon);
        msgArea.style.color = "#94a3b8";
        buyBtn.style.display = 'inline-block';
        buyBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        buyBtn.style.borderColor = '#047857';
        buyBtn.style.boxShadow = '0 4px 0 #047857';
        
        buyBtn.innerHTML = "BELI " + (skin.isGem ? 
            '<svg class="icon-sm" viewBox="0 0 24 24" fill="#a7f3d0" stroke="#047857" stroke-width="2" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon></svg>' + skin.priceCoins :
            '<svg class="icon-sm" viewBox="0 0 24 24" fill="#fde68a" stroke="#b45309" stroke-width="2" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>' + skin.priceCoins);
        
        buyBtn.onclick = () => {
            let canBuy = skin.isGem ? (playerGems >= skin.priceCoins) : (coins >= skin.priceCoins);
            if (canBuy) {
                if (skin.isGem) playerGems -= skin.priceCoins;
                else coins -= skin.priceCoins;
                
                unlockedItems.push(skin.id);
                if (window.characterManager) window.characterManager.loadSkin(skin.id);
                saveUserData();
                updateUI();
            } else {
                alert((skin.isGem ? "Gems" : "Koin") + " tidak cukup!");
            }
        };
    }
}

function handleSkinClick(skin, btnEl) {
    currentShopSkin = skin;
    updateUI();
}



document.querySelectorAll('#shopScreen .powerup-card').forEach(btn => {
    btn.onclick = () => handleShopItemClick(btn, true);
});


// ── MISSIONS & ACHIEVEMENTS RENDER ──

function claimDaily() {
    let today = new Date().toDateString();
    let lastClaim = localStorage.getItem('doodle_daily_claim') || '';
    if (lastClaim !== today) {
        coins += 100;
        localStorage.setItem('doodle_daily_claim', today);
        saveUserData();
        renderMissions();
    }
}

function renderMissions() {
    let html = `
        
        <div class="list-item" style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-color: #fbbf24;">
            <div class="list-info">
                <h4>Hadiah Harian</h4>
                <p>Klaim 100 <svg class="icon-sm" viewBox="0 0 24 24" fill="#fbbf24" stroke="#d97706" stroke-width="2" style="width:14px;height:14px;vertical-align:middle;margin-right:2px;"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg> setiap hari!</p>
            </div>
            <div>
                ${localStorage.getItem('doodle_daily_claim') === new Date().toDateString() ? 
                    '<span class="list-status">[V] Diklaim</span>' : 
                    '<button class="btn-primary" onclick="claimDaily()" style="padding: 5px 10px; font-size: 0.8rem; background: #f59e0b; border-color: #b45309;">KLAIM</button>'
                }
            </div>
        </div>
        <div class="list-item">
            <div class="list-info">
                <h4>Daily: ${dailyChallenge.text}</h4>
                <p>Progress: ${dailyChallenge.progress} / ${dailyChallenge.target}</p>
            </div>
            <div>
                <span class="list-reward" style="display:flex; align-items:center; justify-content:flex-end;">${dailyChallenge.reward} <svg class="icon-sm" viewBox="0 0 24 24" fill="#fbbf24" stroke="#d97706" stroke-width="2" style="width:14px;height:14px;vertical-align:middle;margin-right:2px;"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg></span><br>
                <span class="list-status">${dailyChallenge.completed ? '[V] Selesai' : '[...] Berjalan'}</span>
            </div>
        </div>
    `;
    document.getElementById('missionsList').innerHTML = html;
}

function renderAchievements() {
    let html = achievementsList.map(a => {
        let unl = unlockedAch.includes(a.id);
        return `
        <div class="list-item" style="opacity: ${unl ? 1 : 0.6}">
            <div class="list-info">
                <h4>${a.name}</h4>
                <p>${a.desc}</p>
            </div>
            <div>
                <span class="list-reward" style="display:flex; align-items:center; justify-content:flex-end;">${a.reward} <svg class="icon-sm" viewBox="0 0 24 24" fill="#fbbf24" stroke="#d97706" stroke-width="2" style="width:14px;height:14px;vertical-align:middle;margin-right:2px;"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg></span><br>
                <span class="list-status">${unl ? '[V] Selesai' : '[X] Belum'}</span>
            </div>
        </div>
        `;
    }).join('');
    document.getElementById('achievementsList').innerHTML = html;
}

// ── HOOKS FOR GAME LOOP TO UPDATE STATS ──
window.addCoins = function(amt) {
    coins += amt;
    saveUserData();
};
window.updateGameStats = function(jumps, maxHeight) {
    stats.totalJumps += jumps;
    if(maxHeight > stats.maxHeight) stats.maxHeight = maxHeight;
    
    // Update daily
    if(!dailyChallenge.completed) {
        if(dailyChallenge.type === 'jump') dailyChallenge.progress += jumps;
        if(dailyChallenge.type === 'height') dailyChallenge.progress += maxHeight;
        if(dailyChallenge.type === 'play') dailyChallenge.progress = stats.gamesPlayed;
        
        if(dailyChallenge.progress >= dailyChallenge.target) {
            dailyChallenge.completed = true;
            dailyChallenge.progress = dailyChallenge.target;
            coins += dailyChallenge.reward;
            // show notification maybe?
        }
    }
    
    // Check achievements
    achievementsList.forEach(a => {
        if(!unlockedAch.includes(a.id)) {
            let pass = false;
            if(a.req.type === 'jumps' && stats.totalJumps >= a.req.val) pass = true;
            if(a.req.type === 'maxHeight' && stats.maxHeight >= a.req.val) pass = true;
            if(a.req.type === 'games' && stats.gamesPlayed >= a.req.val) pass = true;
            if(pass) {
                unlockedAch.push(a.id);
                coins += a.reward;
            }
        }
    });
    
    saveUserData();
};

// HUD Menu Button
document.getElementById('hudMenuBtn').onclick = () => {
    // Return to main menu
    gameState = 'MENU';
    document.getElementById('overlay').style.display = 'flex';
    document.getElementById('hudHeader').style.display = 'none';
    document.getElementById('chatFab').style.display = 'none';
    document.getElementById('touchZone').style.display = 'none';
    document.getElementById('hudHeader').style.display = 'none';
    
    // Save state if needed
    if(window.updateGameStats) {
        window.updateGameStats(currentRunJumps, currentMeters);
        let runCoins = Math.floor(currentMeters / 10);
        if (runCoins > 0 && window.addCoins) {
            window.addCoins(runCoins);
        }
    }
    
    showScreen('main');
};

// ── SETTINGS ──
document.getElementById('btnSettings').onclick = () => { showScreen('settings'); };
document.getElementById('settingsBack').onclick = () => { showScreen('main'); };

document.getElementById('btnLogout').onclick = () => {
    localStorage.removeItem('doodle_n12');
    showScreen('login');
};
document.getElementById('btnChangeProfile').onclick = () => {
    document.getElementById('nameInput').value = playerName;
    showScreen('login');
};

// Update character preview
function updateCharPreview() {
    let p = document.getElementById('menuCharPreview');
    p.style.background = playerType === 'ninja' ? '#1e293b' : playerColor;
    p.style.color = playerType === 'ninja' ? '#fff' : '#1e293b';
    if (playerType === 'doodle') { p.innerText = 'D'; p.style.borderRadius = '12px'; }
    if (playerType === 'jelly') { p.innerText = 'J'; p.style.borderRadius = '8px'; }
    if (playerType === 'slime') { p.innerText = 'S'; p.style.borderRadius = '50% 50% 12px 12px'; }
    if (playerType === 'ghost') { p.innerText = 'G'; p.style.borderRadius = '50% 50% 50% 50%'; }
    if (playerType === 'ninja') { p.innerText = 'N'; p.style.borderRadius = '8px'; }
}
const oldUpdateUI = updateUI;
updateUI = function() {
    oldUpdateUI();
    updateCharPreview();
};

// ── STATS & DAILY REWARD ──

document.getElementById('btnStats').onclick = () => {
    document.getElementById('statsContent').innerHTML = `
        <div class="list-item">
            <div class="list-info"><h4>Total Dimainkan</h4></div>
            <div class="list-reward" style="color:#2563eb;">${stats.gamesPlayed} x</div>
        </div>
        <div class="list-item">
            <div class="list-info"><h4>Total Lompatan</h4></div>
            <div class="list-reward" style="color:#2563eb;">${stats.totalJumps} x</div>
        </div>
        <div class="list-item">
            <div class="list-info"><h4>Rekor Tertinggi</h4></div>
            <div class="list-reward" style="color:#2563eb;">${stats.maxHeight}m</div>
        </div>
        <div class="list-item">
            <div class="list-info"><h4>Total Koin Dikumpulkan</h4></div>
            <div class="list-reward" style="color:#2563eb;">${coins} Coins</div>
        </div>
    `;
    showScreen('stats');
};
document.getElementById('statsBack').onclick = () => { showScreen('main'); };

document.getElementById('btnUpgrades').onclick = () => { renderUpgrades(); showScreen('upgrades'); };
document.getElementById('upgradesBack').onclick = () => { showScreen('main'); };



// ── GAME OVER ──
window.showGameOver = function(score, earnedCoins) {
    gameState = 'GAMEOVER';
    document.getElementById('overlay').style.display = 'flex';
    document.getElementById('hudHeader').style.display = 'none';
    document.getElementById('chatFab').style.display = 'none';
    document.getElementById('touchZone').style.display = 'none';
    
    document.getElementById('goScore').innerText = Math.floor(score) + 'm';
    document.getElementById('goCoins').innerText = earnedCoins;
    
    let btnRevive = document.getElementById('btnRevive');
    if (playerGems >= 1) {
        btnRevive.style.display = 'flex';
    } else {
        btnRevive.style.display = 'none';
    }
    
    showScreen('gameOver');
};

document.getElementById('btnPlayAgain').onclick = () => {
    stats.gamesPlayed++;
    saveUserData();
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('hudHeader').style.display = 'flex';
    document.getElementById('chatFab').style.display = 'block';
    document.getElementById('touchZone').style.display = 'block';
    resetGame();
};

document.getElementById('btnGoMenu').onclick = () => {
    gameState = 'MENU';
    showScreen('main');
};

document.getElementById('btnRevive').onclick = () => {
    if (playerGems >= 1) {
        playerGems -= 1;
        saveUserData();
        
        // Revive logic
        gameState = 'PLAY';
        document.getElementById('overlay').style.display = 'none';
        document.getElementById('hudHeader').style.display = 'flex';
        document.getElementById('chatFab').style.display = 'block';
        document.getElementById('touchZone').style.display = 'block';
        
        p.isIdle = false;
        p.isFreeFalling = false;
        p.hasDJ = false;
        p.vy = ROCKET_FORCE; 
        p.y = camY + H + 20;
        p.rocketTimer = 250;
        
        spawnParticles(p.x, p.y + 20, '#f97316', 40);
        triggerScreenShake();
    } else {
        alert("Gems tidak cukup!");
    }
};
