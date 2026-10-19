# PLAN: Personal Money Management — Persona Mahasiswa Kos

> Hackathon: Senin, 19 Okt 2026, 15.30–18.30. **Submit link di Classroom paling lambat 18.15.**
> Stack: HTML + CSS + vanilla JS + localStorage. Dikerjakan individu.
> "Week 1-4" dan "week 5-6" di plan ini = **W1–W4** dan **W5–W6** di requirement (bukan minggu kalender).

## Persona

**Mahasiswa kos**: dapat uang bulanan tetap dari orang tua, sering habis sebelum akhir bulan.

**Fitur khas (wajib):**
1. Input uang bulanan
2. Jatah harian = sisa uang ÷ sisa hari di bulan berjalan
3. Peringatan kalau pengeluaran hari ini melebihi jatah

> README: tulis 2–3 kalimat soal persona + masalahnya **pakai kata-kata sendiri**.

---

## Rancangan Data (kunci dulu, baru coding)

**`localStorage["pmm_transaksi"]`** — array of object:

```js
{
  id: 1739251200000,        // Date.now(), unik
  tanggal: "2026-10-19",    // YYYY-MM-DD
  jenis: "pengeluaran",     // "pemasukan" | "pengeluaran"
  kategori: "Makan",
  nominal: 25000,           // NUMBER, bukan teks Rupiah
  catatan: "Nasi goreng"    // opsional
}
```

**`localStorage["pmm_pengaturan"]`**:

```js
{ uangBulanan: 1500000 }
```

**Kategori tetap:** Makan, Transport, Kos, Kuliah, Hiburan, Lainnya (min. 4 ✔)

**Rumus jatah harian (keputusan desain, tulis di PROSES.md):**

```
sisaUang   = uangBulanan + pemasukan bulan ini − pengeluaran SEBELUM hari ini
sisaHari   = jumlahHariBulanIni − tanggalHariIni + 1     // hari ini ikut dihitung
jatah      = Math.floor(sisaUang / sisaHari)
peringatan = pengeluaranHariIni > jatah
```

Pengeluaran hari ini sengaja **tidak** masuk `sisaUang` supaya jatah stabil seharian dan tidak kehitung dua kali.

**Struktur file:** `index.html`, `style.css`, `app.js`, `README.md`, `AI-LOG.md`, `PROSES.md`, `PLAN.md`, `AGENTS.md`

**Fungsi inti (`app.js`):**

| Fungsi | Tugas |
| --- | --- |
| `muatData()` / `simpanData()` | `JSON.parse` / `JSON.stringify` ke localStorage |
| `validasiForm()` | cek field wajib + nominal > 0, tampil error di halaman |
| `tambahTransaksi()` / `hapusTransaksi(id)` | `push` / `filter` + simpan + render ulang |
| `formatRupiah(n)` | angka → "Rp 25.000" |
| `renderDaftar()` | render list dari array, terbaru di atas |
| `hitungRingkasan()` / `renderRingkasan()` | `reduce` pemasukan, pengeluaran, saldo |
| `hitungJatahHarian()` | rumus di atas |
| `cekPeringatan()` | banding pengeluaran hari ini vs jatah |
| `renderSemua()` | panggil semua render setelah data berubah |

---

## Tahap 1: W1–W4 (target ±15.30–16.30, 1 jam pertama)

**Setup (10 menit pertama)**
- [ ] Ambil undian persona → mahasiswa kos
- [ ] Buat repo GitHub **publik** (setelah sesi mulai) + aktifkan GitHub Pages **dari awal**
- [ ] Taruh `AGENTS.md`, `AI-LOG.md`, `PLAN.md` ke repo
- [ ] Skeleton `index.html`, `style.css`, `app.js` (tanpa error console)

**Fitur**
- [ ] **W1** Form tambah transaksi: tanggal, jenis, kategori (select, min 4), nominal, catatan opsional
- [ ] **W2** Daftar transaksi dirender dari array JS, terbaru di atas, nominal format Rupiah
- [ ] **W3** Hapus transaksi dengan `confirm()` sebelum hapus
- [ ] **W4** Persisten: `simpanData()` setiap perubahan, `muatData()` saat load

**Checkpoint 1**
- [ ] Refresh browser, data tetap ada
- [ ] Console bersih
- [ ] Commit: `W1–W4: form tambah, daftar, hapus, simpan ke localStorage`
- [ ] `AI-LOG.md` sudah terisi untuk semua kode hasil AI

---

## Tahap 2: W5–W6 + Fitur Khas (target ±16.30–17.30)

**Fitur**
- [ ] **W5** Ringkasan (total pemasukan, pengeluaran, saldo), auto update tiap data berubah
- [ ] **W6** Validasi: field wajib terisi, nominal > 0, pesan error tampil di halaman (bukan cuma `alert()`)
- [ ] **F1** Input uang bulanan → simpan di `pmm_pengaturan`
- [ ] **F2** Tampilkan jatah harian dari `hitungJatahHarian()` (pakai data transaksi yang sama)
- [ ] **F3** Peringatan visual kalau pengeluaran hari ini > jatah

**Cek edge case**
- [ ] Uang bulanan belum diisi → tampil pesan, tidak `NaN`
- [ ] Hari terakhir bulan (sisaHari = 1)
- [ ] Sisa uang negatif → jatah 0, peringatan tetap jalan
- [ ] Transaksi bulan lain tidak ikut hitungan jatah

**Checkpoint 2**
- [ ] Coba skenario: isi uang bulanan → tambah pengeluaran besar hari ini → peringatan muncul
- [ ] Commit: `W5–W6 + fitur khas: ringkasan, validasi, jatah harian, peringatan`
- [ ] `AI-LOG.md` update

---

## Tahap 3: Fitur Bonus (target ±17.30–18.00, sisakan buffer sampai 18.15)

Minimal **3 bonus berfungsi** biar nilai penuh. Urutan dari paling murah:

- [ ] **B1** Responsif 360px (CSS: flex/grid, `@media`, cek di DevTools)
- [ ] **B2** Edit transaksi (isi ulang form dari `id`, `map` untuk update)
- [ ] **B3** Filter jenis/kategori/rentang tanggal + cari kata kunci di catatan (`filter`)
- [ ] **B4** Ekspor/impor JSON (`Blob` + `FileReader`)
- [ ] **B5** Budget per kategori + peringatan mendekati/melewati batas

**Checkpoint 3 (final)**
- [ ] Commit: `Bonus: <fitur yang selesai>`
- [ ] Console bersih, tes di GitHub Pages (bukan cuma lokal)

---

## Pengumpulan (deadline 18.15)

- [ ] `README.md`: nama + NRP, persona, fitur selesai (W1–W6, khas, bonus), fitur belum selesai
- [ ] `AI-LOG.md` + `PROSES.md` terisi
- [ ] `PROSES.md`: persona, rancangan data, 1 keputusan desain + alasan, **min. 2 bug/kendala** + solusinya
- [ ] Link repo + link GitHub Pages dikumpulkan di Classroom

> Commit setelah 18.30 tidak dinilai. Jangan perbaiki apa pun setelah batas waktu.

---

## Persiapan Evaluasi Lisan (26–30 Okt, 70% nilai)

Tanpa AI dan tanpa internet. Pastikan bisa jelaskan tanpa lihat catatan:

- [ ] Alur: klik Simpan → `validasiForm` → `push` → `simpanData` → `renderSemua` → tampil di daftar
- [ ] Di mana data dibaca ulang saat refresh (`muatData` + `JSON.parse`)
- [ ] Apa yang terjadi kalau `JSON.parse` dihapus / nominal disimpan sebagai teks
- [ ] Event listener, manipulasi DOM, `push`/`filter`/`map`/`reduce`
- [ ] Latihan ubah kecil tanpa AI: tambah kategori, tampilkan jumlah transaksi, urutkan dari terlama, nominal pengeluaran warna merah
- [ ] Bisa jelaskan **kenapa** tiap bagian hasil AI diubah (lihat `AI-LOG.md`)
