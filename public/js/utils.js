function spawnParticles(x, y, color, amt) { for(let i=0;i<amt;i++) particles.push({ x, y, vx:(Math.random()-.5)*12, vy:(Math.random()-.5)*12, life:1, c:color, s:Math.random()*5+2, type: Math.random()>.5?'circle':'line' }); }

function floatText(x, y, text, color='#fbbf24') {
    const el = document.createElement('div'); el.className = 'float-txt'; el.textContent = text; el.style.color = color;
    el.style.left = (x + mapOffsetX) + 'px'; 
    el.style.top  = (y - camY - 30) + 'px'; document.getElementById('gameContainer').appendChild(el); setTimeout(() => el.remove(), 1200);
}
