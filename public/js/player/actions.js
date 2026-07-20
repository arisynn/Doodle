// ── RESET GAME ──
let currentRunJumps = 0;
let rewardedCoinsThisRun = 0;
let usedConsumableThisRun = false;

function resetGame() {
    currentRunJumps = 0;
    rewardedCoinsThisRun = 0;
    usedConsumableThisRun = false;
    p.vy = JUMP_FORCE; p.vx = 0;
    p.flyTimer=0;  p.djTimer=0; p.balloonTimer=0; p.hurtTimer=0; p.magnetTimer=0;
    p.hasDJ=false; p.hasHeart=false;
    p.scaleX=1; p.scaleY=1; p.isIdle=false; p.currentPlatform=null; p.facing='right'; 
    p.platOffsetX = 0; p.isFreeFalling = false;
    p.collectedLoot.clear(); p.expressionTimer=0;
    particles=[];

    p.x = MAP_W/2; p.y = GROUND_Y - 80; camY = GROUND_Y - H + 20; currentMeters = 0; displayScore = 0;
    p.starCharges = 0; lastSubmittedScore = 0;
    
    buildMap(); 
    document.getElementById('scoreVal').textContent = Math.floor(displayScore) + 'm';
    let pb = document.getElementById('powerBar'); if(pb) pb.style.display = 'none';
    gameState = 'PLAY';
    let hh = document.getElementById('hudHeader'); if(hh) hh.style.display = 'flex';
    
    // Apply Powerups if owned
    
    

    // Update local storage and UI
    if (window.renderInventoryBar) renderInventoryBar(); saveUserData();

}

function triggerJump() {
    if (gameState !== 'PLAY') return;
    currentRunJumps++;
    if (p.isIdle && p.currentPlatform) {
        p.isIdle = false;
        let pl = p.currentPlatform;
        p.currentPlatform = null;
        let f = p.starCharges > 0 ? BOOST_FORCE : JUMP_FORCE;
        if (p.starCharges > 0) { p.starCharges--; spawnParticles(p.x, p.y, '#fbbf24', 25); floatText(p.x, p.y, 'SUPER JUMP!', '#f59e0b'); }
        p.vy = f;
        p.hasDJ = true;
        if (pl && pl.type === 'fragile') {
            pl.broken = true; pl.isCracking = false; pl.restoreTimer = 150;
            spawnParticles(pl.x + pl.w/2, pl.y, '#f59e0b', 15);
        }
    } else if (p.djTimer > 0 && p.hasDJ && !p.isFreeFalling) {
        p.vy = JUMP_FORCE;
        p.hasDJ = false; 
        spawnParticles(p.x, p.y + 10, '#3b82f6', 20);
        floatText(p.x, p.y, 'DOUBLE JUMP!', '#60a5fa');
    }
}

function triggerScreenShake() {
    const gc = document.getElementById('gameContainer');
    gc.classList.remove('shake-effect');
    void gc.offsetWidth; 
    gc.classList.add('shake-effect');
}

window.renderInventoryBar = function() {
    let inv = document.getElementById('inventoryBar');
    if (!inv) return;
    
    let html = '';
    let hasItems = false;
    let icons = {
        'propellerhat': 'assets/powerups/propellerhat.png',
        'superjump': 'assets/powerups/superjump.png',
        'doublejump': 'assets/powerups/doublejump.png',
        'slowfall': 'assets/powerups/slowfall.png'
    };
    
    for (let k in icons) {
        let count = powerupConsumables[k] || 0;
        if (count > 0) {
            hasItems = true;
            html += `<div style="position:relative; width:45px; height:45px; cursor:pointer;" onclick="useConsumable('${k}')" ontouchstart="useConsumable('${k}')">
                <img src="${icons[k]}" style="width:100%; height:100%;">
                <div style="position:absolute; bottom:-5px; right:-5px; background:#ef4444; color:white; font-size:12px; font-weight:bold; width:20px; height:20px; border-radius:10px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 4px rgba(0,0,0,0.3);">${count}</div>
            </div>`;
        }
    }
    
    inv.innerHTML = html;
    if (gameState === 'PLAY' && hasItems && !usedConsumableThisRun) {
        inv.style.display = 'flex';
    } else {
        inv.style.display = 'none';
    }
};

window.useConsumable = function(key) {
    if (gameState !== 'PLAY') return;
    if (!powerupConsumables[key] || powerupConsumables[key] <= 0) return;
    if (usedConsumableThisRun) return;
    
    usedConsumableThisRun = true;
    powerupConsumables[key]--;
    saveUserData();
    renderInventoryBar();
    
    if (key === 'propellerhat') {
        p.flyTimer = 250; p.vy = FLY_FORCE;
        spawnParticles(p.x, p.y + 20, '#38bdf8', 30);
        floatText(p.x, p.y, 'PROPELLER HAT!', '#38bdf8');
    } else if (key === 'superjump') {
        p.starCharges += 3;
        floatText(p.x, p.y, 'SUPER JUMP!', '#fbbf24');
    } else if (key === 'doublejump') {
        p.djTimer = 400; p.hasDJ = true;
        floatText(p.x, p.y, 'DOUBLE JUMP!', '#60a5fa');
    } else if (key === 'slowfall') {
        p.balloonTimer = 500;
        floatText(p.x, p.y, 'SLOW FALL!', '#ef4444');
    } else if (key === 'shield') {
        p.hurtTimer = 600;
        floatText(p.x, p.y, 'SHIELD!', '#a855f7');
    } else if (key === 'magnet') {
        p.magnetTimer = 800;
        floatText(p.x, p.y, 'MAGNET!', '#f43f5e');
    }
    triggerScreenShake();
};
