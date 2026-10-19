# Dompet Mahasiswa Kos - Personal Money Management
Aplikasi pencatatan dan pengelolaan keuangan pribadi berbasis web (Pure Vanilla HTML, CSS, JavaScript, dan `localStorage`) yang dirancang khusus untuk persona mahasiswa kos.

---

## Data Pengembang
- **Nama:** Afrel Zharif Muflih
- **NRP:** 5053251023
- **Persona:** Mahasiswa Kos

---

## Daftar Fitur

### Fitur Utama (W1–W6)
- [x] **W1: Form Tambah Transaksi** — Input tanggal (default hari ini), jenis transaksi (pengeluaran/pemasukan), kategori dinamis, nominal angka, dan catatan opsional.
- [x] **W2: Daftar Transaksi** — Dirender secara dinamis dari array JavaScript, diurutkan dari transaksi terbaru di paling atas.
- [x] **W3: Hapus Transaksi** — Menghapus data transaksi berdasarkan ID unik dengan dialog konfirmasi.
- [x] **W4: Persistensi LocalStorage** — Data transaksi dan pengaturan tersimpan di peramban, tidak hilang saat halaman di-refresh.
- [x] **W5: Ringkasan Keuangan** — Tiga kartu statistik dinamis: Total Pemasukan, Total Pengeluaran, dan Saldo Terkini (berubah merah jika saldo minus).
- [x] **W6: Validasi Form Inline** — Menampilkan pesan error interaktif di bawah setiap field yang tidak valid tanpa menggunakan alert bawaan browser.

### Fitur Khas Mahasiswa Kos (F1–F3)
- [x] **F1: Integrasi Uang Bulanan Otomatis** — Otomatis mengambil nominal dari transaksi pemasukan kategori "Uang Bulanan" terbaru (pemasukan sampingan/jualan tidak mengotori jatah bulanan).
- [x] **F2: Jatah Harian Statis & Dinamis** — Menghitung batas belanja harian tetap ($\text{Uang Bulanan} / 30\text{ hari}$) serta melacak sisa hari bertahan yang dimajukan sesuai tanggal pengeluaran.
- [x] **F3: Checker Pengeluaran & Banner Visual** — Membandingkan total pengeluaran hari ini terhadap jatah harian dengan indikator visual:
  - 🟢 **Aman**: Pengeluaran di bawah jatah harian.
  - 🟡 **Mendekati Batas**: Sisa jatah hari ini tinggal $\le$ Rp 15.000.
  - 🔴 **Boros / Melebihi Jatah**: Pengeluaran melebihi jatah harian.

### Fitur Bonus (Tahap 3)
- [x] **B1: Responsif Layar Mobile / 360px** — Menggunakan CSS Flexbox, Grid, dan Media Query `@media (max-width: 360px)` sehingga nyaman digunakan di HP tanpa horizontal scroll.
- [x] **B2: Edit Transaksi** — Mengisi form kembali dari data transaksi yang dipilih, memperbarui data menggunakan Array `map()`, serta tombol batal edit.
- [x] **B3: Filter & Pencarian** — Filter multi-kriteria berdasarkan jenis, kategori, rentang tanggal (dari–sampai), pencarian teks di catatan/kategori, dan tombol reset filter.
- [x] **B4: Ekspor & Impor Data JSON** — Backup data transaksi ke file `.json` (`Blob`) dan pemulihan data dari file `.json` (`FileReader`).

### Fitur Belum Selesai / Future Improvements
- *Tidak ada* (seluruh fitur W1–W6, Fitur Khas, dan 4 Fitur Bonus telah selesai diimplementasikan 100%).