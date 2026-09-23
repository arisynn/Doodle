export class Feedback {
  constructor(store) { this.store = store; this.context = null; }
  unlock() {
    if (!this.store.data.settings.sound) return;
    try { this.context ||= new (window.AudioContext || window.webkitAudioContext)(); this.context.resume().catch(() => {}); } catch {}
  }
  play(kind) {
    if (!this.store.data.settings.sound || !this.context) return;
    try {
      const c = this.context, o = c.createOscillator(), g = c.createGain();
      const notes = { jump: [340, 520, .07], star: [850, 1300, .12], hit: [210, 90, .1], power: [450, 1500, .25], over: [280, 80, .4], shoot: [710, 300, .045] };
      const [a, b, len] = notes[kind] || notes.jump;
      o.type = kind === 'hit' ? 'triangle' : 'sine'; o.frequency.setValueAtTime(a, c.currentTime); o.frequency.exponentialRampToValueAtTime(b, c.currentTime + len);
      g.gain.setValueAtTime(kind === 'shoot' ? .018 : .055, c.currentTime); g.gain.exponentialRampToValueAtTime(.001, c.currentTime + len);
      o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + len);
    } catch {}
  }
  vibrate(ms = 20) { if (this.store.data.settings.vibration && navigator.vibrate) navigator.vibrate(ms); }
}