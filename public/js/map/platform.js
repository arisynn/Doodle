// ── PLATFORMS DRAWING ──
class Platform {
    constructor(lvl, data) {
        this.lvl = lvl; Object.assign(this, data);
        this.broken = false; this.fallVy = 0; this.restoreTimer = 0; this.bounceAnim = 0; this.startY = data.y;
        this.isSolid = true; this.opacity = 1;
        this.tilt = 0; // Untuk jungkat jungkit platform es
        this.isCracking = false; this.crackTimer = 0; // Timer retak platform kayu
    }
    getX() { 
        if (this.type === 'moving') {
            let maxRange = MAP_W - this.w - 20;
            return 10 + (Math.sin((Date.now() + this.lvl * 1000) / (1500 / this.speed)) * 0.5 + 0.5) * maxRange;
        }
        return this.x; 
    }
    update() {
        if (this.bounceAnim > 0) this.bounceAnim--;
        if (this.type === 'blinking') this.isSolid = (Math.floor(Date.now() / 900 + this.lvl) % 2 === 0);
        if (this.type === 'ghost') {
            this.opacity = Math.sin((Date.now() + this.lvl * 500) / 600) * 0.5 + 0.5;
            this.isSolid = this.opacity > 0.4;
        }
        if (this.type === 'moving') this.x = this.getX();
        if (this.type === 'fragile') {
            if (this.isCracking && !this.broken) {
                this.crackTimer--;
                if (this.crackTimer <= 0) {
                    this.broken = true; this.fallVy = 0; this.restoreTimer = 150;
                    spawnParticles(this.x + this.w/2, this.y, '#f59e0b', 15);
                }
            }
            if (this.broken) {
                this.fallVy += GRAVITY; this.y += this.fallVy; this.restoreTimer--;
                if (this.restoreTimer <= 0) { 
                    this.broken = false; this.isCracking = false; this.y = this.startY; this.fallVy = 0; 
                    spawnParticles(this.x + this.w/2, this.y, '#fff', 8); 
                }
            }
        }
        // PLATFORM NAIK TURUN
        if (this.type === 'updown') {
            this.y = this.startY - (Math.sin((Date.now() + this.lvl * 500) / 600) * 0.5 + 0.5) * (PLAT_GAP * 1.8);
        }
    }
    draw() {
        if (this.type === 'bumper') { this.drawBumper(); return; }
        if (this.type === 'portal') { this.drawPortal(); return; }
        
        if (this.type === 'ground') {
            ctx.save(); ctx.fillStyle = '#22c55e'; ctx.fillRect(this.x, this.y, this.w, H + 2000); 
            ctx.fillStyle = '#166534'; ctx.fillRect(this.x, this.y, this.w, 15); ctx.restore(); return;
        }

        let cx = this.x, cy = this.y, bounce = this.bounceAnim > 0 ? Math.sin((15-this.bounceAnim)/15 * Math.PI) * 5 : 0;
        ctx.save(); 
        
        // Rotasi untuk Jungkat-Jungkit Icy Platform
        if (this.type === 'icy' && this.tilt !== 0) {
            ctx.translate(cx + this.w/2, cy);
            ctx.rotate(this.tilt);
            ctx.translate(-(cx + this.w/2), -cy);
        }

        ctx.strokeStyle = INK; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        
        if (this.type === 'blinking' && !this.isSolid) ctx.globalAlpha = 0.2;
        if (this.type === 'ghost') ctx.globalAlpha = this.opacity;

        if (this.type === 'trampoline') { 
            ctx.fillStyle = '#f43f5e'; ctx.beginPath(); ctx.roundRect(cx, cy-4, this.w, 10, 4); ctx.fill(); ctx.stroke();
            ctx.strokeStyle = '#fff'; ctx.lineWidth=1; for(let i=4;i<this.w;i+=6){ ctx.beginPath(); ctx.moveTo(cx+i, cy-4); ctx.lineTo(cx+i+4, cy+6); ctx.stroke(); }
            ctx.lineWidth = 5; ctx.strokeStyle = '#e11d48'; ctx.beginPath(); ctx.moveTo(cx, cy-bounce); ctx.lineTo(cx+this.w, cy-bounce); ctx.stroke();
        } else if (this.type === 'spring') { 
            ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.roundRect(cx, cy-4, this.w, 4+bounce, 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#fff'; ctx.fillRect(cx+4,cy-2,this.w-8,1); 
            ctx.lineWidth = 3; ctx.strokeStyle = '#b45309'; let coils = Math.max(3, Math.floor(this.w / 15));
            for (let i=0;i<coils;i++) { let xp=cx+5+i*(this.w-10)/coils; ctx.beginPath(); ctx.moveTo(xp,cy-4); ctx.lineTo(xp,cy-10); ctx.stroke(); }
        } else if (this.type === 'fragile') { 
            let shakeX = (this.isCracking && !this.broken) ? (Math.random()-0.5)*4 : 0;
            let shakeY = (this.isCracking && !this.broken) ? (Math.random()-0.5)*4 : 0;
            cx += shakeX; cy += shakeY;

            ctx.fillStyle = '#d97706'; ctx.beginPath(); ctx.roundRect(cx, cy-5, this.w, 10, 3); ctx.fill(); ctx.stroke();
            ctx.lineWidth = 2; ctx.strokeStyle = '#78350f'; 
            ctx.beginPath(); ctx.moveTo(cx+this.w/2, cy-5); ctx.lineTo(cx+this.w/2-4, cy); ctx.lineTo(cx+this.w/2+2, cy+5); ctx.stroke();
            if (!this.broken) { ctx.strokeStyle = '#fcd34d'; for (let i=8;i<this.w-4;i+=14) { ctx.beginPath(); ctx.moveTo(cx+i,cy-3); ctx.lineTo(cx+i+5,cy+3); ctx.stroke(); } }
            if (this.isCracking && !this.broken) {
                ctx.strokeStyle = '#451a03'; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(cx+10, cy-5); ctx.lineTo(cx+15, cy); ctx.lineTo(cx+12, cy+5); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(cx+this.w-10, cy-5); ctx.lineTo(cx+this.w-15, cy); ctx.lineTo(cx+this.w-12, cy+5); ctx.stroke();
            }
        } else if (this.type === 'moving') { 
            ctx.fillStyle = '#3b82f6'; ctx.beginPath(); ctx.roundRect(cx, cy-5, this.w, 10, 5); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#93c5fd'; ctx.beginPath(); ctx.roundRect(cx+5, cy-2, this.w-10, 4, 2); ctx.fill();
        } else if (this.type === 'conveyor') { 
            ctx.fillStyle = '#475569'; ctx.beginPath(); ctx.roundRect(cx, cy-6, this.w, 12, 6); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#334155'; ctx.beginPath(); ctx.roundRect(cx+4, cy-2, this.w-8, 4, 2); ctx.fill();
            let offset = (Date.now() / 20 * this.speed * this.dir) % 20;
            ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2;
            for(let i=-20; i<this.w; i+=20) {
                let px = cx + i + offset; if(px > cx+4 && px < cx+this.w-4) {
                    ctx.beginPath(); ctx.moveTo(px, cy-4); ctx.lineTo(px+(this.dir*5), cy); ctx.lineTo(px, cy+4); ctx.stroke();
                }
            }
            ctx.fillStyle='#94a3b8'; ctx.beginPath(); ctx.arc(cx+6,cy, 3, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(cx+this.w-6,cy, 3, 0, Math.PI*2); ctx.fill();
        } else if (this.type === 'icy') { 
            ctx.fillStyle = '#bae6fd'; ctx.beginPath(); ctx.roundRect(cx, cy-5, this.w, 10, 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(cx+6, cy-5); ctx.lineTo(cx+16, cy-5); ctx.lineTo(cx+12, cy+5); ctx.lineTo(cx+2, cy+5); ctx.fill();
            ctx.beginPath(); ctx.moveTo(cx+26, cy-5); ctx.lineTo(cx+32, cy-5); ctx.lineTo(cx+28, cy+5); ctx.lineTo(cx+22, cy+5); ctx.fill();
            ctx.strokeStyle = '#7dd3fc'; ctx.beginPath(); ctx.moveTo(cx+this.w/2, cy+5); ctx.lineTo(cx+this.w/2-2, cy+10); ctx.lineTo(cx+this.w/2-4, cy+5); ctx.fill(); ctx.stroke();
        
        } else if (this.type === 'spike') {
            ctx.fillStyle = '#64748b';
            ctx.fillRect(-this.w/2, 0, this.w, 12);
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(-this.w/2, 0, this.w, 4);
            // Draw spikes on top
            ctx.fillStyle = '#ef4444';
            for(let sx = -this.w/2 + 5; sx < this.w/2 - 5; sx += 12) {
                ctx.beginPath();
                ctx.moveTo(sx, 0);
                ctx.lineTo(sx + 6, -10);
                ctx.lineTo(sx + 12, 0);
                ctx.fill();
            }

        } else if (this.type === 'ghost') { 
            ctx.fillStyle = '#d8b4fe'; ctx.shadowColor = '#c084fc'; ctx.shadowBlur = 10;
            ctx.beginPath(); ctx.roundRect(cx, cy-5, this.w, 10, 5); ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = '#a855f7'; ctx.stroke();
        } else if (this.type === 'updown') { 
            // Platform Mekanik Elevasi
            ctx.fillStyle = '#64748b'; ctx.beginPath(); ctx.roundRect(cx, cy-5, this.w, 10, 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#38bdf8'; 
            ctx.beginPath(); ctx.fillRect(cx + 4, cy - 2, this.w - 8, 4);
        } else { 
            ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.roundRect(cx, cy-5, this.w, 10, 5); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#86efac'; ctx.beginPath(); ctx.fillRect(cx+2, cy-5, this.w-4, 4);
            ctx.fillStyle = '#166534'; ctx.beginPath(); ctx.arc(cx+10, cy+2, 2, 0, Math.PI); ctx.arc(cx+25, cy+2, 3, 0, Math.PI); ctx.fill(); 
        }
        ctx.globalAlpha = 1; ctx.restore();
    }
    drawBumper() {
        ctx.save(); let cx = this.x + this.w/2, cy = this.y;
        ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 3;
        for (let i=0;i<2;i++) { ctx.globalAlpha = .5 + i*.4; ctx.beginPath(); ctx.arc(cx, cy, 18-i*5, 0, Math.PI*2); ctx.stroke(); }
        ctx.globalAlpha = 1; ctx.fillStyle = '#f0abfc'; ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI*2); ctx.fill(); ctx.stroke(); ctx.restore();
    }
    drawPortal() {
        ctx.save(); let cx = this.x + this.w/2, cy = this.y, spin = Date.now()/220;
        for (let i=0;i<3;i++) { ctx.strokeStyle = ['#8b5cf6','#a78bfa','#c4b5fd'][i]; ctx.lineWidth = 3.5-i*0.5; ctx.globalAlpha = .9-i*.2; ctx.beginPath(); ctx.ellipse(cx, cy, 30-i*6, 10, spin+i, 0, Math.PI*2); ctx.stroke(); }
        ctx.globalAlpha = 1; ctx.restore();
    }
}
