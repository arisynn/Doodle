class CharacterManager {
    constructor() {
        this.skins = [
            { id: 'default', name: 'Default Doodle', rarity: 'common', priceCoins: 0, previewImage: 'assets/player/skins/default/idle.png', isGem: false },
            { id: 'strawberry', name: 'Strawberry', rarity: 'uncommon', priceCoins: 100, previewImage: 'assets/player/skins/strawberry/idle.png', isGem: false },
            { id: 'lemon', name: 'Lemon', rarity: 'uncommon', priceCoins: 100, previewImage: 'assets/player/skins/lemon/idle.png', isGem: false },
            { id: 'grape', name: 'Grape', rarity: 'uncommon', priceCoins: 150, previewImage: 'assets/player/skins/grape/idle.png', isGem: false },
            { id: 'kiwi', name: 'Kiwi', rarity: 'uncommon', priceCoins: 150, previewImage: 'assets/player/skins/kiwi/idle.png', isGem: false },
            { id: 'watermelon', name: 'Watermelon', rarity: 'rare', priceCoins: 300, previewImage: 'assets/player/skins/watermelon/idle.png', isGem: false },
            { id: 'blueberry', name: 'Blueberry', rarity: 'rare', priceCoins: 300, previewImage: 'assets/player/skins/blueberry/idle.png', isGem: false },
            { id: 'peach', name: 'Peach', rarity: 'rare', priceCoins: 400, previewImage: 'assets/player/skins/peach/idle.png', isGem: false },
            { id: 'galaxy', name: 'Galaxy', rarity: 'epic', priceCoins: 10, previewImage: 'assets/player/skins/galaxy/idle.png', isGem: true },
            { id: 'gold', name: 'Solid Gold', rarity: 'legendary', priceCoins: 50, previewImage: 'assets/player/skins/gold/idle.png', isGem: true }
        ];

        this.sprites = {};
        this.selectedSkin = localStorage.getItem('doodle_skin') || 'default';
        this.loadSkin(this.selectedSkin);
    }

    loadSkin(skinId) {
        this.selectedSkin = skinId;
        localStorage.setItem('doodle_skin', skinId);
        
        // Di sini kita tambahkan 'idleblink' ke dalam daftar gambar yang harus dimuat
        const states = ['idle', 'idleblink', 'jump', 'land', 'fly'];
        
        this.sprites = {};
        for (let state of states) {
            let img = new Image();
            img.src = `assets/player/skins/${skinId}/${state}.png`;
            img.onerror = () => { img.onerror = null;
                // Fallback to base if skin image fails
                img.src = `assets/player/base/${state}.png`;
            };
            this.sprites[state] = img;
        }
    }

    getSprite(state, skinId) {
        // Jika tidak ada skinId khusus, gunakan skin yang sedang dipakai pemain
        if (!skinId || skinId === this.selectedSkin) return this.sprites[state];
        
        // Caching sistem untuk skin teman (jika gamenya multiplayer/ada sistem peer)
        this.peerCache = this.peerCache || {};
        if (!this.peerCache[skinId]) this.peerCache[skinId] = {};
        
        if (!this.peerCache[skinId][state]) {
            let img = new Image();
            img.src = 'assets/player/skins/' + skinId + '/' + state + '.png';
            img.onerror = () => { img.onerror = null; img.src = 'assets/player/base/' + state + '.png'; };
            this.peerCache[skinId][state] = img;
        }
        return this.peerCache[skinId][state];
    }
}

window.characterManager = new CharacterManager();