// ── UPSTASH & LEADERBOARD ──
async function upGet(k) { try { let r = await fetch(`${UPSTASH_URL}/get/${k}`, {headers:{Authorization:`Bearer ${UPSTASH_TOKEN}`}}); let d = await r.json(); return d.result?JSON.parse(d.result):null; }catch(e){return null;} }
async function upSet(k,v) { try { await fetch(`${UPSTASH_URL}/set/${k}/${encodeURIComponent(JSON.stringify(v))}`, {headers:{Authorization:`Bearer ${UPSTASH_TOKEN}`}}); }catch(e){} }

let leaderboard = [];

function lbLocalLoad() { try { let d = localStorage.getItem(LB_KEY); if (d) leaderboard = JSON.parse(d); } catch(e) {} }
function lbLocalSave() { try { localStorage.setItem(LB_KEY, JSON.stringify(leaderboard)); } catch(e) {} }

async function lbFetch() {
    let remote = await upGet(LB_KEY);
    if (remote && Array.isArray(remote)) { leaderboard = remote.filter(e => (Date.now() - e.lastActive) < EXPIRE_MS); lbLocalSave();
    } else { lbLocalLoad(); leaderboard = leaderboard.filter(e => (Date.now() - e.lastActive) < EXPIRE_MS); }
    renderLB();
}

async function lbSubmit(name, sc) {
    let now = Date.now(); let idx = leaderboard.findIndex(e => e.name.toLowerCase() === name.toLowerCase());
    if (idx >= 0) { leaderboard[idx].lastActive = now; if (sc > leaderboard[idx].score) leaderboard[idx].score = sc; }
    else { leaderboard.push({ name, score: sc, lastActive: now }); }
    leaderboard.sort((a,b) => b.score - a.score); if (leaderboard.length > 10) leaderboard = leaderboard.slice(0, 10);
    lbLocalSave(); await upSet(LB_KEY, leaderboard); renderLB();
}

function getMedalSVG(rank) {
    const colors = ['#facc15', '#cbd5e1', '#fca5a5']; const strokes = ['#ca8a04', '#64748b', '#9a3412'];
    let c = colors[rank-1] || '#e2e8f0'; let s = strokes[rank-1] || '#94a3b8';
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="${c}" stroke="${s}" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><text x="12" y="16" font-size="12" font-family="Nunito" font-weight="900" text-anchor="middle" fill="${s}" stroke="none">${rank}</text></svg>`;
}

function renderLB() {
    const rows = document.getElementById('lbRows');
    if (!rows) return;
    rows.innerHTML = leaderboard.slice(0,10).map((e,i)=>`
        <div class="lb-row" style="display:flex; justify-content:space-between; margin-bottom: 6px;">
            <div style="display:flex; gap:6px; align-items:center;">
                <span class="lb-rank">${i<3 ? getMedalSVG(i+1) : `<span style="font-size:0.85rem;color:#94a3b8;font-weight:900;width:20px;display:inline-block;text-align:center;">${i+1}</span>`}</span>
                <span class="lb-name" style="font-weight:700; color:#1e293b; max-width:80px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escHtml(e.name)}</span>
            </div>
            <span class="lb-score" style="font-weight:900; color:#b45309;">${e.score}m</span>
        </div>`).join('');
}

function escHtml(s) { return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
