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
        ctx.save(); ctx.translate(this.x, this.y + Math.sin(this.t)*6);
        let img = new Image();
        if (this.type === 'hat') img.src = 'assets/powerups/propellerhat.png';
        else if (this.type === 'superjump') img.src = 'assets/powerups/superjump.png';
        else if (this.type === 'dj') img.src = 'assets/powerups/doublejump.png';
        else if (this.type === 'balloon' || this.type === 'slowfall') img.src = 'assets/powerups/slowfall.png';
        else if (this.type === 'shield') img.src = 'assets/powerups/shield.png';
        else if (this.type === 'extralife' || this.type === 'heart') img.src = 'assets/powerups/extralife.png';
        else if (this.type === 'magnet') img.src = 'assets/powerups/magnet.png';
        
        
        
        if (img.src) {
            ctx.drawImage(img, -20, -20, 40, 40);
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

class EnemyObj {
    constructor(id, x, y) { this.id = 'enemy_'+id; this.x = x; this.y = y-20; this.t = 0; this.type = Math.random() > 0.5 ? 'bat' : 'slime'; this.vx = (Math.random() > 0.5 ? 1 : -1) * 1.5; }
    update() { 
        this.t += 0.1; 
        if (this.type === 'bat') {
            this.x += this.vx;
            this.y += Math.sin(this.t) * 2; // hover
            if (this.x < 0 || this.x > MAP_W) this.vx *= -1;
        } else {
            // Slime moves slightly
            this.x += Math.sin(this.t * 0.5) * 1;
        }
    }
    draw() {
        ctx.save(); 
        ctx.translate(this.x, this.y);
        
        if (this.type === 'bat') {
            ctx.fillStyle = '#1e293b'; // dark blue/gray
            ctx.beginPath();
            ctx.arc(0, 0, 12, 0, Math.PI*2);
            ctx.fill();
            
            // Wings
            ctx.fillStyle = '#0f172a';
            let wingOffset = Math.sin(this.t * 2) * 10;
            ctx.beginPath();
            ctx.moveTo(-10, 0); ctx.lineTo(-25, wingOffset); ctx.lineTo(-10, 8); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(10, 0); ctx.lineTo(25, wingOffset); ctx.lineTo(10, 8); ctx.fill();
            
            // Eyes
            ctx.fillStyle = '#ef4444';
            ctx.beginPath(); ctx.arc(-4, -2, 3, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(4, -2, 3, 0, Math.PI*2); ctx.fill();
        } else {
            // Slime
            ctx.fillStyle = '#a3e635'; // light green
            ctx.scale(1 + Math.sin(this.t)*0.1, 1 - Math.sin(this.t)*0.1);
            ctx.beginPath();
            ctx.arc(0, 10, 15, Math.PI, 0); // half circle
            ctx.closePath();
            ctx.fill();
            
            // Eyes
            ctx.fillStyle = '#1e293b';
            ctx.beginPath(); ctx.arc(-5, 5, 3, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(5, 5, 3, 0, Math.PI*2); ctx.fill();
        }
        
        ctx.restore();
    }
}
