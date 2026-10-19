/**
 * app.js - Personal Money Management (Mahasiswa Kos)
 * Tahap 1 (W1 - W4):
 * - W1: Form tambah transaksi (tanggal, jenis, kategori, nominal, catatan)
 * - W2: Daftar transaksi dirender dari array JS (terbaru di atas, format Rupiah)
 * - W3: Hapus transaksi dengan confirm()
 * - W4: Persistensi data ke localStorage (muatData & simpanData)
 */

// State utama: array penampung data transaksi
let transaksi = [];

// Daftar pilihan kategori yang dipisahkan berdasarkan jenis transaksi
const KATEGORI_OPSI = {
  pengeluaran: ["Makan", "Jajan", "Menabung", "Parkir", "Biaya Bulanan"],
  pemasukan: ["Uang Bulanan", "Uang Sampingan", "Jualan"]
};

/**
 * Memperbarui pilihan dropdown kategori berdasarkan jenis transaksi (pengeluaran vs pemasukan).
 * @param {string} kategoriTerpilih - Kategori yang ingin langsung dipilih (opsional)
 */
function perbaruiOpsiKategori(kategoriTerpilih = "") {
  const selectJenis = document.getElementById("jenis");
  const selectKategori = document.getElementById("kategori");
  if (!selectJenis || !selectKategori) return;

  const jenis = selectJenis.value;
  const daftarKategori = KATEGORI_OPSI[jenis] || [];

  selectKategori.innerHTML = '<option value="" disabled selected>Pilih Kategori</option>';

  daftarKategori.forEach((kat) => {
    const option = document.createElement("option");
    option.value = kat;
    option.textContent = kat;
    if (kat === kategoriTerpilih) {
      option.selected = true;
    }
    selectKategori.appendChild(option);
  });
}

// 1. Fungsi Persistensi Data (W4)
// ==========================================

/**
 * Mengambil data transaksi dari localStorage.
 * Mengembalikan array transaksi yang sudah di-parse, atau array kosong jika belum ada data.
 */
function muatData() {
  const dataTersimpan = localStorage.getItem("pmm_transaksi");
  if (dataTersimpan) {
    try {
      return JSON.parse(dataTersimpan);
    } catch (e) {
      console.error("Gagal mengurai data dari localStorage", e);
      return [];
    }
  }
  return [];
}

/**
 * Menyimpan array transaksi saat ini ke localStorage dalam bentuk JSON string.
 */
function simpanData() {
  localStorage.setItem("pmm_transaksi", JSON.stringify(transaksi));
}

// ==========================================
// 2. Fungsi Utilitas & Format (W2)
// ==========================================

/**
 * Mengubah angka nominal menjadi format Rupiah Indonesia (contoh: 25000 -> "Rp 25.000").
 * @param {number} nominal - Angka nominal
 * @returns {string} String berformat Rupiah
 */
function formatRupiah(nominal) {
  return "Rp " + Number(nominal).toLocaleString("id-ID");
}

/**
 * Mendapatkan tanggal hari ini dalam format YYYY-MM-DD untuk default input form.
 */
function dapatkanTanggalHariIni() {
  const hariIni = new Date();
  const tahun = hariIni.getFullYear();
  const bulan = String(hariIni.getMonth() + 1).padStart(2, "0");
  const tanggal = String(hariIni.getDate()).padStart(2, "0");
  return `${tahun}-${bulan}-${tanggal}`;
}



// ==========================================
// 3. Fungsi Tambah & Hapus Transaksi (W1, W3, W4)
// ==========================================

/**
 * Menangani submit form untuk menambahkan transaksi baru ke state dan localStorage.
 * @param {Event} event - Event submit form
 */
function tambahTransaksi(event) {
  event.preventDefault();

  const inputTanggal = document.getElementById("tanggal");
  const selectJenis = document.getElementById("jenis");
  const selectKategori = document.getElementById("kategori");
  const inputNominal = document.getElementById("nominal");
  const inputCatatan = document.getElementById("catatan");

  const nominalAngka = Number(inputNominal.value);

  // Validasi sederhana: pastikan nominal lebih dari 0
  if (nominalAngka <= 0) {
    alert("Nominal harus lebih besar dari 0");
    return;
  }

  // Membuat objek transaksi baru
  const transaksiBaru = {
    id: Date.now(), // ID unik menggunakan timestamp
    tanggal: inputTanggal.value,
    jenis: selectJenis.value,
    kategori: selectKategori.value,
    nominal: nominalAngka, // Disimpan sebagai NUMBER
    catatan: inputCatatan.value.trim()
  };

  // Tambah ke array state
  transaksi.push(transaksiBaru);

  // Simpan ke localStorage
  simpanData();

  // Reset form ke nilai awal
  inputNominal.value = "";
  inputCatatan.value = "";
  inputTanggal.value = dapatkanTanggalHariIni();
  perbaruiOpsiKategori();

  // Render ulang tampilan daftar
  renderSemua();
}

/**
 * Menghapus transaksi berdasarkan ID unik setelah konfirmasi user.
 * @param {number} id - ID transaksi yang akan dihapus
 */
function hapusTransaksi(id) {
  const yakin = confirm("Apakah Anda yakin ingin menghapus transaksi ini?");
  if (!yakin) {
    return;
  }

  // Filter untuk membuang transaksi dengan id terpilih
  transaksi = transaksi.filter((item) => item.id !== id);

  // Simpan perubahan ke localStorage
  simpanData();

  // Render ulang tampilan
  renderSemua();
}

// ==========================================
// 4. Fungsi Render Tampilan (W2)
// ==========================================

/**
 * Menampilkan daftar transaksi ke elemen DOM.
 * Data diurutkan dari yang terbaru di paling atas.
 */
function renderDaftar() {
  const kontainer = document.getElementById("kontainer-daftar");
  const badgeTotal = document.getElementById("total-transaksi-badge");

  if (!kontainer) return;

  // Update badge jumlah transaksi
  if (badgeTotal) {
    badgeTotal.textContent = `${transaksi.length} Transaksi`;
  }

  // Kosongkan kontainer terlebih dahulu
  kontainer.innerHTML = "";

  // Tampilkan pesan kosong jika belum ada transaksi
  if (transaksi.length === 0) {
    kontainer.innerHTML = `
      <div class="empty-state">
        <p>Belum ada transaksi yang dicatat.</p>
        <p style="font-size: 0.85rem; margin-top: 4px;">Gunakan form di samping untuk mulai mencatat pengeluaran atau pemasukan.</p>
      </div>
    `;
    return;
  }

  // Urutkan transaksi dari yang terbaru (tanggal terbaru / id terbaru di atas)
  const transaksiTerurut = [...transaksi].sort((a, b) => {
    if (a.tanggal !== b.tanggal) {
      return b.tanggal.localeCompare(a.tanggal);
    }
    return b.id - a.id;
  });

  // Render setiap item transaksi
  transaksiTerurut.forEach((item) => {
    const itemCard = document.createElement("div");
    itemCard.className = "transaction-item";

    const isPengeluaran = item.jenis === "pengeluaran";
    const tipeClass = isPengeluaran ? "type-pengeluaran" : "type-pemasukan";
    const amountClass = isPengeluaran ? "amount-pengeluaran" : "amount-pemasukan";
    const tanda = isPengeluaran ? "-" : "+";

    // Item header dan metadata
    const infoCatatan = item.catatan ? ` • <span class="item-note">${escapeHtml(item.catatan)}</span>` : "";

    itemCard.innerHTML = `
      <div class="item-left">
        <div class="item-header">
          <span class="item-category">${escapeHtml(item.kategori)}</span>
          <span class="item-type-badge ${tipeClass}">${item.jenis}</span>
        </div>
        <div class="item-meta">
          <span>${item.tanggal}</span>${infoCatatan}
        </div>
      </div>
      <div class="item-right">
        <span class="item-amount ${amountClass}">
          ${tanda} ${formatRupiah(item.nominal)}
        </span>
        <button type="button" class="btn-delete" title="Hapus transaksi">Hapus</button>
      </div>
    `;

    // Pasang event listener untuk tombol hapus
    const btnHapus = itemCard.querySelector(".btn-delete");
    btnHapus.addEventListener("click", () => {
      hapusTransaksi(item.id);
    });

    kontainer.appendChild(itemCard);
  });
}

/**
 * Utilitas untuk mengamankan teks dari karakter berbahaya (mencegah XSS sederhana).
 */
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Memanggil seluruh fungsi render untuk memperbarui UI setelah data berubah.
 */
function renderSemua() {
  renderDaftar();
}

// ==========================================
// 5. Inisialisasi Saat Halaman Dimuat
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  // Set default input tanggal ke hari ini
  const inputTanggal = document.getElementById("tanggal");
  if (inputTanggal) {
    inputTanggal.value = dapatkanTanggalHariIni();
  }

  // Muat data dari localStorage
  transaksi = muatData();

  // Daftarkan listener form submit
  const formTransaksi = document.getElementById("form-transaksi");
  if (formTransaksi) {
    formTransaksi.addEventListener("submit", tambahTransaksi);
  }

  // Daftarkan listener saat jenis transaksi berubah (Pengeluaran <-> Pemasukan)
  const selectJenis = document.getElementById("jenis");
  if (selectJenis) {
    selectJenis.addEventListener("change", () => {
      perbaruiOpsiKategori();
    });
  }

  // Isi dropdown kategori sesuai jenis yang aktif pertama kali
  perbaruiOpsiKategori();



  // Render tampilan awal
  renderSemua();
});
