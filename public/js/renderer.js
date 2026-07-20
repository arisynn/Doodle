function loop() {
    requestAnimationFrame(loop); ctx.clearRect(0,0,W,H);

    // Ambient Menu Particles
    if (gameState === 'MENU') {
        if(Math.random() < 0.1) {
            particles.push({x: Math.random() * W, y: H + 10, vx: (Math.random()-0.5)*0.5, vy: -(Math.random()*1+0.5), life: 1, c: '#e2e8f0', s: Math.random()*3+1, type: 'circle'});
        }
        for (let i=particles.length-1;i>=0;i--) {
            let pt=particles[i]; pt.x+=pt.vx; pt.y+=pt.vy; pt.life-=.005;
            if (pt.life<=0) { particles.splice(i,1); continue; }
            ctx.globalAlpha=pt.life * 0.5; ctx.fillStyle=pt.c; ctx.beginPath();
            ctx.arc(pt.x,pt.y,pt.s,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
        }
        // Draw character idle in center maybe?
        return;
    }


    let heightRatio = Math.min(1, currentMeters / 1000); 
    let r1 = Math.floor(224 - (224 - 15) * heightRatio); 
    let g1 = Math.floor(231 - (231 - 23) * heightRatio);
    let b1 = Math.floor(255 - (255 - 42) * heightRatio);
    let r2 = Math.floor(248 - (248 - 30) * heightRatio); 
    let g2 = Math.floor(250 - (250 - 27) * heightRatio);
    let b2 = Math.floor(252 - (252 - 75) * heightRatio);
    let gc = document.getElementById('gameContainer'); if(gc) gc.style.background = `linear-gradient(180deg, rgb(${r1},${g1},${b1}) 0%, rgb(${r2},${g2},${b2}) 100%)`;

    p.oldY = p.y; p.expressionTimer++; 
    if (p.chatTimer > 0) p.chatTimer--;
    if (p.hurtTimer > 0) p.hurtTimer--; 
    
    // HUD POWER BAR 
    const pwrCon = document.getElementById('powerBar'), pwrFill = document.getElementById('powerFill');
    if (p.flyTimer > 0) { if (pwrCon) pwrCon.style.display='block'; if (pwrFill) { pwrFill.style.width=(p.flyTimer/150*100)+'%'; pwrFill.style.background='#60a5fa'; } }
    else if (p.djTimer > 0) { if (pwrCon) pwrCon.style.display='block'; if (pwrFill) { pwrFill.style.width=(p.djTimer/600*100)+'%'; pwrFill.style.background='#fde047'; } }
    else if (p.balloonTimer > 0) { if (pwrCon) pwrCon.style.display='block'; if (pwrFill) { pwrFill.style.width=(p.balloonTimer/400*100)+'%'; pwrFill.style.background='#f43f5e'; } }
    else if (p.starCharges > 0) { if (pwrCon) pwrCon.style.display='block'; if (pwrFill) { pwrFill.style.width='100%'; pwrFill.style.background='#fbbf24'; } }
    else { if (pwrCon) pwrCon.style.display = 'none'; }

    let hc = document.getElementById('heartContainer'); if(hc) hc.style.display = p.hasHeart ? 'flex' : 'none';

    currentMeters = Math.max(0, Math.floor((GROUND_Y - p.y) / 50));
    if (gameState === 'PLAY' && currentMeters > highScore) { 
        highScore = currentMeters; document.getElementById('highScoreVal').textContent = highScore + 'm'; 
        localStorage.setItem('doodle_hs_m12', highScore); 
    }
    
    if (displayScore < currentMeters) displayScore = currentMeters; 
    else if (displayScore > currentMeters) { displayScore -= Math.max(1, (displayScore - currentMeters) * 0.08); if (displayScore < currentMeters) displayScore = currentMeters; }
    document.getElementById('scoreVal').textContent = Math.floor(displayScore) + 'm';

    // LOGIKA FISIKA
    TERMINAL_V = (p.balloonTimer > 0 && p.vy > 0) ? 4 : 18; 

    if (p.flyTimer > 0) { p.flyTimer--; p.vy = FLY_FORCE; }
    else { p.vy += GRAVITY; if (p.vy > TERMINAL_V) p.vy = TERMINAL_V; }
    
    if (p.djTimer > 0) p.djTimer--;
    if (p.balloonTimer > 0) p.balloonTimer--;

    let targetVx = 0;
    
    // Logika Jungkat-Jungkit Platform Es & Sliding (Gaya Geser)
    for (let [k, pl] of platforms) {
        if (pl.type === 'icy') {
            if (p.currentPlatform === pl && p.isIdle && !p.isFreeFalling) {
                let center = pl.x + pl.w / 2;
                let offset = p.x - center;
                let maxTilt = 0.35; // Maksimal sudut kemiringan (Radian)
                let targetTilt = (offset / (pl.w / 2)) * maxTilt;
                pl.tilt += (targetTilt - pl.tilt) * 0.15; // Halus miringnya
                
                // Beri gaya geser ke karakter
                p.vx += Math.sin(pl.tilt) * 2.5; 
            } else {
                pl.tilt += (0 - pl.tilt) * 0.05; // Balik ke datar kalau gak diinjak
            }
        }
    }

    if (p.isIdle) {
        // Jangan paksa p.vx = 0 kalau di es (biar dia bisa merosot)
        if (!p.currentPlatform || p.currentPlatform.type !== 'icy') {
            p.vx = 0; 
        }
        p.vy = 0; 
        
        if (p.currentPlatform) {
            let pl = p.currentPlatform;
            if (pl.type === 'conveyor') {
                p.x += pl.dir * 2.5;
                p.platOffsetX = p.x - pl.x;
            }
            if (pl.type === 'updown') {
                p.y = pl.y; // Ikut naik turun
            }
            if (pl.type === 'fragile' && pl.broken) {
                p.isIdle = false; p.currentPlatform = null; // Jatuh karena kayunya hancur
            }
            
            // Jatuh jika melewati batas ujung platform
            let pwidth = 16;
            if (p.currentPlatform && (p.x + pwidth < pl.x || p.x - pwidth > pl.x + pl.w)) {
                p.isIdle = false; p.currentPlatform = null;
            }
        }

        if (p.isIdle && (keys.left || keys.right)) { 
            p.isIdle = false; 
            let pl = p.currentPlatform;
            p.currentPlatform = null; 
            let f = p.starCharges > 0 ? BOOST_FORCE : JUMP_FORCE;
            if (p.starCharges > 0) { p.starCharges--; spawnParticles(p.x, p.y, '#fbbf24', 25); floatText(p.x, p.y, 'SUPER JUMP!', '#f59e0b'); }
            p.vy = f;

            if (pl && pl.type === 'fragile') {
                pl.broken = true; pl.isCracking = false; pl.restoreTimer = 150;
                spawnParticles(pl.x + pl.w/2, pl.y, '#f59e0b', 15);
            }
        }
    } else {
        if (keys.left) { targetVx = -MOVE_SPEED; p.facing = 'left'; }
        else if (keys.right) { targetVx = MOVE_SPEED; p.facing = 'right'; }
        
        // Sedikit licin di es saat melayang di atasnya
        let friction = (p.currentPlatform && p.currentPlatform.type === 'icy') ? 0.05 : 0.3;
        p.vx += (targetVx - p.vx) * friction;
    }

    p.x += p.vx; p.y += p.vy;
    if (p.x < -25) p.x = MAP_W+25; else if (p.x > MAP_W+25) p.x = -25;

    // ── ANIMASI SQUASH/STRETCH DIHALUSKAN SANGAT MINIMAL ──
    let targetSx = 1, targetSy = 1;
    if (p.isIdle) {
        p.idleBreath += 0.08;
        let bX = (playerType==='jelly')?0.03:(playerType==='slime')?0.02:0.01;
        let bY = (playerType==='jelly')?0.02:(playerType==='slime')?0.015:0.005;
        targetSx = 1 + Math.sin(p.idleBreath) * bX;
        targetSy = 1 - Math.sin(p.idleBreath) * bY;
    }
    p.scaleX += (targetSx - p.scaleX) * 0.3;
    p.scaleY += (targetSy - p.scaleY) * 0.3;

    // Kematian & Penyelamat
    if (gameState === 'PLAY' && p.y > camY + H + 50 && !p.isFreeFalling) {
        if (p.hasHeart) {
            p.hasHeart = false; p.vy = -45; p.y = camY + H - 10;
            spawnParticles(p.x, p.y, '#ef4444', 30);
            p.chatMsg = 'Untung ada nyawa!'; p.chatTimer = 100; if(chan) chan.publish('chat', {t: p.chatMsg});
            floatText(p.x, p.y, 'PENYELAMATAN!', '#ef4444');
        } else {
            p.chatMsg = 'AAAAAA!!!'; p.chatTimer = 100; if (chan) chan.publish('chat',{t:'AAAAAA!!!'});
            
            lbSubmit(playerName, highScore);
            
            
                        if (window.updateGameStats) {
                window.updateGameStats(currentRunJumps, currentMeters);
                let totalRunCoins = Math.floor(currentMeters / 10) + (p.collectedCoins || 0);
                let runCoins = totalRunCoins - (window.rewardedCoinsThisRun || 0);
                if (runCoins > 0 && window.addCoins) {
                    window.addCoins(runCoins);
                    window.rewardedCoinsThisRun = totalRunCoins;
                }
                if (window.showGameOver) {
                    window.showGameOver(currentMeters, totalRunCoins);
                }
                currentRunJumps = 0; // reset for next run
            }

        }
    }

    // Hantam Tanah (Ground Impact)
    if (p.y >= GROUND_Y) {
        p.y = GROUND_Y;
        if (p.vy > 0) {
            if (!keys.left && !keys.right) { 
                p.isIdle = true; p.currentPlatform = null; p.idleBreath = 0; p.platOffsetX = 0; p.vy = 0; p.vx = 0; p.hasDJ = true;
            } else { p.vy = JUMP_FORCE; p.hasDJ = true; }
            spawnParticles(p.x, p.y+5, '#e2e8f0', 5);
        }
    }

    // KAMERA
    if (p.isFreeFalling) { 
        camY += ((p.y - H/2) - camY) * 0.15; 
    } else if (gameState === 'PLAY') { 
        let tCam = p.y - H*.52; 
        if (tCam < camY) {
            camY += (tCam-camY)*.22; 
        } else if (p.currentPlatform && p.currentPlatform.type === 'updown') {
            // Biarkan kamera ngikut turun agar tidak mati saat platform turun kebawah layar
            let limitCam = p.y - H*.65;
            if (camY < limitCam) camY += (limitCam - camY) * 0.15;
        }
    }

    let maxCamY = GROUND_Y - H + 20; if (camY > maxCamY) camY = maxCamY;

    let topLvl = Math.floor((GROUND_Y - camY + H) / PLAT_GAP) + 6; 
    let botLvl = Math.max(0, Math.floor((GROUND_Y - (camY+H)) / PLAT_GAP) - 3);
    for (let l=botLvl; l<=topLvl; l++) initLevel(l);
    for (let [k,v] of platforms) if (k>0 && (k<botLvl-8||k>topLvl+8)) { platforms.delete(k); gemMap.delete(k); coinsMap.delete(k); items.delete(k); enemiesMap.delete(k); }

    updateLiveTopUI(); 
    ctx.save(); ctx.translate(mapOffsetX, -camY);

    for (let [k,pl] of platforms) { pl.update(); pl.draw(); }

    if (gameState === 'PLAY') {
        if (!p.isFreeFalling) {

            if (p.magnetTimer > 0) {
                p.magnetTimer--;
                if (p.magnetTimer % 10 === 0) {
                    spawnParticles(p.x, p.y - 20, '#fde047', 2);
                }
            }

            
            for (let [k,en] of enemiesMap) {
                en.update(); en.draw();
                if (p.hurtTimer <= 0 && Math.abs(p.x - en.x) < 30 && Math.abs(p.y - en.y) < 30) {
                    if (p.hasHeart || p.flyTimer > 0 || p.starCharges > 0) {
                        p.hasHeart = false;
                        p.hurtTimer = 60;
                        p.vy = JUMP_FORCE;
                        spawnParticles(p.x, p.y, '#ef4444', 20);
                        floatText(p.x, p.y, 'KEBAL!', '#fff');
                        enemiesMap.delete(k); // kill enemy
                    } else if (p.vy > 0 && p.y < en.y - 10) {
                        // bounce on enemy
                        p.vy = JUMP_FORCE;
                        spawnParticles(en.x, en.y, '#a3e635', 15);
                        enemiesMap.delete(k);
                    } else {
                        if(window.showGameOver) window.showGameOver(currentMeters, Math.floor(currentMeters / 10));
                    }
                }
            }

            for (let [k,c] of coinsMap) {
                if (p.collectedLoot.has(c.id) && Date.now() - p.collectedLoot.get(c.id) < 5000) continue;
                
                if (p.magnetTimer > 0) {
                    let dx = p.x - c.x;
                    let dy = p.y - c.y;
                    let dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < 150) {
                        c.x += dx * 0.1;
                        c.y += dy * 0.1;
                    }
                }
                
                c.update();
                
                if (Math.abs(p.x - c.x) < 30 && Math.abs(p.y - c.y) < 30) {
                    p.collectedLoot.set(c.id, Date.now());
                    spawnParticles(c.x, c.y, '#fde047', 15);
                    p.collectedCoins = (p.collectedCoins || 0) + 1;
                    if (window.addCoins) window.addCoins(1);
                    window.rewardedCoinsThisRun = (window.rewardedCoinsThisRun || 0) + 1;
                }
            }
            for (let [k,gm] of gemMap) {
                if (p.collectedLoot.has(gm.id) && Date.now() - p.collectedLoot.get(gm.id) < 5000) continue;
                
                if (p.magnetTimer > 0) {
                    let dx = p.x - gm.x;
                    let dy = p.y - gm.y;
                    let dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < 150) {
                        gm.x += dx * 0.1;
                        gm.y += dy * 0.1;
                    }
                }
                
                gm.update(); gm.draw();
                if (Math.abs(p.x-gm.x)<35 && Math.abs(p.y-gm.y)<35) { 
                    p.collectedLoot.set(gm.id, Date.now()); 
                    gems_collected = (typeof gems_collected !== 'undefined' ? gems_collected : 0) + 1;
                    spawnParticles(gm.x, gm.y, '#34d399', 15); floatText(gm.x, gm.y, '+1 GEM', '#059669');
                    // Add gem to user
                    playerGems += 1;
                    saveUserData();
                }
            }
            for (let [k,it] of items) {
                if (p.collectedLoot.has(it.id) && Date.now() - p.collectedLoot.get(it.id) < 5000) continue;
                it.update(); it.draw();
                if (p.flyTimer <= 0 && 0 <= 0) {
                    if (Math.abs(p.x-it.x)<38 && p.y>it.y-38 && p.y<it.y+25) {
                        p.collectedLoot.set(it.id, Date.now()); spawnParticles(it.x, it.y, '#fff', 20);
                        if (it.type==='hat') { p.flyTimer=150 + (powerupLevels && powerupLevels['hat'] ? powerupLevels['hat'] : 1) * 30; floatText(it.x,it.y,'TERBANG!','#60a5fa'); } 
                        if (it.type==='superjump') { p.starCharges=3 + (powerupLevels && powerupLevels['superjump'] ? powerupLevels['superjump'] : 1); floatText(it.x,it.y,'SUPER JUMP!','#fbbf24'); }
                        if (it.type==='dj') { p.djTimer=600 + (powerupLevels && powerupLevels['dj'] ? powerupLevels['dj'] : 1) * 100; p.hasDJ=true; floatText(it.x,it.y,'DOUBLE JUMP!','#fde047'); }
                        if (it.type==='heart' || it.type==='extralife') { p.hasHeart=true; floatText(it.x,it.y,'EXTRA LIFE!','#ef4444'); }
                        if (it.type==='balloon' || it.type==='slowfall') { p.balloonTimer=400 + (powerupLevels && powerupLevels['balloon'] ? powerupLevels['balloon'] : 1) * 50; floatText(it.x,it.y,'SLOW FALL!','#f43f5e'); }
                        if (it.type==='shield') { p.hurtTimer=500 + (powerupLevels && powerupLevels['shield'] ? powerupLevels['shield'] : 1) * 60; floatText(it.x,it.y,'SHIELD!','#a855f7'); }
                        if (it.type==='magnet') { p.magnetTimer=600 + (powerupLevels && powerupLevels['magnet'] ? powerupLevels['magnet'] : 1) * 70; floatText(it.x,it.y,'MAGNET!','#f43f5e'); }
                                            }
                }
            }
        } else {
            for (let [k,en] of enemiesMap) en.draw();
            for (let [k,c] of coinsMap) if(!(p.collectedLoot.has(c.id) && Date.now()-p.collectedLoot.get(c.id)<5000)) c.draw();
            for (let [k,gm] of gemMap) if(!(p.collectedLoot.has(gm.id) && Date.now()-p.collectedLoot.get(gm.id)<5000)) gm.draw();
                        for (let [k,it] of items) if(!(p.collectedLoot.has(it.id) && Date.now()-p.collectedLoot.get(it.id)<5000)) it.draw();
        }
    }

    // Cek Pijakan Platform
    if (gameState === 'PLAY' && p.vy > 0 && p.flyTimer<=0 && 0<=0 && !p.isIdle && !p.isFreeFalling) {
        for (let [k,pl] of platforms) {
            if (pl.broken || !pl.isSolid || pl.y > camY + H + 10) continue; 
            
            let rx = pl.x;
            // Kalkulasi Hitbox Permukaan Miring Untuk Icy
            let hitY = pl.y;
            if (pl.type === 'icy' && pl.tilt !== 0) {
                hitY = pl.y + Math.tan(pl.tilt) * (p.x - (rx + pl.w/2));
            }

            if (p.x+16 > rx && p.x-16 < rx+pl.w && p.oldY <= hitY+15 && p.y >= hitY-10) {
                p.y = hitY; p.hasDJ = true;

                if (pl.type==='spike') {
                    if (p.hurtTimer <= 0) {
                        if (p.hasHeart) {
                            p.hasHeart = false; p.hurtTimer = 60; p.vy = JUMP_FORCE; spawnParticles(p.x, p.y, '#ef4444', 20);
                            floatText(p.x, p.y, 'KEBAL!', '#fff');
                        } else {
                            if(window.showGameOver) window.showGameOver(currentMeters, Math.floor(currentMeters / 10)); break;
                        }
                    } else {
                        p.vy = JUMP_FORCE;
                    }
                    break;
                }
                if (pl.type==='portal') { spawnParticles(p.x, p.y, '#a855f7', 20); p.y -= 1000; camY -= 1000; p.vy = JUMP_FORCE; break; }
                if (pl.type==='bumper') { p.vy = BUMPER_FORCE; p.vx = (p.x < rx+pl.w/2) ? -16 : 16; spawnParticles(p.x,p.y,'#f0abfc',12); pl.bounceAnim=15; break; }
                if (pl.type==='fragile') {
                    if (!pl.isCracking) { pl.isCracking = true; pl.crackTimer = 45; } // Retak dalam ~0.75 detik
                    if (!keys.left && !keys.right) {
                        p.isIdle=true; p.currentPlatform=pl; p.idleBreath=0; p.platOffsetX=p.x-pl.x; p.vy=0;
                    } else {
                        p.vy=JUMP_FORCE; pl.broken=true; pl.isCracking=false; pl.restoreTimer=150;
                        spawnParticles(rx+pl.w/2, pl.y, '#f59e0b', 15);
                    }
                    break; 
                }
                if (pl.type==='spring') { p.vy=SPRING_FORCE; pl.bounceAnim=15; spawnParticles(p.x,p.y,'#fde047',8); break; }
                if (pl.type==='trampoline') { p.vy=TRAMPOLINE_FORCE; pl.bounceAnim=15; spawnParticles(p.x,p.y,'#fca5a5',10); break; }
                
                if (!keys.left && !keys.right) { 
                    p.isIdle=true; p.currentPlatform=pl; p.idleBreath=0; p.platOffsetX = p.x - pl.x; 
                } else { 
                    p.vy=JUMP_FORCE; p.currentPlatform=pl; 
                }
                break;
            }
        }
    }

    if (p.isIdle && p.currentPlatform && p.currentPlatform.type === 'moving') { 
        p.x = p.currentPlatform.x + p.platOffsetX; 
    }

    for (let i=particles.length-1;i>=0;i--) {
        let pt=particles[i]; pt.x+=pt.vx; pt.y+=pt.vy; pt.life-=.04;
        if (pt.life<=0) { particles.splice(i,1); continue; }
        ctx.globalAlpha=pt.life; ctx.fillStyle=ctx.strokeStyle=pt.c; ctx.lineWidth=2; ctx.beginPath();
        if (pt.type==='circle') ctx.arc(pt.x,pt.y,pt.s,0,Math.PI*2); else { ctx.moveTo(pt.x,pt.y); ctx.lineTo(pt.x+pt.vx*2,pt.y+pt.vy*2); ctx.stroke(); }
        ctx.fill(); ctx.globalAlpha=1;
    }

    // MULTIPLAYER RENDER 
    let renderDelay = 80; 
    let renderTime = Date.now() - renderDelay;
    for (let id in peers) {
        let op = peers[id]; 
        
        if (op.chatTimer > 0) op.chatTimer--;

        let buf = op.buffer;
        if (!buf || buf.length === 0) continue;
        let s0 = null, s1 = null; let targetX, targetY, targetSx, targetSy;
        let refState = buf[buf.length - 1]; 
        for (let i = 0; i < buf.length - 1; i++) {
            if (buf[i].t <= renderTime && buf[i+1].t >= renderTime) { s0 = buf[i]; s1 = buf[i+1]; break; }
        }
        if (s0 && s1) {
            let ratio = (renderTime - s0.t) / (s1.t - s0.t);
            targetX = s0.x + (s1.x - s0.x) * ratio; targetY = s0.y + (s1.y - s0.y) * ratio;
            targetSx = s0.sx + (s1.sx - s0.sx) * ratio; targetSy = s0.sy + (s1.sy - s0.sy) * ratio;
            refState = s0; 
        } else {
            if (op.x === undefined) { op.x = refState.x; op.y = refState.y; }
            targetX = refState.x; targetY = refState.y;
            targetSx = refState.sx; targetSy = refState.sy;
        }
        
        op.x += (targetX - op.x) * 0.3; op.y += (targetY - op.y) * 0.3;

        let peerExprT = Math.floor(Date.now() / 16) + (id.charCodeAt(id.length-1) * 33);
        drawCharacter(op.x, op.y, refState.c||'#f8fafc', targetSx||1, targetSy||1, refState.n, refState.f||'right', refState.fly?30:0, refState.rocket?30:0, refState.dj?30:0, refState.bl?30:0, op.chatMsg||'', op.chatTimer||0, peerExprT, refState.fl, refState.ct||'doodle', refState.ht, refState.vy||0, refState.skin||'default');
    }
    
    let isFallingLocal = p.isFreeFalling || p.vy > 8;
    drawCharacter(p.x, p.y, playerColor, p.scaleX, p.scaleY, playerName, p.facing, p.flyTimer, 0, p.djTimer, p.balloonTimer, p.chatMsg, p.chatTimer, p.expressionTimer, isFallingLocal, playerType, p.hurtTimer > 0, p.vy, window.characterManager ? window.characterManager.selectedSkin : 'default');
    
    ctx.restore(); 
}
