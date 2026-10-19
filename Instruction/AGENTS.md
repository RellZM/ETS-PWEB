# AGENTS.md

Project: ETS Pemrograman Web, Personal Money Management (persona **mahasiswa kos**).
Rencana lengkap ada di `PLAN.md`. Ikuti urutan tahapnya.

## Aturan teknis

- Hanya HTML, CSS, vanilla JavaScript, localStorage. **Tanpa framework/library.**
- File: `index.html`, `style.css`, `app.js`.
- Data = array objek (`JSON.stringify` / `JSON.parse`). `id` unik, `nominal` bertipe number.
- Kode dipecah jadi fungsi kecil bernama jelas (lihat tabel fungsi di `PLAN.md`).
- Tidak boleh ada error di console.
- Jaga kode tetap sederhana dan mudah dijelaskan; user harus bisa menjelaskan semua baris saat evaluasi lisan.
- Singkat jelaskan fungsi apa yang kamu buat dan kenapa, bukan cuma kasih kode jadi.

## WAJIB: isi `AI-LOG.md` setiap kali mengerjakan tugas agentic

Setiap tugas yang **membuat atau mengubah kode**, **sebelum menyatakan selesai** (dan sebelum commit), tambahkan satu entri baru di **akhir** `AI-LOG.md` dengan format ini:

```md
## <nama fitur / tugas singkat>
- Prompt: “<ringkasan prompt user yang memicu tugas ini, pakai kata-kata user>”
- Dipakai: <fungsi/bagian kode yang ditambah atau diubah> di <nama file>
- Diubah: <apa yang user ubah/perbaiki dari hasil AI>
```

Aturan isi:

1. **Prompt**: ringkas tapi setia ke permintaan asli user. Jangan diganti dengan prompt versi rapi buatanmu sendiri.
2. **Dipakai**: sebut nama fungsi dan file yang benar-benar ada di kode. Log harus cocok dengan kode.
3. **Diubah**: isi hanya kalau memang ada revisi nyata, misalnya user minta perbaikan di sesi yang sama, atau kamu memperbaiki bug hasil awalmu sendiri (jelaskan bug-nya). Kalau belum ada, tulis `_(diisi user setelah review)_`. **Jangan mengarang.**
4. Satu tugas = satu entri. Kalau ada beberapa putaran revisi di tugas yang sama, perbarui entri tugas itu, bukan bikin entri baru.
5. Jangan menghapus atau menulis ulang entri lama. Hanya tambah di akhir.
6. Sertakan `AI-LOG.md` di commit yang sama dengan kodenya.
7. Kalau tugas hanya penjelasan/diskusi tanpa kode, tidak perlu entri.

## Commit

Commit di tiap checkpoint (lihat `PLAN.md`), pesan menjelaskan apa yang dikerjakan, contoh:
`W1–W4: form tambah dan simpan ke localStorage`. Jangan satu commit besar di akhir.
