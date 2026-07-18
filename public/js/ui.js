function updateLiveTopUI() {
    let allPlayers = [{ n: playerName, s: currentMeters }];
    for (let id in peers) allPlayers.push({ n: peers[id].buffer.length ? peers[id].buffer[peers[id].buffer.length-1].n : '', s: peers[id].buffer.length ? peers[id].buffer[peers[id].buffer.length-1].s : 0 });
    allPlayers.sort((a,b) => b.s - a.s); 
    let top5 = allPlayers.slice(0, 5);
    
    let listRows = document.getElementById('liveTopListRows');
    if (listRows) {
        listRows.innerHTML = top5.map((p, i) => `
            <div class="lb-row" style="display:flex; justify-content:space-between; margin-bottom: 4px;">
                <div style="display:flex; gap:6px;">
                    <span class="lb-rank" style="font-size:0.85rem; font-weight:900; color:#d97706;">#${i+1}</span>
                    <span class="lb-name" style="font-size:0.85rem; color:#1e293b; max-width:80px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escHtml(p.n)}</span>
                </div>
                <span class="lb-score" style="font-size:0.9rem; color:#b45309; font-weight:900;">${p.s}m</span>
            </div>
        `).join('');
    }
}

// ── UI INTERACTIONS ──
let lbToggleBtn = document.getElementById('lbToggle');
if (lbToggleBtn) {
    lbToggleBtn.onclick = () => { 
        let p = document.getElementById('lbPanel');
        if(p) {
            if (p.style.display === 'none' || p.style.display === '') {
                p.style.display = 'flex';
                p.style.flexDirection = 'column';
                p.style.animation = 'popIn 0.3s ease';
            } else {
                p.style.display = 'none';
            }
        }
    };
}
