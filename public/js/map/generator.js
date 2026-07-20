// ── MAP GEN & PLATFORMS ──
function mulberry32(seed) { return function() { let t = seed += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

function getLevelData(lvl) {
    let d = new Date();
    // Format YYYYMMDD, contoh: 20260620 (20 Juni 2026)
    let hourlySeed = d.getFullYear() * 1000000 + (d.getMonth() + 1) * 10000 + d.getDate() * 100 + d.getHours(); 
    
    let seedToUse = hourlySeed;

    let rng = mulberry32(lvl * 7919 + seedToUse);
    
    let r1 = rng(), r2 = rng(), r3 = rng(), r4 = rng();
    
    let pw = 55 + r1 * 60; 
    let safeWidth = MAP_W - pw - 20;
    let px = 10 + Math.floor(r2 * safeWidth); 
    
    let type = 'normal';
    if (lvl < 10) {
        if (r3 > 0.8) type = 'moving';
    } else if (lvl < 40) {
        if (r3 > 0.8) type = 'conveyor';
        else if (r3 > 0.6) type = 'moving';
        else if (r3 > 0.5) type = 'fragile';
        else if (r3 > 0.93) type = 'spring'; 
    } else { 
        if (r3 > 0.95) type = 'updown'; 
        else if (r3 > 0.85) type = 'ghost';
        else if (r3 > 0.75) type = 'icy';
        else if (r3 > 0.6) type = 'conveyor';
        else if (r3 > 0.45) type = 'moving';
        else if (r3 > 0.4) type = 'fragile';
        else if (r3 > 0.35) type = 'trampoline';
        else if (r3 > 0.3) type = 'portal';
        else if (r3 > 0.15) type = 'bumper';
    }

    return { type, pw, px, rng, r4 };
}

function generateLevel(lvl) {
    if (lvl === 0) return { type:'ground', x: -1500, y: GROUND_Y, w: 4000 }; 
    
    // SISTEM JEDA UNTUK PLATFORM UPDOWN
    for(let i=1; i<=2; i++) {
        if (lvl - i > 0) {
            let past = getLevelData(lvl - i);
            if (past.type === 'updown') return null; // Jika 1 atau 2 level di bawah adalah updown, jangan buat platform disini
        }
    }

    let d = getLevelData(lvl);
    let type = d.type;

    if (lvl > 1) {
        let prevD = getLevelData(lvl - 1);
        if (['fragile', 'ghost', 'portal'].includes(prevD.type) && ['fragile', 'ghost', 'portal'].includes(type)) {
            type = d.rng() > 0.5 ? 'normal' : 'moving';
        }
    }

    // RULE KHUSUS: Disable "ghost" di dekat "updown"
    if (type === 'ghost') {
        let isNextUpdown = false;
        let nextD = getLevelData(lvl + 1);
        if (nextD.type === 'updown') isNextUpdown = true;

        let isPrevUpdown = false;
        if (lvl > 3) {
            let pastD = getLevelData(lvl - 3);
            if (pastD.type === 'updown') isPrevUpdown = true;
        }

        if (isNextUpdown || isPrevUpdown) {
            type = 'normal'; 
        }
    }

    let item = null, hasGem = false, hasCoin = false, hasEnemy = false;
    let r_item = d.rng();
    
    if (type !== 'updown') {
        if (['normal', 'moving', 'icy', 'conveyor'].includes(type) && lvl > 5 && r_item > 0.90) {
            let r_which = d.rng();
            if (r_which > 0.8) item = 'superjump';
            else if (r_which > 0.6) item = 'hat';
            else if (r_which > 0.4) item = 'dj';
            else if (r_which > 0.2) item = 'slowfall';
            else item = 'extralife';
        }
    }

    let speed = 1.5 + d.rng() * 1.5;
    let dir = d.rng() > 0.5 ? 1 : -1;

    return { type, x: d.px, y: GROUND_Y - lvl * PLAT_GAP, w: d.pw, item, hasGem, hasCoin, hasEnemy, baseX: d.px, speed, dir };
}

function buildMap() { 
    platforms.clear(); items.clear(); gemMap.clear(); coinsMap.clear(); enemiesMap.clear(); 
    let topLvl = Math.floor((GROUND_Y - camY + H) / PLAT_GAP) + 20;
    let botLvl = Math.max(0, Math.floor((GROUND_Y - (camY+H)) / PLAT_GAP) - 5);
    for (let i=botLvl; i <= topLvl; i++) {
        let l = generateLevel(i);
        if (l) {
            let pl = new Platform(i, l); pl.w = l.w; pl.baseX = l.x; platforms.set(i, pl);
             if (l.hasCoin) coinsMap.set(i, new CoinObj(i, l.x + l.w/2, l.y)); if (l.hasEnemy) enemiesMap.set(i, new EnemyObj(i, l.x + l.w/2, l.y)); if (l.hasGem) gemMap.set(i, new GemObj(i, l.x + l.w/2, l.y)); if (l.item) items.set(i, new ItemObj(i, l.x + l.w/2, l.y, l.item));

        }
    }
}

function initLevel(lvl) {
    if (platforms.has(lvl)) return; 
    let l = generateLevel(lvl); 
    if (l) {
        let pl = new Platform(lvl, l); pl.w = l.w; pl.baseX = l.x; platforms.set(lvl, pl);
         if (l.hasCoin) coinsMap.set(lvl, new CoinObj(lvl, l.x + l.w/2, l.y)); if (l.hasEnemy) enemiesMap.set(lvl, new EnemyObj(lvl, l.x + l.w/2, l.y)); if (l.hasGem) gemMap.set(lvl, new GemObj(lvl, l.x + l.w/2, l.y)); if (l.item) items.set(lvl, new ItemObj(lvl, l.x + l.w/2, l.y, l.item));

    }
}
