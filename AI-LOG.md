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
- Link conversation = https://claude.ai/share/668d1d85-6174-4270-a529-2a7967b3180d

## Tahap 1: W1–W4 (Form Tambah, Daftar Transaksi, Hapus, dan LocalStorage)
- Prompt: “oke untuk tahap pertama tolong untuk membuat week 1 = kategori beri makan, jajan, menabung, parkir, biaya bulanan kerjakan tahap 1 aja dulu”
- Dipakai: form dan kontainer daftar di `index.html`; styling layout dan komponen di `style.css`; fungsi `muatData`, `simpanData`, `formatRupiah`, `dapatkanTanggalHariIni`, `tambahTransaksi`, `hapusTransaksi`, `renderDaftar`, `escapeHtml`, dan `renderSemua` di `app.js`
- Diubah: _(diisi user setelah review)_

## Pemisahan Kategori Pemasukan & Pengeluaran
- Prompt: “tolong pisahkan kategori di pemasukan dan pengeluaran untuk pemasukan bisa dengan uang bulanan, uang sampingan, jualan. untuk kategori dihapus saja”
- Dipakai: elemen `<select id="kategori">` di `index.html`; konstanta `KATEGORI_OPSI`, fungsi `perbaruiOpsiKategori`, dan event listener `change` pada elemen jenis di `app.js`
- Diubah: kategori pengeluaran dan pemasukan dipisahkan secara dinamis sesuai pilihan jenis transaksi, serta opsi kategori "Lainnya" dihapus



