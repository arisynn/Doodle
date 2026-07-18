const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Add CSS rules in <head> for PWA styling
if (!html.includes('/* PWA STYLES */')) {
    const pwaStyles = `
    <style>
        /* PWA STYLES */
        html, body {
            touch-action: none;
            user-select: none;
            -webkit-user-select: none;
            overflow: hidden;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
        }
        
        #pwaInstallGuard {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: #0f172a;
            z-index: 999999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: 'Nunito', sans-serif;
            text-align: center;
            padding: 20px;
            box-sizing: border-box;
        }
        
        #pwaInstallGuard h1 {
            font-family: 'Patrick Hand', cursive;
            font-size: 3rem;
            margin-bottom: 10px;
            color: #38bdf8;
        }
        
        #pwaInstallGuard p {
            font-size: 1.2rem;
            color: #94a3b8;
            margin-bottom: 30px;
            max-width: 400px;
            line-height: 1.5;
        }
        
        .pwa-btn {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            border: none;
            border-bottom: 4px solid #1d4ed8;
            border-radius: 16px;
            color: white;
            font-size: 1.5rem;
            font-family: 'Nunito', sans-serif;
            font-weight: 800;
            padding: 15px 40px;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
            transition: transform 0.1s;
        }
        .pwa-btn:active {
            transform: translateY(4px);
            border-bottom: 0px;
            margin-top: 4px;
        }
        
        .pwa-manual {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 16px;
            text-align: left;
            max-width: 300px;
        }
        
        .pwa-manual-step {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            font-size: 1.1rem;
        }
        .pwa-manual-step svg {
            margin-right: 15px;
            flex-shrink: 0;
        }
    </style>
`;
    html = html.replace('</head>', pwaStyles + '\n</head>');
}

// 2. Add beforeinstallprompt logic and PWA guard scripts
if (!html.includes('// PWA INSTALL LOGIC')) {
    const pwaLogic = `
    <script>
        // PWA INSTALL LOGIC
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            updateInstallUI();
        });
        
        function handleInstall() {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    }
                    deferredPrompt = null;
                    updateInstallUI();
                });
            }
        }
        
        function checkStandalone() {
            return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
        }
        
        function updateInstallUI() {
            const guard = document.getElementById('pwaInstallGuard');
            const gameContainer = document.getElementById('gameContainer');
            if (!guard) return;
            
            if (checkStandalone()) {
                guard.style.display = 'none';
                if(gameContainer) gameContainer.style.display = 'block';
            } else {
                guard.style.display = 'flex';
                if(gameContainer) gameContainer.style.display = 'none';
                
                const btnContainer = document.getElementById('pwaBtnContainer');
                const manualContainer = document.getElementById('pwaManualContainer');
                
                if (deferredPrompt) {
                    btnContainer.style.display = 'block';
                    manualContainer.style.display = 'none';
                } else {
                    btnContainer.style.display = 'none';
                    manualContainer.style.display = 'block';
                    
                    // Basic OS detection for manual instructions
                    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
                    if(isIOS) {
                         document.getElementById('pwaOsInstruction').innerHTML = 'Ketuk ikon <b>Share</b> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle;"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg> di bawah, lalu pilih <b>"Add to Home Screen"</b> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>';
                    } else {
                         document.getElementById('pwaOsInstruction').innerHTML = 'Ketuk menu titik tiga <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle;"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg> di browser, lalu pilih <b>"Install app"</b> atau <b>"Add to Home screen"</b>.';
                    }
                }
            }
        }
        
        window.addEventListener('DOMContentLoaded', () => {
            updateInstallUI();
            
            // Listen for display mode changes (e.g. user installs while looking at the prompt)
            window.matchMedia('(display-mode: standalone)').addEventListener('change', (evt) => {
                updateInstallUI();
            });
        });
    </script>
`;
    html = html.replace('</head>', pwaLogic + '\n</head>');
}

// 3. Add the UI block right after <body>
if (!html.includes('id="pwaInstallGuard"')) {
    const pwaUI = `
    <!-- PWA GUARD UI -->
    <div id="pwaInstallGuard" style="display:none;">
        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 20px;">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
            <line x1="12" y1="18" x2="12.01" y2="18"></line>
        </svg>
        <h1>Install Game!</h1>
        <p>Game ini eksklusif dan hanya bisa dimainkan melalui Home Screen (sebagai Aplikasi).</p>
        
        <div id="pwaBtnContainer" style="display: none;">
            <button class="pwa-btn" onclick="handleInstall()">Install Sekarang</button>
        </div>
        
        <div id="pwaManualContainer" class="pwa-manual" style="display: none;">
            <div class="pwa-manual-step">
                <span id="pwaOsInstruction">Install secara manual dari menu browser.</span>
            </div>
        </div>
    </div>
`;
    html = html.replace('<body>', '<body>\n' + pwaUI);
}

fs.writeFileSync('index.html', html);
console.log("Patcher complete.");
