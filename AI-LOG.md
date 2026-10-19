# AI-LOG

Catatan penggunaan AI selama hackathon ETS Pemrograman Web (Personal Money Management, persona mahasiswa kos).
Entri ditambahkan di akhir file, satu entri per tugas yang menghasilkan atau mengubah kode.
Kalau tidak memakai AI sama sekali, ganti isi file ini dengan "tidak memakai AI".

Format entri:

```md
## <nama fitur / tugas singkat>
- Prompt: “<ringkasan prompt yang dikirim>”
- Dipakai: <fungsi/bagian kode yang dipakai> di <file>
- Diubah: <apa yang diubah/diperbaiki dari hasil AI>
```

---
## Tahap 0: Planning:
Melakukan planning untuk apa yang perlu dilakukan dan bagaimana langkah langkah yang akan diambil. bagian ini juga diimprove oleh AI.

## Tahap 1: W1–W4 (Form Tambah, Daftar Transaksi, Hapus, dan LocalStorage)
- Prompt: “oke untuk tahap pertama tolong untuk membuat week 1 = kategori beri makan, jajan, menabung, parkir, biaya bulanan kerjakan tahap 1 aja dulu”
- Dipakai: form dan kontainer daftar di `index.html`; styling layout dan komponen di `style.css`; fungsi `muatData`, `simpanData`, `formatRupiah`, `dapatkanTanggalHariIni`, `tambahTransaksi`, `hapusTransaksi`, `renderDaftar`, `escapeHtml`, dan `renderSemua` di `app.js`
- Diubah: kategori transaksi disesuaikan dengan permintaan (Makan, Jajan, Menabung, Parkir, Biaya Bulanan), dan default input tanggal otomatis diarahkan ke tanggal hari ini

## Pemisahan Kategori Pemasukan & Pengeluaran
- Prompt: “tolong pisahkan kategori di pemasukan dan pengeluaran untuk pemasukan bisa dengan uang bulanan, uang sampingan, jualan. untuk kategori dihapus saja”
- Dipakai: elemen `<select id="kategori">` di `index.html`; konstanta `KATEGORI_OPSI`, fungsi `perbaruiOpsiKategori`, dan event listener `change` pada elemen jenis di `app.js`
- Diubah: kategori pengeluaran dan pemasukan dipisahkan secara dinamis sesuai pilihan jenis transaksi, serta opsi kategori "Lainnya" dihapus

## Validator dan Format Currency Input Nominal
- Prompt: “lalu buat validator di bagian input nominal input nominal dalam format currency ya jadi ketika ada digit lebih dari tiga tambahkan "." dan akhiri dengan ",-"”
- Dipakai: input nominal dan elemen pesan error di `index.html`; styling `.input-error` dan `.error-message` di `style.css`; fungsi `dapatkanNominalAngka`, `formatInputCurrency`, `validasiNominal`, serta event listener `input`, `keydown`, `click`, dan `blur` di `app.js`
- Diubah: input nominal diubah dari type number ke text berformat currency dengan titik ribuan dan akhiran ',-', penanganan tombol backspace dan posisi kursor disesuaikan, serta validasi pesan error interaktif ditampilkan di halaman

## Tahap 2: W5–W6 + Fitur Khas (Ringkasan, Validasi Form, Uang Bulanan, Jatah Harian, Peringatan)
- Prompt: “implement tahap kedua di plan.md”
- Dipakai: elemen Ringkasan Keuangan, Pengaturan Uang Bulanan, Statistik Jatah Harian, Banner Peringatan, dan error message di `index.html`; styling layout banner, grid ringkasan, dan kartu jatah harian di `style.css`; fungsi `muatPengaturan`, `simpanPengaturan`, `validasiForm`, `validasiUangBulanan`, `tanganiSimpanPengaturan`, `hitungRingkasan`, `renderRingkasan`, `hitungJatahHarian`, `renderJatahDanPeringatan`, dan `renderSemua` di `app.js`
- Diubah: menambahkan kartu ringkasan saldo, banner visual status anggaran, perhitungan rumus jatah harian berbasis sisa hari, dan validasi form inline tanpa menggunakan alert bawaan browser

## Integrasi Uang Bulanan dari Kategori Pemasukan & Isolasi Jatah Harian
- Prompt: “kan di pemasukan ada opsi yakni uang bulanan nanti fitur khas ngambil dari data input yang kategori nya uang bulanan jika ada pemasukan yang bersifat non bulanan nanti tetep masuk ke saldo dan nggak mengubah jatah harian”
- Dipakai: kartu info Sumber Uang Bulanan di `index.html`; fungsi `hitungRingkasan`, `hitungJatahHarian`, dan `renderJatahDanPeringatan` di `app.js`
- Diubah: uang bulanan otomatis diambil dari transaksi pemasukan kategori "Uang Bulanan" bulan berjalan, pemasukan non-bulanan dimasukkan ke saldo tanpa memengaruhi jatah harian, serta form input uang bulanan terpisah ditiadakan

## Penentuan Uang Bulanan Dinamis (Terbaru vs Tetap Lama)
- Prompt: “oke jadi kan kita bisa nambahin pemasukan bulanan yang jumlah nya beda dari bulan sebelumnya jadi alur untuk uang bulanan itu kamu cek input pemasukan bulanan terbaru dan kamu ambil dari data pemasukan bulanan terbaru urutannya if ada pemasukan bulanan terbaru ambil terbaru if not stay di yang lama”
- Dipakai: fungsi `dapatkanUangBulananTerbaru`, `hitungJatahHarian`, dan `renderJatahDanPeringatan` di `app.js`
- Diubah: menambahkan fungsi pengurutan transaksi bulanan secara menurun untuk mengambil input uang bulanan terbaru, dan menerapkan mekanisme fallback ke data lama jika di bulan baru belum ada input bulanan baru

## Akumulasi Pengeluaran Harian, Checker Jatah, dan Siklus Bertahan 30 Hari
- Prompt: “pengeluaran hari ini juga ambil dari data input harian terbaru jadi jika ada lebih dari 1 input pengeluaran harian maka di total aja bung trus buat checker di pengeluaran harian apakah dia sudah melebihi jatah harian di bulan ini atau tidak trus untuk jatah harian itu assume if input hari ini maka uang itu harus survive untuk 30 hari”
- Dipakai: elemen checker pengeluaran harian `#checker-status-harian` dan indikator total input di `index.html`; kelas `.badge-danger` dan `.badge-success` di `style.css`; fungsi `hitungJatahHarian` dan `renderJatahDanPeringatan` di `app.js`
- Diubah: mengganti pembagi hari kalender bulanan menjadi asumsi siklus bertahan 30 hari sejak uang diterima, mengakumulasi total seluruh transaksi pada hari yang sama, dan menambahkan komponen badge status checker pengeluaran harian

## Perbaikan Deteksi Pengeluaran Harian & Pemajuan Sisa Waktu Bertahan
- Prompt: “oke gua udah cobain buat input pengeluaran itu dia masih nyangkut disini dimana input pengeluaran harian ku gak masuk ke dashboard diatas aku perlu kamu untuk : 1. ketika ada input pengeluaran masukin ke total pengeluaran dan total jika ada pengeluaran yang masuk di hari yang sama 2. jika terjadi pengeluaran yang tanggal nya terjadi setelah pemasukan uang bulanan kamu majuin sisa waktu bertahan sesuai dengaan selisih tanggal nya dong selebihnya itu udh aman sih harusnya”
- Dipakai: elemen `#label-pengeluaran-harian` di `index.html`; fungsi `hitungJatahHarian` dan `renderJatahDanPeringatan` di `app.js`
- Diubah: evaluasi pengeluaran harian kini membaca tanggal transaksi pengeluaran terbaru (serta menjumlahkan seluruh input pada tanggal yang sama), dan sisa waktu bertahan (30 hari) otomatis dimajukan/dikurangi sesuai selisih tanggal pengeluaran terhadap tanggal penerimaan uang bulanan

## Jatah Harian Statis terhadap Pergantian Hari & Dinamis terhadap Uang Bulanan
- Prompt: “jatah harian itu seharusnya bersifat statis terhadap pergantian sisa hari tapi bersifat dinamis terhadap input uang bulanan”
- Dipakai: elemen label `Jatah Harian:` di `index.html`; fungsi `hitungJatahHarian` di `app.js`
- Diubah: mengubah perhitungan jatah harian menjadi nilai batas harian tetap (`uangBulanan / 30`) sehingga tidak berfluktuasi saat sisa hari berkurang, namun tetap dinamis dan otomatis ter-update jika ada input transaksi pemasukan uang bulanan baru

## Tahap 3: Fitur Bonus (B1 Responsif 360px, B2 Edit Transaksi, B3 Filter & Pencarian, B4 Ekspor/Impor JSON)
- Prompt: “coba implement tahap 3”
- Dipakai: elemen judul form `#judul-form`, tombol `#btn-batal-edit`, toolbar filter & pencarian, tombol ekspor/impor data di `index.html`; penataan styling toolbar filter, tombol edit/hapus, serta media query `@media (max-width: 360px)` di `style.css`; state `idTransaksiSedangDiedit`, fungsi `mulaiEditTransaksi`, `batalkanEditTransaksi`, `perbaruiOpsiFilterKategori`, `dapatkanTransaksiTerfilter`, `resetFilter`, `eksporDataJson`, `imporDataJson`, serta pembaruan `tambahTransaksi` dan `renderDaftar` di `app.js`
- Diubah: menambahkan mode edit transaksi menggunakan `map()` dengan tombol batal, filter dinamis multi-kriteria (jenis, kategori, rentang tanggal, pencarian catatan), backup/restore JSON menggunakan `Blob` dan `FileReader`, serta styling responsif tanpa horizontal scroll pada layar 360px

## Peringatan Pengeluaran Harian Mendekati Batas (Sisa <= Rp 15.000)
- Prompt: “beri peringatan jika jumlah pengeluaran harian mendekati batas pengeluaran harian (sisa 15k)”
- Dipakai: kelas `.warning-banner.banner-warning` dan `.badge-warning` di `style.css`; konstanta `BATAS_PERINGATAN_MENDEKATI`, variabel kondisi `mendekatiBatas` pada `hitungJatahHarian` dan `renderJatahDanPeringatan` di `app.js`
- Diubah: menambahkan level peringatan transisi (kuning/amber) ketika pengeluaran harian belum melampaui jatah tetapi sisa jatah hari ini sudah mencapai Rp 15.000 atau kurang, disertai badge status checker dan teks banner peringatan visual

## Refaktor & Penyederhanaan Kode (Skill Ponytail)
- Prompt: “eh tolong cek apakah skill ponytail gw masih ada apa nggak kalau ada tolong simplify kode yg udah gw buat dengan skill ponytail https://github.com/dietrichgebert/ponytail”
- Dipakai: skill `ponytail` di `.agents/skills/ponytail/`; fungsi `validasiForm`, `setModeEdit`, `bersihkanErrorForm`, `hitungRingkasan`, `dapatkanTransaksiTerfilter`, `resetFilter`, `dapatkanNominalAngka`, dan `formatInputCurrency` di `app.js`
- Diubah: menyederhanakan kode dengan membuang percabangan if/else berulang pada validasi form, mengganti filter ganda ringkasan dengan single-pass loop, menyatukan manajemen state edit form dan reset error, serta memadatkan fungsi utilitas ke pola paling minimal tanpa mengurangi fungsionalitas

## Perbaikan Tombol Reset Filter
- Prompt: “tolong fix tombol reset filter”
- Dipakai: elemen `#btn-reset-filter` di `index.html`; fungsi `resetFilter` dan `perbaruiOpsiFilterKategori` di `app.js`
- Diubah: memperbaiki fungsi reset filter agar seluruh input (pencarian teks, rentang tanggal, pilihan jenis, dan pilihan kategori) ter-reset sempurna ke kondisi default (`semua`), serta menambahkan event handler inline pada tombol reset

## Format Dokumentasi (proses.md & README.md)
- Prompt: “tolong improve formating di proses dan readme.md”
- Dipakai: berkas `proses.md` dan `README.md`
- Diubah: menyempurnakan struktur `proses.md` sesuai rubrik penilaian (persona mahasiswa kos, rancangan data JSON `pmm_transaksi` dan `pmm_pengaturan`, keputusan desain dashboard & integrasi uang bulanan otomatis, serta pembahasan rinci 2 bug/kendala beserta solusinya), dan melengkapi `README.md` dengan identitas nama, NRP, persona, serta checklist detail seluruh fitur yang telah selesai





