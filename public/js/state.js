// ── CANVAS & RESIZE ──
const container = document.getElementById('gameContainer');
const canvas = document.getElementById('gc');
const ctx    = canvas.getContext('2d');
let W = 0, H = 0, mapOffsetX = 0;

function resize() {
    const dpr = window.devicePixelRatio || 1;
    W = container.clientWidth; H = container.clientHeight;
    canvas.width  = W * dpr; canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    mapOffsetX = (W - MAP_W) / 2;
}
window.addEventListener('resize', resize); resize();

// ── STATE ──
const INK = '#0f172a';
let gameState = 'MENU'; 
let myId = 'dm_' + Math.random().toString(36).substr(2,8);
let playerColor = '#f8fafc';
let playerName  = 'Doodler';
let playerType  = 'doodle'; 

let p = {
    x: 0, y: 0, vx: 0, vy: 0, oldY: 0, scaleX: 1, scaleY: 1, facing: 'right',
    flyTimer: 0, rocketTimer: 0, djTimer: 0, balloonTimer: 0, hurtTimer: 0,
    hasDJ: false, hasHeart: false, starCharges: 0, isFreeFalling: false,
    chatMsg: '', chatTimer: 0, idleBreath: 0, isIdle: false,
    currentPlatform: null, platOffsetX: 0, expressionTimer: 0,
    collectedLoot: new Map() 
};

let peers = {}, platforms = new Map(), stars = new Map(), gemMap = new Map(), coinsMap = new Map(), items = new Map(), particles = [];
let camY = 0, currentMeters = 0, displayScore = 0;
let highScore = parseInt(localStorage.getItem('doodle_hs_m12') || '0'); 
let lastSubmittedScore = 0;

document.getElementById('highScoreVal').textContent = highScore + 'm';

// FISIKA
const GRAVITY = 0.55, JUMP_FORCE = -14, SPRING_FORCE = -20, TRAMPOLINE_FORCE = -25, FLY_FORCE = -20, ROCKET_FORCE = -30, BUMPER_FORCE = -17, BOOST_FORCE = -30;
let TERMINAL_V = 18; const FALL_V = 35, MOVE_SPEED = 9;
const PLAT_GAP = 145; 
let keys = { left: false, right: false };
