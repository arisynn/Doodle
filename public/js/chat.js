const chatFabBtn = document.getElementById('chatFabBtn'), chatPopup  = document.getElementById('chatPopup');
chatFabBtn.onclick = () => chatPopup.classList.toggle('open');
document.querySelectorAll('.qc-btn').forEach(btn => { btn.onclick = () => { sendChat(btn.textContent); chatPopup.classList.remove('open'); }; });
document.getElementById('chatSend').onclick = () => { let v = document.getElementById('chatTxt').value.trim(); if (v) { sendChat(v); document.getElementById('chatTxt').value=''; chatPopup.classList.remove('open'); } };
document.getElementById('chatTxt').addEventListener('keypress', e => { if (e.key==='Enter') { let v = e.target.value.trim(); if (v) { sendChat(v); e.target.value=''; chatPopup.classList.remove('open'); } } });
document.addEventListener('click', e => { if (!document.getElementById('chatFab').contains(e.target)) chatPopup.classList.remove('open'); });
