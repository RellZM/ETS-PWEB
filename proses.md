# PROSES PENGEMBANGAN APLIKASI
**Aplikasi:** Dompet Mahasiswa Kos (Personal Money Management)  
**Pengembang:** Afrel Zharif Muflih (NRP: 5053251023)

---

## 1. Persona Pengguna
- **Persona:** Mahasiswa Kos.
- **Karakteristik & Kebutuhan:**
  - Bergantung pada kiriman uang bulanan dari orang tua di awal bulan atau tanggal tertentu.
  - Sering mengalami kesulitan mengontrol pengeluaran harian sehingga uang bulanan habis sebelum akhir bulan.
  - Membutuhkan patokan jatah belanja harian yang jelas agar uang bisa bertahan (*survive*) selama 30 hari ke depan.
  - Menginginkan aplikasi pencatatan keuangan yang cepat, praktis, dan tidak ribet saat digunakan di smartphone atau laptop.

---

## 2. Rancangan Data (Data Structure)
Data disimpan secara lokal pada peramban menggunakan `localStorage` dengan format JSON:

### a. Data Transaksi (`pmm_transaksi`)
Array of objects yang menyimpan riwayat pemasukan dan pengeluaran:
```json
[
  {
    "id": 1729334567890,
    "tanggal": "2026-10-19",
    "jenis": "pengeluaran",
    "kategori": "Makan",
    "nominal": 25000,
    "catatan": "Nasi rames ayam komplit"
  }
]
```
- `id` (Number): Timestamp unik (`Date.now()`).
- `tanggal` (String): Format ISO `YYYY-MM-DD`.
- `jenis` (String): `"pengeluaran"` atau `"pemasukan"`.
- `kategori` (String): Tergantung jenis (Makan, Jajan, Menabung, Parkir, Biaya Bulanan / Uang Bulanan, Uang Sampingan, Jualan).
- `nominal` (Number): Nilai angka murni (disimpan sebagai angka untuk perhitungan matematika).
- `catatan` (String): Catatan opsional.

### b. Data Pengaturan (`pmm_pengaturan`)
Menyimpan acuan nominal uang bulanan aktif:
```json
{
  "uangBulanan": 1500000
}
```

---

## 3. Keputusan Desain & Alasan

1. **Tampilan Model Dashboard Terpadu:**
   - *Alasan:* Semua informasi penting (Ringkasan Saldo, Jatah Harian, Status Pengeluaran, Form Input, dan Riwayat) diletakkan dalam satu halaman responsif. Mahasiswa tidak perlu berpindah-pindah menu hanya untuk mencatat pengeluaran jajan atau makan.

2. **Integrasi Otomatis Uang Bulanan dari Transaksi Pemasukan:**
   - *Alasan:* Alih-alih membuat form pengaturan uang bulanan terpisah yang merepotkan, uang bulanan langsung ditarik otomatis dari input pemasukan berkategori **"Uang Bulanan"**. Pemasukan non-bulanan (sampingan/jualan) tetap menambah saldo keseluruhan tanpa mengacaukan perhitungan jatah harian.

3. **Format Currency Interaktif & Validasi Inline (Tanpa Alert Browser):**
   - *Alasan:* Pengguna langsung melihat format ribuan bertitik (`15.000,-`) saat mengetik, dan pesan error muncul tepat di bawah input yang salah. Menggunakan alert bawaan browser terasa kuno dan mengganggu kenyamanan pengguna.

---

## 4. Kendala / Bug yang Ditemui & Solusinya

### Bug 1: Perhitungan Jatah Harian Berfluktuasi Saat Hari Berganti
- **Kendala:** Awalnya, jatah harian dihitung dengan membagi sisa uang terhadap sisa hari yang terus berkurang (`sisaUang / sisaHari`). Akibatnya, nilai patokan jatah harian berubah-ubah secara drastis setiap kali hari berganti atau saat mencatat transaksi di tanggal berbeda.
- **Ekspektasi:** Jatah harian seharusnya bernilai **statis** sebagai batas aman harian (`uangBulanan / 30`), namun tetap **dinamis** jika ada input transaksi uang bulanan baru (misalnya kiriman bertambah di bulan baru).
- **Solusi:** Mengubah rumus kalkulasi pada fungsi `hitungJatahHarian()`:
  $$\text{Jatah Harian} = \left\lfloor \frac{\text{Uang Bulanan}}{30} \right\rfloor$$
  Sedangkan variabel sisa hari (`sisaHari`) tetap berjalan dinamis berdasarkan selisih tanggal transaksi terhadap tanggal uang bulanan diterima untuk menghitung countdown waktu bertahan.

---

### Bug 2: Tombol Reset Filter Tidak Mengembalikan Dropdown Kategori
- **Kendala:** Saat tombol "Reset Filter" ditekan, input pencarian teks dan tanggal berhasil dibersihkan, tetapi dropdown kategori tidak kembali ke opsi `"Semua Kategori"` jika sebelumnya pengguna sudah memilih kategori tertentu (misal: *"Makan"*).
- **Penyebab:** Fungsi pembaruan opsi kategori filter selalu berusaha mempertahankan nilai kategori yang sebelumnya dipilih (`nilaiSebelumnya`).
- **Solusi:** Menambahkan parameter `resetKeDefault = true` pada fungsi `perbaruiOpsiFilterKategori()`. Saat tombol reset filter ditekan, seluruh form filter (pencarian, rentang tanggal, jenis transaksi, dan kategori) dipaksa kembali ke nilai awal (`semua` / string kosong), lalu memanggil `renderDaftar()` sehingga seluruh transaksi kembali ditampilkan.