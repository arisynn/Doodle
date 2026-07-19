// ── ABLY MULTIPLAYER ──
let ably, chan;
function connectAbly(name) {
    if (ably) { try { ably.close(); } catch(e){} }
    try {
        ably = new Ably.Realtime({ key: ABLY_KEY, clientId: myId }); 
        chan = ably.channels.get('doodle-mmo-public-v2'); 
        chan.presence.subscribe(() => { /* Abaikan kehadiran default Ably, kita pakai Sync Timeout agar akurat */ });
        
        chan.subscribe('sync', msg => {
            if (msg.clientId === myId) return; 
            let d = msg.data, id = msg.clientId, now = Date.now();
            if (!peers[id]) peers[id] = { buffer: [], chatTimer: 0, chatMsg: '', lastSeen: now, x: d.x, y: d.y };
            
            peers[id].buffer.push({
                t: now, x: d.x, y: d.y, vx: d.vx, vy: d.vy,
                idl: d.idl, c: d.c, ct: d.ct||'doodle', n: d.n, sx: d.sx, sy: d.sy,
                f: d.f, fly: d.fly, rocket: d.rocket, dj: d.dj, bl: d.bl,
                s: d.s, fl: d.fl, ht: d.ht
            });

            if (peers[id].buffer.length > 8) peers[id].buffer.shift();
            peers[id].lastSeen = now;
        });

        chan.subscribe('chat', msg => {
            if (msg.clientId === myId) { p.chatMsg = msg.data.t; p.chatTimer = 160; }
            else if (peers[msg.clientId]) { peers[msg.clientId].chatMsg = msg.data.t; peers[msg.clientId].chatTimer = 160; }
        });
        chan.subscribe('die', msg => {
            if (peers[msg.clientId]) delete peers[msg.clientId];
        });
        chan.presence.enter({ name });
    } catch(e) {}
}

function publishSync() {
    if (!chan || gameState === 'MENU') return;
    let isFallingLocal = p.isFreeFalling || p.vy > 8; 
    chan.publish('sync', {
        x: p.x, y: p.y, vx: parseFloat(p.vx.toFixed(2)), vy: parseFloat(p.vy.toFixed(2)), idl: p.isIdle,
        c: playerColor, ct: playerType, skin: (window.characterManager ? window.characterManager.selectedSkin : 'default'), n: playerName, sx: parseFloat(p.scaleX.toFixed(2)), sy: parseFloat(p.scaleY.toFixed(2)), f: p.facing,
        fly: p.flyTimer>0, rocket: p.rocketTimer>0, dj: p.djTimer>0, bl: p.balloonTimer>0,
        s: currentMeters, fl: isFallingLocal, ht: p.hurtTimer>0
    });
}
function sendChat(t) { if (!t) return; if (chan) chan.publish('chat', { t }); else { p.chatMsg = t; p.chatTimer = 160; } }

setInterval(() => { 
    publishSync(); 
    let now = Date.now(); 
    let activeCount = 1; // Dirimu sendiri
    for (let id in peers) {
        if (now - peers[id].lastSeen > 4000) delete peers[id]; 
        else activeCount++;
    }
    // Update total hitungan player asli yang sync
    let onlineEl = document.getElementById('onlineCnt');
    if(onlineEl) onlineEl.textContent = activeCount;
}, 40); 
setInterval(() => { if (gameState === 'PLAY' && currentMeters > lastSubmittedScore + 5) { lastSubmittedScore = currentMeters; lbSubmit(playerName, highScore); } }, 3000);
