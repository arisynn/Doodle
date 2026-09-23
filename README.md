# Lompat Langit

Game lompat vertikal browser, mobile-first. Tap kiri/kanan untuk melompat manual; harus berpijak sebelum melompat lagi, kecuali satu lompatan udara ekstra dari Double Jump. Musuh dikalahkan dengan injakan. Ada 9 tipe platform, 8 musuh, 6 power-up, 5 zona, serta toko dengan satu mata uang Bintang.

## Menjalankan
- Install dependensi: `yarn install`.
- Sediakan environment variable `PORT`, lalu jalankan `yarn start`. Supervisor lingkungan preview sudah menyediakan port frontend.
- `yarn build` menyelaraskan entry HTML dan manifest ke folder public.
- Tidak diperlukan akun, database, kunci API, atau server game online.

## Aset
Semua aset runtime berupa PNG di `public/assets/sky`. Untuk membangun ulang ilustrasi lokal:

```
node scripts/build-assets.js
node scripts/build-icons.js
node scripts/build-expansion.js
node scripts/build-manual-assets.js
```

## Progres dan ekonomi
Data disimpan di localStorage key `lompat-langit-v1` (schema2, migrasi otomatis dari schema1). Bintang dikumpulkan saat bermain dan dari hadiah misi terbatas. Toko menyediakan skin, jejak, efek pendaratan, bekal sekali pakai, dan perayaan kosmetik. Satu bekal dipilih sebelum bermain, dikonsumsi pada tap pertama, dan tidak diisi ulang otomatis. Tidak ada pembelian uang asli atau mata uang kedua.

Dokumentasi perubahan dan rencana: `memory/PRD.md`. Pengujian ada di `tests/` dan laporannya di `test_reports/`.