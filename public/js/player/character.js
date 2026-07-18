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
    
    if (facing === 'left') {
        ctx.scale(-1, 1);
    }

    let h = 38, w = 34;
    
    // Aksesoris (back)
    const INK = '#0f172a';
    if (blT > 0) {
        ctx.fillStyle='#ef4444'; ctx.strokeStyle=INK; ctx.lineWidth=2.5;
        ctx.beginPath(); ctx.moveTo(0, -h); ctx.quadraticCurveTo(-18,-h-35, 0,-h-55); ctx.quadraticCurveTo(18,-h-35, 0,-h); ctx.fill(); ctx.stroke();
        ctx.strokeStyle='#fff'; ctx.beginPath(); ctx.moveTo(0,-h); ctx.lineTo(0,-h-15); ctx.stroke();
    }
    if (rocketT > 0) {
        ctx.fillStyle='#94a3b8'; ctx.strokeStyle=INK; ctx.lineWidth=2.5;
        ctx.beginPath(); ctx.roundRect(-12, -h+10, 24, 28, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle='#ef4444'; ctx.beginPath(); ctx.moveTo(-6, -h+38); ctx.lineTo(6, -h+38); ctx.lineTo(0, -h+55); ctx.fill();
    }

    // Determine state for sprite
    let state = 'idle';
    if (rocketT > 0 || flyT > 0) {
        state = 'fly';
    } else if (isFalling || vy > 0) {
        state = 'land';
    } else if (vy < 0) {
        state = 'jump';
    }

    
    
    let sprite = null;
    if (window.characterManager) {
        sprite = window.characterManager.getSprite(state, skinId);
    }


    
    if (sprite && sprite.complete && sprite.naturalWidth > 0) {
        // Draw image skin
        let frameCount = 4;
        let frameW = sprite.naturalWidth / frameCount;
        let frameH = sprite.naturalHeight;
        
        // Use an animation speed, e.g. 100ms per frame
        let frameSpeed = 100; 
        
        // To make it look right even if not all frames are filled (just in case), we bound it
        let currentFrame = Math.floor(Date.now() / frameSpeed) % frameCount;
            
        // If image is just 1x1 placeholder, draw a colored box as fallback
        if (sprite.naturalWidth <= 1 && sprite.naturalHeight <= 1) {
            ctx.fillStyle = color;
            ctx.fillRect(-w/2, -h, w, h);
            ctx.strokeRect(-w/2, -h, w, h);
        } else {
            // Assume sprites are anchored at bottom center (0, 0) relative to translation
            ctx.drawImage(sprite, currentFrame * frameW, 0, frameW, frameH, -frameW/2, -frameH, frameW, frameH);
        }
    } else {
        // Fallback drawing if not loaded
        ctx.fillStyle = color;
        ctx.fillRect(-w/2, -h, w, h);
        ctx.strokeRect(-w/2, -h, w, h);
    }

    // Aksesoris (front)
    if (flyT > 0) {
        ctx.fillStyle='#38bdf8'; ctx.strokeStyle=INK; ctx.lineWidth=2.5;
        ctx.beginPath(); ctx.moveTo(0, -h-5); ctx.lineTo(-15, -h-15); ctx.lineTo(15, -h-15); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    if (djT > 0) {
        ctx.fillStyle='#fbbf24'; ctx.strokeStyle=INK; ctx.lineWidth=2;
        ctx.beginPath(); ctx.arc(0, -h-10, 10, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    }
    
    ctx.restore();
}
