# Lompat Langit — Product & Handoff

## Original request
“Aku ingin kamu menyelesaikan pembuatan game ini, ubah nama game nya, terus update gameplay nya, klo bisa semuanya pake assets gambar.”

Approved initial plan: finish the existing Doodle Jump browser project as Lompat Langit, mobile portrait first, endless vertical jumping, one currency Bintang, local-only progress, skin store, missions, enemies, power-ups. Initial auto-jump/auto-shoot and cosmetic-only store requirements were explicitly superseded by the latest user choices below.

## Latest explicit requirements (precedence)
- “Maximalkan gameplay nya ya.”
- “Sprite karakter lama hapus aja ganti yaPakai assets gambar bukan svg ataupun emoji.” All runtime art/icons now actual PNG files; old character sprite folder removed.
- “Oke oke lucu, tapi sekarang update prosedural nya, atur summon powerups atur musuh, atur platform, perbanyak powerups, perbanyak musuh, perbanyak platform, tiles nya harus beda beda, buat semakin tinggi semakin susah, nggak bisa numpuk roket yang lagi aktif ya !”
- “Nahh terus sistem curency, gaboleh bikin curency inflasi, jadi sistem progress nya kerasa banget. Terus jual apapun di shop biar meminimalisir kecepatan inflasi wkwkw, harus seimbang pemasukan dan pengeluaran.”
- User approved skins, jump trails, landing effects, one-run celebrations AND single-use purchased power-up supplies. No real-money purchases.
- “Terakhir sistem tile yang bergerak sesuaikan jangan ada yang menumpuk dengan solid tile, coba kamu cek deh, pasti tile geser, tile lift, tile nail turun itu numpuk sama solid tile, sesuai kan lagi prosedural nya, terus aku sebenernya pengen kontrol lama, yang gak lompat otomatis, tapi lompat berdasarkan arah tap layar, jadi kerasa susah nya, terus menurutku cara mengalahkan musuh mending di injek jadi susah, prosedural nya harus bagus, tambahkan musuh kamuflase, buat game nya se ngeselin mungkin. Jangan fun game hahahaha”
- User approved tap left/right to launch only when grounded; in-air tap steers only, requiring a fresh tap after each landing. “Iya jadi harus injak dulu baru bisa lompat lagi, kecuali powerups double jump, itu bisa lompat sekali lagi di udara.”

## Architecture
- Existing stack retained: Express serving static HTML/CSS/native ES modules, Canvas 2D fixed 400x720 logical portrait arena, physics fixed timestep 120Hz.
- Root server.js port from supervisor PORT environment. /app/frontend/package.json and server.js symlink to root for the preconfigured supervisor frontend process. No backend API, MongoDB, accounts, AI runtime, payments, or online services required. Unused template backend process is not part of this app.
- Runtime /public/js/sky: main, views, panels, shop, store, economy, catalog, engine, combat, world, placement, input, renderer, audio.
- Original PNG illustrations generated locally with sharp via scripts/build-assets.js, build-icons.js, build-expansion.js, build-manual-assets.js. The source illustration templates rasterize to PNG; no SVG DOM or SVG game files are requested at runtime.
- public/css/sky.css, expansion.css, shop.css. Responsive home, shop, missions, settings, guide, centered portrait play arena.
- Root index.html and manifest.json mirrored by yarn build into public. public/sw.js mirrored to root; current cache lompat-langit-png-v3-manual-economy. Network first, cached revisits work offline for visited assets.
- localStorage key lompat-langit-v1, current schema version2. Version1 migration preserves balance, best, skins, missions, settings. New tutorial version2 explains manual controls. Legacy swipe setting migrates to tap; old spread supply migrates to Double Jump. No test credentials needed.

## Implemented
- New identity and four distinct original characters Piko/Momo/Luna/Nimbus. PNG backgrounds, characters, enemies, collectibles, power-ups, UI icons, tile art and cosmetic particles.
- Manual tap-direction jump, airborne direction change, no repeated jump from held key/button. Keyboard fresh arrows/A/D/space. Optional explicit tap buttons. Land and ride moving/lift platforms. Pause on blur/hidden, explicit resume, safe-area layout, audio and optional vibration.
- All enemies defeated ONLY by downward stomp; player shooting removed. Stomp gives a short .35s manual re-jump window, not automatic bounce. Rocket immunity does not kill via side contact.
- 9 platform types: normal, moving, fragile (breaks when jumping away), spring (manual launch boost), ice (ground slide), conveyor (ground shift), cloud (.65s dissolve), phase (warned disappearing), elevator (±15px).
- 5 zones at 0/350/900/1800/3200m and 45 zone/type tile PNGs. Structured random chunks (stairs/zigzag/scatter/rest), narrower tiles, wider gaps, increasing enemy aggression; bounded jump geometry, no power-up mandatory.
- Swept-bounds placement handles full moving/lift trajectories. Removed overlapping fallback tiles. Phase alternative placed beside the full motion envelope; grounded enemy support tiles use the same non-overlap check. Balloon no longer creates an extra map tile.
- 8 enemies: slime, bat, bee, drone, mimic/Pijakan Palsu, beetle, jelly, wisp. Mimic disguised as zone tile, reveals within155px with .6s harmless warning. Shooter warnings, locked wisp dash, capped12 hostile projectiles.
- Enemy density neighborhoods capped3 within720px of each enemy, shooters >=260m apart at actual spawn elevations. Power-up cooldown220m+ and anti-last2-repeat filtering. Active powers filtered from new spawn candidates.
- 6 powers: shield one hit; magnet9s; rocket3.8s immune; Double Jump10s one additional jump per grounding; slow6s slows world/enemies/projectiles not player/timers; balloon one fall recovery. Active rocket pickup rejected without consuming item or resetting duration.
- One currency Bintang: collected stars + enemy loot2 (3 for mimic/beetle/wisp) + bounded mission rewards. Height is not spendable. Collected currency banks immediately and survives loss/abandon.
- Economy shop: 4 skins total, 4 trails including free default, 4 landing effects including free default, 6 supply types, one-run confetti festival. Cosmetic prices/height gates progress; purchased ownership retained regardless new gates.
- Supply prices shield35/magnet30/rocket90/doublejump45/slow40/balloon60. Inventory max5 per type, exactly one prepared supply. Explicit preparation required; first directional tap consumes once, not tutorial/startscreen, no automatic resupply. Party18 independently optional, used once per first tap and shown at result. No resale/passive income/interest/income boosters/mandatory fees.
- Skins free/80/240/600, Luna>=900m Nimbus>=3200m. Cosmetic earned tiers350/900/1800/3200m. Mission height targets exponential(1.7x); star/kill targets increasingly costly; rewards capped60/30/40 respectively. Mission rewards excluded from collection progress. Ledger and earned/spent/opening balance totals displayed in Buku Bintang.
- Separate guide tabs9/6/8/5, HUD zone and grounded/airborne/double-jump state, results/record/loot/stomps/mission summaries.

## Verification history
- Iteration1 initial auto-play app tested responsive390/320/430/desktop, all original flows. Sole storage-indicator recovery bug fixed and self-verified.
- Iteration2 expanded procedural app: rocket nonstack/UI/mechanics passed; enemy density and shooter spacing failed. Both fixed; regression script passed and 300 seeds diagnostics had zero violations before latest manual changes.
- User tile-overlap bug reproduced via seed9973: moving16 overlapped safe-16, phase83 overlapped safe-83. Swept placement implemented; quick20-seed scan found0 overlapping moving/lift/phase versus solids. REQUIRED specialist testing after latest bugfix still pending at time of this note.
- Self screenshot verified latest shop six supplies and zero-input grounded idle, tap-right manual launch. Full manual/economy/mimic/geometry specialist testing pending; old tests need updating to latest explicit requirements (no more autojump/spread, phase alt no longer+18px).

## Prioritized backlog / next tasks
- P0: Complete specialist regression on reported swept tile overlap at all phases/heights; manual landing/ride, doublejump limit, stomp-only, mimic warnings; fix every finding.
- P0: Verify economy migration, transaction invariants, all categories/equip, one-slot first-tap consumption, inventory5 cap, persistence, celebration, bounded mission rewards. Update old tests to superseding requirements.
- P1: Long-play tuning based on actual player skill and measured income/spending. Optional spending means a perfectly equal lifetime income/spending ratio is not guaranteed or enforced; never confiscate Bintang.
- P2: Optional shareable result card / same-seed personal challenges (not implemented).
