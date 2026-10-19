/**
 * app.js - Personal Money Management (Mahasiswa Kos)
 * Tahap 1 (W1 - W4) & Tahap 2 (W5 - W6 + Fitur Khas):
 * - W1: Form tambah transaksi
 * - W2: Daftar transaksi dirender dari array JS
 * - W3: Hapus transaksi dengan konfirmasi
 * - W4: Persistensi ke localStorage
 * - W5: Ringkasan keuangan (Saldo, Total Pemasukan, Total Pengeluaran)
 * - W6: Validasi form inline (pesan error di halaman)
 * - F1: Input dan pengaturan uang bulanan (pmm_pengaturan)
 * - F2: Perhitungan jatah harian dinamis
 * - F3: Peringatan visual pengeluaran harian vs jatah
 */

// State utama
let transaksi = [];
let pengaturan = { uangBulanan: 0 };

// Daftar pilihan kategori yang dipisahkan berdasarkan jenis transaksi
const KATEGORI_OPSI = {
  pengeluaran: ["Makan", "Jajan", "Menabung", "Parkir", "Biaya Bulanan"],
  pemasukan: ["Uang Bulanan", "Uang Sampingan", "Jualan"]
};

// ==========================================
// 1. Fungsi Persistensi Data (W4, F1)
// ==========================================

/**
 * Mengambil data transaksi dari localStorage.
 * Mengembalikan array transaksi atau array kosong jika belum ada data.
 */
function muatData() {
  const dataTersimpan = localStorage.getItem("pmm_transaksi");
  if (dataTersimpan) {
    try {
      return JSON.parse(dataTersimpan);
    } catch (e) {
      console.error("Gagal mengurai transaksi dari localStorage", e);
      return [];
    }
  }
  return [];
}

/**
 * Menyimpan array transaksi saat ini ke localStorage.
 */
function simpanData() {
  localStorage.setItem("pmm_transaksi", JSON.stringify(transaksi));
}

/**
 * Mengambil data pengaturan uang bulanan dari localStorage.
 */
function muatPengaturan() {
  const pengaturanTersimpan = localStorage.getItem("pmm_pengaturan");
  if (pengaturanTersimpan) {
    try {
      const parsed = JSON.parse(pengaturanTersimpan);
      return { uangBulanan: Number(parsed.uangBulanan) || 0 };
    } catch (e) {
      console.error("Gagal mengurai pengaturan dari localStorage", e);
      return { uangBulanan: 0 };
    }
  }
  return { uangBulanan: 0 };
}

/**
 * Menyimpan data pengaturan uang bulanan ke localStorage.
 */
function simpanPengaturan(data) {
  localStorage.setItem("pmm_pengaturan", JSON.stringify(data));
}

// ==========================================
// 2. Utilitas & Formatting
// ==========================================

/**
 * Mengubah angka menjadi format Rupiah Indonesia (contoh: 25000 -> "Rp 25.000").
 * @param {number} nominal - Angka nominal
 * @returns {string} String format Rupiah
 */
function formatRupiah(nominal) {
  return "Rp " + Number(nominal).toLocaleString("id-ID");
}

/**
 * Mendapatkan tanggal sistem hari ini dalam format YYYY-MM-DD.
 */
function dapatkanTanggalHariIni() {
  const hariIni = new Date();
  const tahun = hariIni.getFullYear();
  const bulan = String(hariIni.getMonth() + 1).padStart(2, "0");
  const tanggal = String(hariIni.getDate()).padStart(2, "0");
  return `${tahun}-${bulan}-${tanggal}`;
}

/**
 * Mengekstrak angka murni dari string format currency.
 * Contoh: "25.000,-" -> 25000
 */
function dapatkanNominalAngka(str) {
  if (!str) return 0;
  const angkaSaja = String(str).replace(/\D/g, "");
  return Number(angkaSaja) || 0;
}

/**
 * Memformat string angka ke format currency dengan titik ribuan dan akhiran ',-'
 * Contoh: "25000" -> "25.000,-"
 */
function formatInputCurrency(nilaiStr) {
  const angkaSaja = String(nilaiStr).replace(/\D/g, "");
  if (!angkaSaja) return "";
  return Number(angkaSaja).toLocaleString("id-ID") + ",-";
}

/**
 * Mengamankan teks dari karakter HTML berbahaya (mencegah XSS).
 */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Memperbarui pilihan dropdown kategori berdasarkan jenis transaksi.
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

// ==========================================
// 3. Validasi Form (W6)
// ==========================================

/**
 * Memvalidasi form input transaksi secara menyeluruh dan menampilkan pesan error di UI.
 * @returns {boolean} True jika semua field valid
 */
function validasiForm() {
  let isValid = true;

  const inputTanggal = document.getElementById("tanggal");
  const selectJenis = document.getElementById("jenis");
  const selectKategori = document.getElementById("kategori");
  const inputNominal = document.getElementById("nominal");

  const errorTanggal = document.getElementById("error-tanggal");
  const errorJenis = document.getElementById("error-jenis");
  const errorKategori = document.getElementById("error-kategori");
  const errorNominal = document.getElementById("error-nominal");

  // Validasi Tanggal
  if (!inputTanggal.value) {
    inputTanggal.classList.add("input-error");
    if (errorTanggal) errorTanggal.textContent = "Tanggal transaksi wajib diisi.";
    isValid = false;
  } else {
    inputTanggal.classList.remove("input-error");
    if (errorTanggal) errorTanggal.textContent = "";
  }

  // Validasi Jenis
  if (!selectJenis.value) {
    selectJenis.classList.add("input-error");
    if (errorJenis) errorJenis.textContent = "Jenis transaksi wajib dipilih.";
    isValid = false;
  } else {
    selectJenis.classList.remove("input-error");
    if (errorJenis) errorJenis.textContent = "";
  }

  // Validasi Kategori
  if (!selectKategori.value) {
    selectKategori.classList.add("input-error");
    if (errorKategori) errorKategori.textContent = "Kategori wajib dipilih.";
    isValid = false;
  } else {
    selectKategori.classList.remove("input-error");
    if (errorKategori) errorKategori.textContent = "";
  }

  // Validasi Nominal
  const nominalAngka = dapatkanNominalAngka(inputNominal.value);
  if (!inputNominal.value.trim() || nominalAngka <= 0) {
    inputNominal.classList.add("input-error");
    if (errorNominal) errorNominal.textContent = "Nominal harus diisi dan lebih besar dari Rp 0.";
    isValid = false;
  } else {
    inputNominal.classList.remove("input-error");
    if (errorNominal) errorNominal.textContent = "";
  }

  return isValid;
}


// ==========================================
// 4. Logika Transaksi & Pengaturan (W1, W3, F1)
// ==========================================

/**
 * Menangani submit penambahan transaksi baru.
 */
function tambahTransaksi(event) {
  event.preventDefault();

  if (!validasiForm()) {
    return;
  }

  const inputTanggal = document.getElementById("tanggal");
  const selectJenis = document.getElementById("jenis");
  const selectKategori = document.getElementById("kategori");
  const inputNominal = document.getElementById("nominal");
  const inputCatatan = document.getElementById("catatan");

  const nominalAngka = dapatkanNominalAngka(inputNominal.value);

  const transaksiBaru = {
    id: Date.now(),
    tanggal: inputTanggal.value,
    jenis: selectJenis.value,
    kategori: selectKategori.value,
    nominal: nominalAngka, // Disimpan sebagai NUMBER
    catatan: inputCatatan.value.trim()
  };

  transaksi.push(transaksiBaru);
  simpanData();

  // Reset Form
  inputNominal.value = "";
  inputCatatan.value = "";
  inputTanggal.value = dapatkanTanggalHariIni();
  perbaruiOpsiKategori();

  // Bersihkan kelas error jika ada
  inputNominal.classList.remove("input-error");
  selectKategori.classList.remove("input-error");

  renderSemua();
}

/**
 * Menghapus transaksi berdasarkan ID unik dengan konfirmasi pengguna.
 */
function hapusTransaksi(id) {
  const yakin = confirm("Apakah Anda yakin ingin menghapus transaksi ini?");
  if (!yakin) return;

  transaksi = transaksi.filter((item) => item.id !== id);
  simpanData();
  renderSemua();
}


// ==========================================
// 5. Perhitungan & Render (W5, F2, F3)
// ==========================================

/**
 * W5: Menghitung ringkasan total pemasukan, pengeluaran, dan saldo.
 */
function hitungRingkasan() {
  const totalPemasukan = transaksi
    .filter((item) => item.jenis === "pemasukan")
    .reduce((total, item) => total + item.nominal, 0);

  const totalPengeluaran = transaksi
    .filter((item) => item.jenis === "pengeluaran")
    .reduce((total, item) => total + item.nominal, 0);

  // Saldo saat ini: Total semua pemasukan (termasuk Uang Bulanan & Sampingan) - Total pengeluaran
  const saldo = totalPemasukan - totalPengeluaran;

  return { totalPemasukan, totalPengeluaran, saldo };
}

/**
 * W5: Menampilkan ringkasan keuangan ke elemen DOM.
 */
function renderRingkasan() {
  const { totalPemasukan, totalPengeluaran, saldo } = hitungRingkasan();

  const elSaldo = document.getElementById("ringkasan-saldo");
  const elPemasukan = document.getElementById("ringkasan-pemasukan");
  const elPengeluaran = document.getElementById("ringkasan-pengeluaran");

  if (elSaldo) {
    elSaldo.textContent = formatRupiah(saldo);
    // Jika saldo minus, beri warna merah
    elSaldo.style.color = saldo < 0 ? "var(--expense-color)" : "#0f172a";
  }
  if (elPemasukan) {
    elPemasukan.textContent = formatRupiah(totalPemasukan);
  }
  if (elPengeluaran) {
    elPengeluaran.textContent = formatRupiah(totalPengeluaran);
  }
}

/**
 * Mengambil nominal uang bulanan dengan aturan:
 * - Cek input pemasukan kategori "Uang Bulanan" terbaru (urut tanggal & id descending).
 * - Jika ada pemasukan bulanan terbaru -> ambil yang terbaru dan simpan ke pengaturan.
 * - Jika tidak ada pemasukan baru -> stay di data uang bulanan yang lama (dari pengaturan).
 */
function dapatkanUangBulananTerbaru() {
  const daftarBulanan = transaksi
    .filter((item) => item.jenis === "pemasukan" && item.kategori === "Uang Bulanan")
    .sort((a, b) => {
      if (a.tanggal !== b.tanggal) {
        return b.tanggal.localeCompare(a.tanggal); // terbaru di atas
      }
      return b.id - a.id;
    });

  if (daftarBulanan.length > 0) {
    const transaksiTerbaru = daftarBulanan[0];
    pengaturan.uangBulanan = transaksiTerbaru.nominal;
    simpanPengaturan(pengaturan);
    return {
      nominal: transaksiTerbaru.nominal,
      sumber: "terbaru",
      tanggal: transaksiTerbaru.tanggal
    };
  }

  // Jika tidak ada transaksi kategori Uang Bulanan sama sekali, gunakan pengaturan lama jika ada
  if (pengaturan.uangBulanan && pengaturan.uangBulanan > 0) {
    return {
      nominal: pengaturan.uangBulanan,
      sumber: "lama",
      tanggal: null
    };
  }

  return {
    nominal: 0,
    sumber: "kosong",
    tanggal: null
  };
}

/**
 * F2: Menghitung Jatah Harian Mahasiswa Kos.
 * Aturan:
 * - Siklus anggaran diasumsikan bertahan untuk 30 hari sejak uang bulanan diterima.
 * - Jatah harian bersifat STATIS terhadap pergantian sisa hari (selalu dibagi durasi siklus 30 hari),
 *   namun bersifat DINAMIS terhadap input uang bulanan terbaru.
 *   Rumus: jatah = Math.floor(uangBulanan / 30).
 * - Sisa hari bertahan dihitung mundur dari 30 hari berdasarkan selisih tanggal pengeluaran terbaru vs tanggal uang bulanan.
 * - Pengeluaran harian adalah akumulasi seluruh transaksi pengeluaran pada tanggal acuan terbaru.
 * - Checker pengeluaran membandingkan total pengeluaran harian terhadap jatah harian statis tersebut.
 */
function hitungJatahHarian() {
  const SIKLUS_HARI = 30;
  const tanggalHariIniStr = dapatkanTanggalHariIni();

  // Ambil uang bulanan: jika ada input terbaru ambil terbaru, jika tidak tetap di yang lama
  const infoUangBulanan = dapatkanUangBulananTerbaru();
  const uangBulanan = infoUangBulanan.nominal;
  const uangBulananDiatur = uangBulanan > 0;

  // Tanggal patokan uang bulanan diterima
  const tanggalBulananStr = infoUangBulanan.tanggal || tanggalHariIniStr;

  // Ambil semua transaksi pengeluaran dan urutkan dari yang terbaru
  const daftarSemuaPengeluaran = transaksi
    .filter((item) => item.jenis === "pengeluaran")
    .sort((a, b) => {
      if (a.tanggal !== b.tanggal) {
        return b.tanggal.localeCompare(a.tanggal); // terbaru di atas
      }
      return b.id - a.id;
    });

  // Tanggal acuan evaluasi pengeluaran harian:
  // Gunakan tanggal dari transaksi pengeluaran terbaru jika ada, atau tanggal hari ini jika belum ada
  const tanggalAcuanStr = daftarSemuaPengeluaran.length > 0 ? daftarSemuaPengeluaran[0].tanggal : tanggalHariIniStr;

  // Hitung selisih hari antara tanggal pengeluaran acuan vs tanggal penerimaan uang bulanan
  const dMulai = new Date(tanggalBulananStr + "T00:00:00");
  const dAcuan = new Date(tanggalAcuanStr + "T00:00:00");
  const diffWaktu = dAcuan.getTime() - dMulai.getTime();
  const selisihHari = Math.floor(diffWaktu / (1000 * 60 * 60 * 24));

  // Majukan sisa waktu bertahan sesuai selisih tanggal (jika pengeluaran terjadi setelah uang bulanan)
  // Contoh: selisih 5 hari -> sisa hari menjadi 30 - 5 = 25 hari
  const sisaHari = Math.max(1, SIKLUS_HARI - Math.max(0, selisihHari));

  // Pemasukan non-bulanan (sampingan, jualan) dalam siklus
  const pemasukanNonBulanan = transaksi
    .filter((item) => item.jenis === "pemasukan" && item.kategori !== "Uang Bulanan" && item.tanggal >= tanggalBulananStr)
    .reduce((total, item) => total + item.nominal, 0);

  // Pengeluaran SEBELUM tanggal acuan (sejak uang bulanan diterima)
  const pengeluaranSebelumHariIni = transaksi
    .filter((item) => item.jenis === "pengeluaran" && item.tanggal >= tanggalBulananStr && item.tanggal < tanggalAcuanStr)
    .reduce((total, item) => total + item.nominal, 0);

  // Seluruh input pengeluaran pada tanggal acuan (jika ada lebih dari 1 input pada hari yang sama, di-total)
  const daftarPengeluaranHariIni = transaksi.filter(
    (item) => item.jenis === "pengeluaran" && item.tanggal === tanggalAcuanStr
  );
  const pengeluaranHariIni = daftarPengeluaranHariIni.reduce((total, item) => total + item.nominal, 0);
  const jumlahInputHariIni = daftarPengeluaranHariIni.length;

  // Sisa uang untuk jatah HANYA dari uangBulanan - pengeluaranSebelumHariIni
  const sisaUang = uangBulanan - pengeluaranSebelumHariIni;

  // Jatah harian: STATIS terhadap pergantian sisa hari (tetap dibagi 30), DINAMIS terhadap input uang bulanan
  let jatah = 0;
  if (uangBulananDiatur) {
    jatah = Math.floor(uangBulanan / SIKLUS_HARI);
  }

  // Checker: apakah total pengeluaran pada tanggal tersebut melebihi jatah
  const peringatan = uangBulananDiatur && pengeluaranHariIni > jatah;
  const selisih = Math.abs(pengeluaranHariIni - jatah);

  return {
    uangBulanan,
    infoUangBulanan,
    pemasukanNonBulanan,
    uangBulananDiatur,
    tanggalAcuanStr,
    selisihHari,
    sisaHari,
    sisaUang,
    jatah,
    pengeluaranHariIni,
    jumlahInputHariIni,
    peringatan,
    selisih
  };
}

/**
 * F2 & F3: Menampilkan jatah harian, checker pengeluaran harian, dan banner peringatan visual.
 */
function renderJatahDanPeringatan() {
  const {
    uangBulanan,
    infoUangBulanan,
    pemasukanNonBulanan,
    uangBulananDiatur,
    tanggalAcuanStr,
    sisaHari,
    jatah,
    pengeluaranHariIni,
    jumlahInputHariIni,
    peringatan,
    selisih
  } = hitungJatahHarian();

  const elUangBulanan = document.getElementById("nilai-uang-bulanan");
  const elPemasukanSampingan = document.getElementById("nilai-pemasukan-sampingan");
  const elStatusBulanan = document.getElementById("status-uang-bulanan");

  const elJatahHarian = document.getElementById("nilai-jatah-harian");
  const elLabelPengeluaran = document.getElementById("label-pengeluaran-harian");
  const elPengeluaranHariIni = document.getElementById("nilai-pengeluaran-hari-ini");
  const elCheckerStatus = document.getElementById("checker-status-harian");
  const elSisaHari = document.getElementById("nilai-sisa-hari");
  const elBanner = document.getElementById("banner-peringatan");

  // Tampilkan data sumber uang bulanan
  if (elUangBulanan) {
    if (uangBulananDiatur) {
      elUangBulanan.textContent = formatRupiah(uangBulanan);
      elUangBulanan.className = "stat-value text-primary";
    } else {
      elUangBulanan.textContent = "Belum dicatat";
      elUangBulanan.className = "stat-value text-muted";
    }
  }

  if (elPemasukanSampingan) {
    elPemasukanSampingan.textContent = formatRupiah(pemasukanNonBulanan);
  }

  if (elStatusBulanan) {
    if (infoUangBulanan.sumber === "terbaru") {
      elStatusBulanan.textContent = `Terbaru (${infoUangBulanan.tanggal})`;
      elStatusBulanan.className = "stat-value text-primary";
    } else if (infoUangBulanan.sumber === "lama") {
      elStatusBulanan.textContent = "Acuan bulan sebelumnya";
      elStatusBulanan.className = "stat-value text-muted";
    } else {
      elStatusBulanan.textContent = "Pilih kategori 'Uang Bulanan'";
      elStatusBulanan.className = "stat-value text-muted";
    }
  }

  // Tampilkan nilai jatah harian (mencegah NaN jika belum dicatat)
  if (elJatahHarian) {
    if (!uangBulananDiatur) {
      elJatahHarian.textContent = "Belum ada Uang Bulanan";
      elJatahHarian.className = "stat-value text-muted";
    } else {
      elJatahHarian.textContent = formatRupiah(jatah);
      elJatahHarian.className = "stat-value text-primary";
    }
  }

  // Tampilkan label tanggal pengeluaran yang dievaluasi
  const labelHari = (tanggalAcuanStr === dapatkanTanggalHariIni()) ? "Hari Ini" : tanggalAcuanStr;
  if (elLabelPengeluaran) {
    elLabelPengeluaran.textContent = `Total Pengeluaran (${labelHari}):`;
  }

  // Tampilkan total seluruh pengeluaran pada tanggal acuan beserta jumlah input
  if (elPengeluaranHariIni) {
    const infoInput = jumlahInputHariIni > 0 ? ` (${jumlahInputHariIni} input)` : " (0 input)";
    elPengeluaranHariIni.textContent = `${formatRupiah(pengeluaranHariIni)}${infoInput}`;
  }

  // Checker pengeluaran harian vs jatah
  if (elCheckerStatus) {
    if (!uangBulananDiatur) {
      elCheckerStatus.innerHTML = `<span class="badge badge-info">Belum ada acuan</span>`;
    } else if (peringatan) {
      elCheckerStatus.innerHTML = `<span class="badge badge-danger">⚠️ Melebihi jatah (+${formatRupiah(selisih)})</span>`;
    } else if (pengeluaranHariIni > 0) {
      elCheckerStatus.innerHTML = `<span class="badge badge-success">✅ Masih aman (Sisa ${formatRupiah(selisih)})</span>`;
    } else {
      elCheckerStatus.innerHTML = `<span class="badge badge-success">✅ Belum ada pengeluaran</span>`;
    }
  }

  // Tampilkan sisa waktu bertahan (siklus 30 hari yang sudah dimajukan)
  if (elSisaHari) {
    elSisaHari.textContent = `${sisaHari} hari tersisa`;
  }

  // F3: Render Banner Peringatan Visual
  if (elBanner) {
    if (!uangBulananDiatur) {
      elBanner.className = "warning-banner banner-info";
      elBanner.innerHTML = `
        <span>ℹ️ <strong>Tips Anak Kos:</strong> Belum ada transaksi pemasukan kategori <strong>Uang Bulanan</strong>. Masukkan di form transaksi agar jatah harian survive 30 hari otomatis dihitung.</span>
      `;
    } else if (peringatan) {
      elBanner.className = "warning-banner banner-danger";
      elBanner.innerHTML = `
        <span>⚠️ <strong>Peringatan Boros!</strong> Total pengeluaran ${labelHari} (${formatRupiah(pengeluaranHariIni)} dari ${jumlahInputHariIni} transaksi) telah melebihi jatah (${formatRupiah(jatah)}). Hemat pengeluaranmu untuk hari berikutnya!</span>
      `;
    } else {
      elBanner.className = "warning-banner banner-success";
      elBanner.innerHTML = `
        <span>✅ <strong>Pengeluaran Aman:</strong> Total pengeluaran ${labelHari} (${formatRupiah(pengeluaranHariIni)}) masih dalam batas aman jatah (${formatRupiah(jatah)}). Pertahankan!</span>
      `;
    }
  }
}

/**
 * W2: Menampilkan daftar transaksi yang diurutkan terbaru di atas.
 */
function renderDaftar() {
  const kontainer = document.getElementById("kontainer-daftar");
  const badgeTotal = document.getElementById("total-transaksi-badge");

  if (!kontainer) return;

  if (badgeTotal) {
    badgeTotal.textContent = `${transaksi.length} Transaksi`;
  }

  kontainer.innerHTML = "";

  if (transaksi.length === 0) {
    kontainer.innerHTML = `
      <div class="empty-state">
        <p>Belum ada transaksi yang dicatat.</p>
        <p style="font-size: 0.85rem; margin-top: 4px;">Gunakan form di samping untuk mulai mencatat pengeluaran atau pemasukan.</p>
      </div>
    `;
    return;
  }

  // Urutkan transaksi dari yang terbaru
  const transaksiTerurut = [...transaksi].sort((a, b) => {
    if (a.tanggal !== b.tanggal) {
      return b.tanggal.localeCompare(a.tanggal);
    }
    return b.id - a.id;
  });

  transaksiTerurut.forEach((item) => {
    const itemCard = document.createElement("div");
    itemCard.className = "transaction-item";

    const isPengeluaran = item.jenis === "pengeluaran";
    const tipeClass = isPengeluaran ? "type-pengeluaran" : "type-pemasukan";
    const amountClass = isPengeluaran ? "amount-pengeluaran" : "amount-pemasukan";
    const tanda = isPengeluaran ? "-" : "+";

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

    const btnHapus = itemCard.querySelector(".btn-delete");
    btnHapus.addEventListener("click", () => {
      hapusTransaksi(item.id);
    });

    kontainer.appendChild(itemCard);
  });
}

/**
 * Memanggil seluruh fungsi render untuk memperbarui UI setelah data berubah.
 */
function renderSemua() {
  renderRingkasan();
  renderJatahDanPeringatan();
  renderDaftar();
}

// ==========================================
// 6. Inisialisasi Saat Halaman Dimuat
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  // Set default input tanggal ke hari ini
  const inputTanggal = document.getElementById("tanggal");
  if (inputTanggal) {
    inputTanggal.value = dapatkanTanggalHariIni();
  }

  // Muat data dari localStorage
  transaksi = muatData();
  pengaturan = muatPengaturan();

  // Daftarkan listener form tambah transaksi
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

  // Format currency & auto validasi pada input nominal transaksi
  const inputNominal = document.getElementById("nominal");
  if (inputNominal) {
    inputNominal.addEventListener("input", (e) => {
      const input = e.target;
      const angkaSaja = input.value.replace(/\D/g, "");
      if (!angkaSaja) {
        input.value = "";
      } else {
        input.value = formatInputCurrency(angkaSaja);
        const pos = input.value.length - 2;
        input.setSelectionRange(pos, pos);
      }
      validasiForm();
    });

    inputNominal.addEventListener("keydown", (e) => {
      if (e.key === "Backspace") {
        const input = e.target;
        if (input.selectionStart > input.value.length - 2) {
          e.preventDefault();
          let angka = input.value.replace(/\D/g, "");
          if (angka.length > 0) {
            angka = angka.slice(0, -1);
            input.value = angka ? formatInputCurrency(angka) : "";
            const pos = input.value ? input.value.length - 2 : 0;
            input.setSelectionRange(pos, pos);
          } else {
            input.value = "";
          }
          validasiForm();
        }
      }
    });

    inputNominal.addEventListener("click", (e) => {
      const input = e.target;
      if (input.value.endsWith(",-") && input.selectionStart > input.value.length - 2) {
        const pos = input.value.length - 2;
        input.setSelectionRange(pos, pos);
      }
    });
  }



  // Isi dropdown kategori sesuai jenis awal
  perbaruiOpsiKategori();

  // Render semua komponen UI
  renderSemua();
});
