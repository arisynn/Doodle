// ── RESET GAME ──
let currentRunJumps = 0;
let rewardedCoinsThisRun = 0;
function resetGame() {
    currentRunJumps = 0;
    rewardedCoinsThisRun = 0;
    p.vy = JUMP_FORCE; p.vx = 0;
    p.flyTimer=0; p.rocketTimer=0; p.djTimer=0; p.balloonTimer=0; p.hurtTimer=0;
    p.hasDJ=false; p.hasHeart=false;
    p.scaleX=1; p.scaleY=1; p.isIdle=false; p.currentPlatform=null; p.facing='right'; 
    p.platOffsetX = 0; p.isFreeFalling = false;
    p.collectedLoot.clear(); p.expressionTimer=0;
    particles=[];

    p.x = MAP_W/2; p.y = GROUND_Y - 80; camY = GROUND_Y - H + 20; currentMeters = 0; displayScore = 0;
    p.starCharges = 0; lastSubmittedScore = 0;
    
    buildMap(); 
    document.getElementById('scoreVal').textContent = Math.floor(displayScore) + 'm';
    document.getElementById('powerBar').style.display = 'none';
    gameState = 'PLAY';
    document.getElementById('hudHeader').style.display = 'flex';
    
    // Apply Powerups if owned
    
    let hsLevel = powerupLevels && powerupLevels.headStart ? powerupLevels.headStart : 0;
    if (hsLevel > 0) {
        p.rocketTimer = 250 + (hsLevel * 50);
        p.vy = ROCKET_FORCE;
        spawnParticles(p.x, p.y + 20, '#f97316', 30);
    }
    
    let ehLevel = powerupLevels && powerupLevels.extraHeart ? powerupLevels.extraHeart : 0;
    if (ehLevel > 0) {
        p.hasHeart = true;
    }

    // Update local storage and UI
    saveUserData();

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
