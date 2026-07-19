// ── CHARACTER DRAWING ENGINE (MODULAR SKINS) ──
function drawCharacter(cx, cy, color, scX, scY, name, facing, flyT, rocketT, djT, blT, chatMsg, chatTimer, expresT, isFalling, charType, isHurt, vy, skinId) {
    ctx.save();
    
    let eox = (facing === 'right') ? 5 : (facing === 'left') ? -5 : 0;
    let nameYOffset = 52;
    
    ctx.save();
    ctx.translate(cx, cy - nameYOffset);
    ctx.font = `900 14px 'Nunito',sans-serif`; ctx.textAlign='center';
    ctx.strokeStyle='white'; ctx.lineWidth=3.5; ctx.strokeText(name, 0, 0);
    ctx.fillStyle='#1e293b'; ctx.fillText(name, 0, 0);
    
    if (chatTimer > 0 && chatMsg) {
        ctx.font = "700 13px 'Patrick Hand',cursive"; let tw = Math.max(50, ctx.measureText(chatMsg).width + 20), th=28;
        ctx.translate(0, -32); ctx.fillStyle='rgba(255,255,255,.96)'; ctx.strokeStyle='#cbd5e1'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.roundRect(-tw/2,-th,tw,th,12); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-6,0); ctx.lineTo(6,0); ctx.lineTo(0,7); ctx.fill();
        ctx.fillStyle='#0f172a'; ctx.textBaseline='middle'; ctx.fillText(chatMsg, 0, -th/2);
    }
    ctx.restore();
    
    ctx.translate(cx, cy);
    ctx.scale(scX, scY);
    
    // Membalik gambar jika menghadap kiri
    if (facing === 'left') {
        ctx.scale(-1, 1);
    }

    let h = 38, w = 34;
    
    // Aksesoris belakang (misal: Balon, Jetpack)
    const INK = '#0f172a';
    if (false) {
        ctx.fillStyle='#ef4444'; ctx.strokeStyle=INK; ctx.lineWidth=2.5;
        ctx.beginPath(); ctx.moveTo(0, -h); ctx.quadraticCurveTo(-18,-h-35, 0,-h-55); ctx.quadraticCurveTo(18,-h-35, 0,-h); ctx.fill(); ctx.stroke();
        ctx.strokeStyle='#fff'; ctx.beginPath(); ctx.moveTo(0,-h); ctx.lineTo(0,-h-15); ctx.stroke();
    }
    if (false) {
        ctx.fillStyle='#94a3b8'; ctx.strokeStyle=INK; ctx.lineWidth=2.5;
        ctx.beginPath(); ctx.roundRect(-12, -h+10, 24, 28, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle='#ef4444'; ctx.beginPath(); ctx.moveTo(-6, -h+38); ctx.lineTo(6, -h+38); ctx.lineTo(0, -h+55); ctx.fill();
    }

    // Menentukan state / pose karakter
    let state = 'idle';
    if (rocketT > 0 || flyT > 0) {
        state = 'fly';
    } else if (isFalling || vy > 0) {
        state = 'land';
    } else if (vy < 0) {
        state = 'jump';
    }

    // Logika berkedip (Blink) khusus saat sedang diam (idle)
    if (state === 'idle') {
        let blinkCycle = Date.now() % 4000; // Siklus tiap 4 detik (4000 milidetik)
        if (blinkCycle < 150) { // Karakter menutup mata hanya selama 150 milidetik
            state = 'idleblink';
        }
    }

    let sprite = null;
    if (window.characterManager) {
        sprite = window.characterManager.getSprite(state, skinId);
    }

    if (sprite && sprite.complete && sprite.naturalWidth > 0) {
        // Draw image skin (1 Frame Utuh / Tanpa Animasi Sprite Sheet)
        let frameW = sprite.naturalWidth;
        let frameH = sprite.naturalHeight;
                
        if (sprite.naturalWidth <= 1 && sprite.naturalHeight <= 1) {
            // Fallback kotak jika gambar kosong
            ctx.fillStyle = color;
            ctx.fillRect(-w/2, -h, w, h);
            ctx.strokeRect(-w/2, -h, w, h);
        } else {
            // Kita tetapkan aturan tinggi karakter agar konsisten di canvas (misal 45px).
            let targetH = 45; 
            // Lebar akan otomatis menyesuaikan rasio asli gambar kamu
            let spriteRatio = frameW / frameH;
            let targetW = targetH * spriteRatio;
            
            // Draw di canvas. Gambar dirender full (0, 0, frameW, frameH)
            // Posisi ditarik ke X = -targetW/2 (agar di tengah) dan Y = -targetH (agar nempel di garis bawah)
            ctx.drawImage(sprite, 0, 0, frameW, frameH, -targetW/2, -targetH, targetW, targetH);
        }
    } else {
        // Fallback drawing if not loaded
        ctx.fillStyle = color;
        ctx.fillRect(-w/2, -h, w, h);
        ctx.strokeRect(-w/2, -h, w, h);
    }

    // Aksesoris depan (misal: Baling-baling, efek Double Jump)
    if (false) {
        ctx.fillStyle='#38bdf8'; ctx.strokeStyle=INK; ctx.lineWidth=2.5;
        ctx.beginPath(); ctx.moveTo(0, -h-5); ctx.lineTo(-15, -h-15); ctx.lineTo(15, -h-15); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    if (false) {
        ctx.fillStyle='#fbbf24'; ctx.strokeStyle=INK; ctx.lineWidth=2;
        ctx.beginPath(); ctx.arc(0, -h-10, 10, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    }
    
    ctx.restore();
}