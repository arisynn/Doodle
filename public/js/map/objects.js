class StarObj {
    constructor(id, x, y) { this.id = 'st_'+id; this.x = x; this.y = y-28; this.t = 0; }
    update() { this.t += 0.05; }
    draw() {
        ctx.save(); ctx.translate(this.x, this.y + Math.sin(this.t)*6); let s = 1 + Math.sin(this.t*2)*.1; ctx.scale(s,s);
        ctx.fillStyle = '#fbbf24'; ctx.strokeStyle = '#b45309'; ctx.lineWidth = 2.5; ctx.lineJoin='round'; ctx.beginPath();
        for(let i=0;i<10;i++) { let r=i%2===0?15:7; let a=(i/10)*Math.PI*2-Math.PI/2; let px=Math.cos(a)*r, py=Math.sin(a)*r; if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py); }
        ctx.closePath(); ctx.fill(); ctx.stroke(); 
        ctx.fillStyle='#fef3c7'; ctx.beginPath(); ctx.arc(-3,-3, 2,0,Math.PI*2); ctx.fill(); // Highlight kilap
        ctx.restore();
    }
}

class ItemObj {
    constructor(id, x, y, type) { this.id = 'it_'+id; this.x = x; this.y = y-32; this.type = type; this.t = 0; }
    update() { this.t += 0.08; }
    draw() {
        ctx.save(); ctx.translate(this.x, this.y + Math.sin(this.t)*6); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.lineJoin='round';
        if (this.type === 'hat') { // Baling-baling lebih detail
            ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(0,6,15,Math.PI,0); ctx.fill(); ctx.stroke(); // Topi merah
            ctx.beginPath(); ctx.moveTo(-20,6); ctx.lineTo(20,6); ctx.lineWidth=4.5; ctx.stroke(); // Lidah topi
            ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(0,-9); ctx.lineTo(0,-18); ctx.stroke(); // Tiang
            // Baling-baling muter
            let spin = Date.now()/50;
            ctx.fillStyle='#fde047'; ctx.beginPath(); ctx.ellipse(Math.cos(spin)*8, -18, 12, 4, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.fillStyle='#3b82f6'; ctx.beginPath(); ctx.ellipse(Math.cos(spin+Math.PI)*8, -18, 12, 4, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        } else if (this.type === 'rocket') { // Jetpack silver
            ctx.fillStyle = '#94a3b8'; ctx.beginPath(); ctx.moveTo(0,-16); ctx.lineTo(-10,6); ctx.lineTo(10,6); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.moveTo(0,-16); ctx.lineTo(-5,-2); ctx.lineTo(5,-2); ctx.fill(); // Tip merah
            ctx.fillStyle='#cbd5e1'; ctx.beginPath(); ctx.moveTo(-10,6); ctx.lineTo(-14,14); ctx.lineTo(-6,6); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(10,6); ctx.lineTo(14,14); ctx.lineTo(6,6); ctx.fill(); ctx.stroke();
            ctx.fillStyle='#f59e0b'; ctx.beginPath(); ctx.arc(0,6, 4,0,Math.PI*2); ctx.fill(); // Nozzle
        } else if (this.type === 'dj') { // Sayap emas estetik
            ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.ellipse(0, 0, 8, 10, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#fff'; 
            ctx.beginPath(); ctx.ellipse(-14, -2, 10, 4, -0.5, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.ellipse(-10, 4, 8, 3, -0.2, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.ellipse(14, -2, 10, 4, 0.5, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.ellipse(10, 4, 8, 3, 0.2, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        } else if (this.type === 'heart') { // Hati Kristal
            ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(-6, -2, 7, Math.PI, 0); ctx.arc(6, -2, 7, Math.PI, 0); ctx.lineTo(0, 12); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(-5, -3, 3, 5, -0.5, 0, Math.PI*2); ctx.fill(); // Highlight
        } else if (this.type === 'balloon') { // Balon detail
            ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.ellipse(0, -8, 14, 18, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.ellipse(-5, -12, 4, 8, -0.3, 0, Math.PI*2); ctx.fill(); // Highlight
            ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.moveTo(-3, 10); ctx.lineTo(3, 10); ctx.lineTo(0, 14); ctx.fill(); ctx.stroke();
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, 14); ctx.lineTo(0, 26); ctx.stroke(); // Tali
        }
        ctx.restore();
    }
}

class GemObj {
    constructor(id, x, y) { this.id = 'gem_'+id; this.x = x; this.y = y-28; this.t = 0; }
    update() { this.t += 0.05; }
    draw() {
        ctx.save(); ctx.translate(this.x, this.y + Math.sin(this.t)*6); let s = 1 + Math.sin(this.t*2)*.1; ctx.scale(s,s);
        ctx.fillStyle = '#34d399'; ctx.strokeStyle = '#059669'; ctx.lineWidth = 2.5; ctx.lineJoin='round'; ctx.beginPath();
        // Draw a diamond shape
        ctx.moveTo(0, -12);
        ctx.lineTo(10, 0);
        ctx.lineTo(0, 12);
        ctx.lineTo(-10, 0);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        
        ctx.fillStyle='#a7f3d0'; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(6, -1); ctx.lineTo(-6, -1); ctx.closePath(); ctx.fill(); // Highlight
        ctx.restore();
    }
}

class CoinObj {
    constructor(id, x, y) { this.id = 'coin_'+id; this.x = x; this.y = y-28; this.t = 0; }
    update() { this.t += 0.05; }
    draw() {
        ctx.save(); ctx.translate(this.x, this.y + Math.sin(this.t)*6); let s = 1 + Math.sin(this.t*2)*.1; ctx.scale(s,s);
        ctx.fillStyle = '#fde047'; ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 2.5; ctx.lineJoin='round'; ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI*2);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle='#ca8a04'; ctx.font='bold 14px Nunito'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('C', 0, 1);
        ctx.restore();
    }
}
