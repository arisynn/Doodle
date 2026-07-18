// -- PERBAIKAN TRIGGER DOUBLE JUMP DI TOUCH ZONES --
document.getElementById('tzL').addEventListener('touchstart',e=>{
    if(gameState==='PLAY'){
        e.preventDefault(); keys.left=true; p.facing='left';
        if (!p.isIdle && p.djTimer > 0 && p.hasDJ) triggerJump();
    }
},{passive:false});
document.getElementById('tzL').addEventListener('touchend',  e=>{if(gameState==='PLAY'){e.preventDefault();keys.left=false;}},{passive:false});
document.getElementById('tzR').addEventListener('touchstart',e=>{
    if(gameState==='PLAY'){
        e.preventDefault(); keys.right=true; p.facing='right';
        if (!p.isIdle && p.djTimer > 0 && p.hasDJ) triggerJump();
    }
},{passive:false});
document.getElementById('tzR').addEventListener('touchend',  e=>{if(gameState==='PLAY'){e.preventDefault();keys.right=false;}},{passive:false});

document.getElementById('tzL').addEventListener('mousedown',()=>{keys.left=true;p.facing='left'; if (!p.isIdle && p.djTimer > 0 && p.hasDJ) triggerJump();}); 
document.getElementById('tzL').addEventListener('mouseup',()=>{keys.left=false;});
document.getElementById('tzR').addEventListener('mousedown',()=>{keys.right=true;p.facing='right'; if (!p.isIdle && p.djTimer > 0 && p.hasDJ) triggerJump();}); 
document.getElementById('tzR').addEventListener('mouseup',()=>{keys.right=false;});
document.getElementById('tzJ').addEventListener('touchstart', e => { e.preventDefault(); triggerJump(); }, {passive:false});
document.getElementById('tzJ').addEventListener('mousedown', e => { e.preventDefault(); triggerJump(); });

window.addEventListener('keydown', e => { 
    let ci = document.getElementById('chatTxt'); if (document.activeElement === ci) return; 
    if (e.key==='ArrowLeft'||e.key==='a') { keys.left=true; p.facing='left'; if(!p.isIdle && p.djTimer>0 && p.hasDJ) triggerJump(); }
    if (e.key==='ArrowRight'||e.key==='d') { keys.right=true; p.facing='right'; if(!p.isIdle && p.djTimer>0 && p.hasDJ) triggerJump(); }
    if (e.key===' ' || e.key==='ArrowUp' || e.key==='w') { triggerJump(); }
});
window.addEventListener('keyup', e => { 
    if (e.key==='ArrowLeft'||e.key==='a') keys.left=false; 
    if (e.key==='ArrowRight'||e.key==='d') keys.right=false; 
});
