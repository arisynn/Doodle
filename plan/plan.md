# Rencana Penyelesaian Game: Lompat Langit

## Tujuan
Menyelesaikan game bergaya Doodle Jump yang sudah ada di proyek menjadi **Lompat Langit**, dengan **pengalaman mobile sebagai prioritas utama**. Gameplay diperbarui dengan musuh, power-up, misi, serta satu mata uang untuk membuka skin. Konsep utama tetap berupa permainan lompat vertikal tanpa akhir, dengan aset gambar untuk seluruh elemen visual utama.

## Keputusan yang Sudah Disepakati
- Game yang dilanjutkan adalah game Doodle Jump dalam proyek yang telah terhubung ke repositori GitHub.
- Nama baru dan detail pembaruan gameplay bebas ditentukan.
- Konsep utama game lama harus dipertahankan.
- Visual berbasis aset gambar diutamakan.
- Mobile menjadi prioritas utama; dukungan komputer bersifat tambahan.
- Musuh harus ditambahkan, beserta fitur pendukung yang membuat permainan lebih menarik.
- Hanya ada **satu jenis mata uang** dalam game.

## Prioritas Mobile
- Permainan dirancang untuk layar ponsel dalam posisi **portrait** dan nyaman dimainkan dengan satu jempol.
- Kontrol utama adalah menggeser jari ke kiri atau kanan pada arena untuk mengarahkan karakter. Lompatan dan tembakan berlangsung otomatis.
- Tersedia pilihan kontrol tombol sentuh kiri/kanan bagi pemain yang lebih nyaman menggunakan tombol. Kontrol tidak bergantung pada sensor kemiringan ponsel.
- Tombol penting berukuran besar dan berada dalam jangkauan jempol; tampilan memperhatikan area kamera layar dan bilah navigasi ponsel.
- Arena tidak memicu halaman bergulir ketika jari digunakan untuk bermain.
- Permainan dijeda otomatis saat berpindah aplikasi atau meninggalkan tab. Pemain melanjutkannya secara sadar melalui tombol lanjut.
- Komputer tetap dapat digunakan melalui tombol panah atau A/D, tetapi tidak menentukan desain utama.

## Identitas dan Tampilan yang Diusulkan
- **Nama game: Lompat Langit.** Nama ini menggantikan judul lama pada tampilan yang terlihat oleh pemain.
- Karakter utama berupa makhluk kecil penjelajah langit dengan ilustrasi orisinal dan ekspresi ceria.
- Gaya visual kartun 2D bergambar tangan, dengan warna cerah, bentuk yang mudah dikenali, dan kontras yang membuat platform tetap jelas.
- Latar berubah mengikuti ketinggian: langit pagi, langit senja, lalu langit berbintang. Perubahan ini merupakan variasi suasana dalam satu permainan tanpa akhir.
- Karakter, platform, rintangan, power-up, latar, dan dekorasi menggunakan gambar atau sprite. Skor, petunjuk, serta label tombol tetap berupa teks agar terbaca jelas pada berbagai ukuran layar.
- Aset lama yang cocok dan tersedia untuk digunakan dapat dipertahankan. Identitas visual tidak menyalin karakter atau merek Doodle Jump.

## Gameplay
### Gerakan dasar
- Karakter melompat otomatis ketika mendarat di platform.
- Pemain mengarahkan gerak kiri dan kanan dengan kontrol sentuh satu jempol; tombol panah atau A/D tersedia di komputer.
- Melewati sisi kiri atau kanan layar membawa karakter ke sisi seberangnya.
- Kamera mengikuti kenaikan karakter; tujuan permainan adalah mencapai ketinggian setinggi mungkin.

### Variasi tantangan
- **Platform biasa:** tempat mendarat yang stabil.
- **Platform bergerak:** bergeser ke kiri dan kanan sehingga membutuhkan ketepatan arah.
- **Platform rapuh:** dapat dipijak satu kali, kemudian pecah setelah karakter melompat kembali.
- **Pegas:** memberikan lompatan lebih tinggi saat diinjak.
- **Jetpack:** membawa karakter naik cepat untuk waktu singkat, sekaligus melindunginya dari musuh dan proyektil selama aktif.
- **Perisai:** menahan satu benturan dengan musuh atau proyektil; tidak menyelamatkan karakter yang jatuh.
- **Magnet:** menarik Bintang di sekitar karakter untuk waktu singkat.
- Power-up ditemukan selama bermain, bukan mata uang tambahan dan bukan barang berbayar.
- Tingkat kesulitan meningkat secara bertahap melalui kombinasi jenis platform, jarak lompatan, dan musuh. Jalur naik harus tetap dapat dijangkau dengan kemampuan karakter, tanpa mewajibkan power-up acak.

### Musuh dan pertarungan
- **Slime awan:** menempati platform tertentu sehingga pemain perlu menghindar atau mengalahkannya sebelum mendarat.
- **Kelelawar langit:** berpatroli mendatar dengan pola yang mudah dikenali.
- **Drone penjaga:** muncul di ketinggian lebih tinggi dan menembakkan proyektil lambat setelah tanda peringatan yang terlihat jelas.
- Karakter menembak otomatis ke atas secara berkala ketika ada musuh di layar. Tidak ada tombol serang wajib, amunisi yang harus dibeli, atau mata uang khusus senjata.
- Musuh dapat dikalahkan dengan tembakan atau diinjak dari atas. Benturan dari samping/bawah berbahaya jika karakter tidak terlindungi.
- Musuh yang dikalahkan menjatuhkan Bintang. Animasi dan efek benturan memperjelas serangan yang berhasil.
- Bagian awal permainan memberi ruang mempelajari lompatan sebelum musuh diperkenalkan bertahap. Musuh tidak muncul menumpuk hingga menutup semua jalur aman.

### Skor dan akhir permainan
- Skor dihitung dari ketinggian maksimum yang dicapai, bukan jumlah lompatan.
- Permainan berakhir ketika karakter jatuh melewati bagian bawah layar atau terkena musuh/proyektil tanpa perlindungan.
- Layar akhir menampilkan skor, rekor terbaik, jumlah musuh yang dikalahkan, Bintang yang diperoleh, progres misi, dan tombol main lagi.
- Skor ketinggian bukan mata uang dan tidak dapat dibelanjakan.

## Satu Mata Uang: Bintang
- **Bintang adalah satu-satunya mata uang.** Tidak ada koin, berlian, tiket, energi, atau mata uang premium tambahan.
- Bintang diperoleh dari mengambil item selama bermain, mengalahkan musuh, dan menyelesaikan misi.
- Bintang digunakan hanya untuk membeli skin kosmetik permanen pada versi ini. Skin tidak memberikan keunggulan gameplay.
- Saldo terlihat jelas pada beranda dan toko; hasil permainan membedakan skor ketinggian dari Bintang yang didapat.
- Bintang yang sudah dikumpulkan tidak hilang ketika karakter kalah. Pembelian tidak dapat dilakukan jika saldo tidak cukup, dan skin yang sudah dimiliki tidak dibeli ulang.
- Tidak ada pembelian dengan uang asli atau iklan wajib untuk mendapatkan Bintang.

## Fitur Tambahan yang Diusulkan
### Toko dan koleksi skin
- Satu skin awal gratis dan tiga skin tambahan yang dapat dibuka menggunakan Bintang.
- Setiap skin mempunyai aset karakter yang berbeda tetapi kemampuan dan ukuran area benturan tetap setara.
- Toko menampilkan pratinjau, harga, status kepemilikan, serta tombol membeli atau memakai skin.
- Skin yang dipilih tetap digunakan pada permainan berikutnya.

### Misi pencapaian
- Tiga misi aktif dengan sasaran berbeda: mencapai ketinggian, mengumpulkan Bintang, dan mengalahkan musuh.
- Misi ketinggian dicapai dalam satu permainan; misi pengumpulan dan jumlah musuh dapat bertambah lintas permainan.
- Misi yang selesai memberikan hadiah Bintang sekali saja, kemudian digantikan target lanjutan yang lebih menantang.
- Progres dan hadiah ditampilkan pada layar misi tersendiri, dengan ringkasan setelah bermain.

### Umpan balik permainan
- Efek suara singkat untuk lompatan, pengambilan Bintang, serangan, dan kekalahan, dengan pilihan suara aktif/nonaktif.
- Getaran ringan sebagai opsi pada ponsel yang mendukung; permainan tetap berfungsi tanpa getaran.
- Petunjuk singkat pada permainan pertama, indikator power-up aktif, dan transisi latar mengikuti ketinggian.

## Pengalaman Pemain
- Layar awal memuat nama baru, ilustrasi karakter terpilih, tombol main yang dominan, rekor terbaik, saldo Bintang, serta akses toko, misi, dan pengaturan.
- Toko dan misi memiliki tampilan tersendiri agar arena bermain tidak penuh panel.
- Selama bermain, skor, Bintang yang terkumpul, indikator power-up, dan tombol jeda tetap mudah terlihat tanpa menghalangi area lompatan.
- Menu jeda menyediakan pilihan melanjutkan, mengulang, atau kembali ke layar awal.
- Animasi lompatan, platform pecah, musuh kalah, pengambilan power-up, dan transisi akhir permainan memberi umpan balik yang jelas tanpa menutupi bahaya.
- Tampilan mengutamakan ponsel kecil maupun besar, dengan arena vertikal yang tidak terpotong; komputer mendapat arena portrait yang terpusat.
- Rekor, saldo Bintang, koleksi skin, pilihan kontrol, pengaturan, dan progres misi tersimpan pada perangkat/browser yang sama tanpa akun. Progres tidak tersinkron antarperangkat.

## Asumsi dan Batas Cakupan
- **Asumsi format:** game mobile-first yang dimainkan melalui browser ponsel. Aplikasi native Android/iOS atau paket APK belum termasuk dalam rencana ini.
- Proyek yang ada menjadi dasar pengembangan; bagian yang masih sesuai dipertahankan.
- Fokus versi ini adalah satu mode tanpa akhir yang utuh, tiga jenis musuh, power-up, satu mata uang, toko skin, dan misi pencapaian.
- Tidak termasuk akun, multiplayer, leaderboard daring, pembayaran, iklan, mode cerita, boss battle, atau karakter dengan kemampuan berbeda.
- Tidak diperlukan layanan AI atau layanan eksternal saat pemain menjalankan game.

## Hasil yang Diharapkan
Pemain dapat membuka **Lompat Langit** di ponsel, bermain nyaman dengan satu jempol, melawan musuh, menggunakan power-up, mengumpulkan Bintang, menyelesaikan misi, membuka skin, dan mencoba mengalahkan rekor sendiri. Seluruh elemen visual utama memiliki aset gambar yang konsisten, tanpa mata uang ganda atau keharusan membayar untuk bermain.

## Pengembangan Lanjutan Opsional
Kartu hasil yang dapat dibagikan, berisi skor dan ilustrasi karakter, untuk mengajak teman mencoba mengalahkan rekor.