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
  const tersimpan = localStorage.getItem("pmm_pengaturan");
  try {
    return tersimpan ? JSON.parse(tersimpan) : { uangBulanan: 0 };
  } catch {
    return { uangBulanan: 0 };
  }
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

function formatRupiah(nominal) {
  return "Rp " + Number(nominal).toLocaleString("id-ID");
}

function dapatkanTanggalHariIni() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function dapatkanNominalAngka(str) {
  return Number(String(str || "").replace(/\D/g, "")) || 0;
}

function formatInputCurrency(nilaiStr) {
  const angka = String(nilaiStr || "").replace(/\D/g, "");
  return angka ? Number(angka).toLocaleString("id-ID") + ",-" : "";
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function bersihkanErrorForm() {
  document.querySelectorAll("#form-transaksi .input-error").forEach((el) => el.classList.remove("input-error"));
  document.querySelectorAll("#form-transaksi .error-message").forEach((el) => (el.textContent = ""));
}

function perbaruiOpsiKategori(kategoriTerpilih = "") {
  const selectJenis = document.getElementById("jenis");
  const selectKategori = document.getElementById("kategori");
  if (!selectJenis || !selectKategori) return;

  const daftar = KATEGORI_OPSI[selectJenis.value] || [];
  selectKategori.innerHTML = '<option value="" disabled selected>Pilih Kategori</option>';

  daftar.forEach((kat) => {
    const opt = document.createElement("option");
    opt.value = kat;
    opt.textContent = kat;
    if (kat === kategoriTerpilih) opt.selected = true;
    selectKategori.appendChild(opt);
  });
}

// ==========================================
// 3. Validasi Form (W6)
// ==========================================

function validasiForm() {
  const tgl = document.getElementById("tanggal");
  const jns = document.getElementById("jenis");
  const kat = document.getElementById("kategori");
  const nom = document.getElementById("nominal");

  const cek = (el, idErr, pesan) => {
    const elErr = document.getElementById(idErr);
    el.classList.toggle("input-error", Boolean(pesan));
    if (elErr) elErr.textContent = pesan;
    return !pesan;
  };

  const v1 = cek(tgl, "error-tanggal", tgl.value ? "" : "Tanggal transaksi wajib diisi.");
  const v2 = cek(jns, "error-jenis", jns.value ? "" : "Jenis transaksi wajib dipilih.");
  const v3 = cek(kat, "error-kategori", kat.value ? "" : "Kategori wajib dipilih.");
  const v4 = cek(nom, "error-nominal", nom.value.trim() && dapatkanNominalAngka(nom.value) > 0 ? "" : "Nominal harus diisi dan lebih besar dari Rp 0.");

  return v1 && v2 && v3 && v4;
}


// ==========================================
// 4. Logika Transaksi & Pengaturan (W1, W3, F1)
// ==========================================

// State untuk fitur B2: Edit Transaksi
let idTransaksiSedangDiedit = null;

/**
 * Menangani submit penambahan atau pembaruan transaksi.
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

  if (idTransaksiSedangDiedit !== null) {
    // B2: Mode Update menggunakan map()
    transaksi = transaksi.map((item) => {
      if (item.id === idTransaksiSedangDiedit) {
        return {
          ...item,
          tanggal: inputTanggal.value,
          jenis: selectJenis.value,
          kategori: selectKategori.value,
          nominal: nominalAngka,
          catatan: inputCatatan.value.trim()
        };
      }
      return item;
    });

    batalkanEditTransaksi();
  } else {
    // Mode Tambah Transaksi Baru
    const transaksiBaru = {
      id: Date.now(),
      tanggal: inputTanggal.value,
      jenis: selectJenis.value,
      kategori: selectKategori.value,
      nominal: nominalAngka, // Disimpan sebagai NUMBER
      catatan: inputCatatan.value.trim()
    };

    transaksi.push(transaksiBaru);

    // Reset Form
    inputNominal.value = "";
    inputCatatan.value = "";
    inputTanggal.value = dapatkanTanggalHariIni();
    perbaruiOpsiKategori();

    // Bersihkan kelas error jika ada
    inputNominal.classList.remove("input-error");
    selectKategori.classList.remove("input-error");
  }

  simpanData();
  renderSemua();
}

function setModeEdit(id = null) {
  idTransaksiSedangDiedit = id;
  const isEdit = id !== null;
  document.getElementById("judul-form").textContent = isEdit ? "Edit Transaksi" : "Tambah Transaksi";
  document.getElementById("btn-simpan").textContent = isEdit ? "Perbarui Transaksi" : "Simpan Transaksi";
  document.getElementById("btn-batal-edit").style.display = isEdit ? "inline-block" : "none";
  bersihkanErrorForm();
}

function mulaiEditTransaksi(id) {
  const item = transaksi.find((t) => t.id === id);
  if (!item) return;

  setModeEdit(id);
  document.getElementById("tanggal").value = item.tanggal;
  document.getElementById("jenis").value = item.jenis;
  perbaruiOpsiKategori();
  document.getElementById("kategori").value = item.kategori;
  document.getElementById("nominal").value = formatInputCurrency(String(item.nominal));
  document.getElementById("catatan").value = item.catatan || "";

  document.querySelector(".form-section")?.scrollIntoView({ behavior: "smooth" });
}

function batalkanEditTransaksi() {
  setModeEdit(null);
  document.getElementById("form-transaksi").reset();
  document.getElementById("tanggal").value = dapatkanTanggalHariIni();
  perbaruiOpsiKategori();
}

function hapusTransaksi(id) {
  if (!confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) return;
  if (idTransaksiSedangDiedit === id) batalkanEditTransaksi();
  transaksi = transaksi.filter((item) => item.id !== id);
  simpanData();
  renderSemua();
}

// ==========================================
// 5. Perhitungan & Render (W5, F2, F3)
// ==========================================

function hitungRingkasan() {
  let totalPemasukan = 0;
  let totalPengeluaran = 0;
  for (const item of transaksi) {
    if (item.jenis === "pemasukan") totalPemasukan += item.nominal;
    else if (item.jenis === "pengeluaran") totalPengeluaran += item.nominal;
  }
  return { totalPemasukan, totalPengeluaran, saldo: totalPemasukan - totalPengeluaran };
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

  // Checker: apakah total pengeluaran pada tanggal tersebut melebihi jatah atau mendekati batas (sisa <= 15k)
  const BATAS_PERINGATAN_MENDEKATI = 15000;
  const peringatan = uangBulananDiatur && pengeluaranHariIni > jatah;
  const sisaJatah = Math.max(0, jatah - pengeluaranHariIni);
  const mendekatiBatas = uangBulananDiatur && !peringatan && pengeluaranHariIni > 0 && sisaJatah <= BATAS_PERINGATAN_MENDEKATI;
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
    mendekatiBatas,
    sisaJatah,
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
    mendekatiBatas,
    sisaJatah,
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
    } else if (mendekatiBatas) {
      elCheckerStatus.innerHTML = `<span class="badge badge-warning">⚡ Mendekati batas (Sisa ${formatRupiah(sisaJatah)})</span>`;
    } else if (pengeluaranHariIni > 0) {
      elCheckerStatus.innerHTML = `<span class="badge badge-success">✅ Masih aman (Sisa ${formatRupiah(sisaJatah)})</span>`;
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
    } else if (mendekatiBatas) {
      elBanner.className = "warning-banner banner-warning";
      elBanner.innerHTML = `
        <span>⚡ <strong>Peringatan Mendekati Batas:</strong> Total pengeluaran ${labelHari} (${formatRupiah(pengeluaranHariIni)}) sudah mendekati batas jatah harian (${formatRupiah(jatah)}). Sisa jatah hari ini tinggal <strong>${formatRupiah(sisaJatah)}</strong>!</span>
      `;
    } else {
      elBanner.className = "warning-banner banner-success";
      elBanner.innerHTML = `
        <span>✅ <strong>Pengeluaran Aman:</strong> Total pengeluaran ${labelHari} (${formatRupiah(pengeluaranHariIni)}) masih dalam batas aman jatah (${formatRupiah(jatah)}). Pertahankan!</span>
      `;
    }
  }
}

// ==========================================
// 5. Fitur Bonus: Filter, Pencarian & Backup Data (B3, B4)
// ==========================================

/**
 * B3: Memperbarui opsi dropdown filter kategori berdasarkan filter jenis yang aktif.
 */
function perbaruiOpsiFilterKategori(resetKeDefault = false) {
  const filterJenis = document.getElementById("filter-jenis");
  const filterKategori = document.getElementById("filter-kategori");
  if (!filterJenis || !filterKategori) return;

  const jenisTerpilih = filterJenis.value;
  const nilaiSebelumnya = resetKeDefault ? "semua" : filterKategori.value;

  filterKategori.innerHTML = '<option value="semua">Semua Kategori</option>';

  let opsi = [];
  if (jenisTerpilih === "pengeluaran") {
    opsi = KATEGORI_OPSI.pengeluaran;
  } else if (jenisTerpilih === "pemasukan") {
    opsi = KATEGORI_OPSI.pemasukan;
  } else {
    // Gabungan seluruh kategori unik
    opsi = Array.from(new Set([...KATEGORI_OPSI.pengeluaran, ...KATEGORI_OPSI.pemasukan]));
  }

  opsi.forEach((kat) => {
    const opt = document.createElement("option");
    opt.value = kat;
    opt.textContent = kat;
    filterKategori.appendChild(opt);
  });

  if (!resetKeDefault && opsi.includes(nilaiSebelumnya)) {
    filterKategori.value = nilaiSebelumnya;
  } else {
    filterKategori.value = "semua";
  }
}

function dapatkanTransaksiTerfilter() {
  const keyword = (document.getElementById("filter-pencarian")?.value || "").trim().toLowerCase();
  const jenis = document.getElementById("filter-jenis")?.value || "semua";
  const kategori = document.getElementById("filter-kategori")?.value || "semua";
  const dari = document.getElementById("filter-dari-tanggal")?.value || "";
  const sampai = document.getElementById("filter-sampai-tanggal")?.value || "";

  return transaksi.filter((t) => {
    if (jenis !== "semua" && t.jenis !== jenis) return false;
    if (kategori !== "semua" && t.kategori !== kategori) return false;
    if (dari && t.tanggal < dari) return false;
    if (sampai && t.tanggal > sampai) return false;
    if (keyword && !(t.catatan?.toLowerCase().includes(keyword) || t.kategori.toLowerCase().includes(keyword))) return false;
    return true;
  });
}

function resetFilter() {
  const elPencarian = document.getElementById("filter-pencarian");
  const elJenis = document.getElementById("filter-jenis");
  const elKategori = document.getElementById("filter-kategori");
  const elDari = document.getElementById("filter-dari-tanggal");
  const elSampai = document.getElementById("filter-sampai-tanggal");

  if (elPencarian) elPencarian.value = "";
  if (elDari) elDari.value = "";
  if (elSampai) elSampai.value = "";
  if (elJenis) elJenis.value = "semua";

  perbaruiOpsiFilterKategori(true);
  if (elKategori) elKategori.value = "semua";

  renderDaftar();
}

/**
 * B4: Mengekspor seluruh data transaksi ke dalam file format JSON.
 */
function eksporDataJson() {
  if (transaksi.length === 0) {
    alert("Belum ada data transaksi untuk diekspor.");
    return;
  }

  const dataString = JSON.stringify(transaksi, null, 2);
  const blob = new Blob([dataString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `backup-transaksi-kos-${dapatkanTanggalHariIni()}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * B4: Mengimpor data transaksi dari file JSON yang dipilih pengguna.
 */
function imporDataJson(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const dataImpor = JSON.parse(e.target.result);

      if (!Array.isArray(dataImpor)) {
        throw new Error("Format file JSON harus berupa array transaksi.");
      }

      // Validasi struktur transaksi minimal
      const valid = dataImpor.every(
        (t) =>
          t &&
          typeof t.id !== "undefined" &&
          typeof t.tanggal === "string" &&
          typeof t.jenis === "string" &&
          typeof t.kategori === "string" &&
          typeof t.nominal === "number"
      );

      if (!valid) {
        throw new Error("Struktur data transaksi dalam file JSON tidak sesuai.");
      }

      const konfirmasi = confirm(
        `Ditemukan ${dataImpor.length} transaksi pada file.\nApakah Anda ingin mengganti data saat ini dengan data hasil impor?`
      );

      if (!konfirmasi) {
        event.target.value = "";
        return;
      }

      transaksi = dataImpor;
      simpanData();
      batalkanEditTransaksi();
      renderSemua();
      alert(`Berhasil mengimpor ${transaksi.length} transaksi!`);
    } catch (err) {
      alert(`Gagal mengimpor file: ${err.message}`);
    } finally {
      event.target.value = "";
    }
  };

  reader.readAsText(file);
}

/**
 * W2 & B3: Menampilkan daftar transaksi yang diurutkan terbaru di atas dengan dukungan filter.
 */
function renderDaftar() {
  const kontainer = document.getElementById("kontainer-daftar");
  const badgeTotal = document.getElementById("total-transaksi-badge");

  if (!kontainer) return;

  const transaksiTerfilter = dapatkanTransaksiTerfilter();

  if (badgeTotal) {
    if (transaksiTerfilter.length === transaksi.length) {
      badgeTotal.textContent = `${transaksi.length} Transaksi`;
    } else {
      badgeTotal.textContent = `${transaksiTerfilter.length} dari ${transaksi.length} Transaksi`;
    }
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

  if (transaksiTerfilter.length === 0) {
    kontainer.innerHTML = `
      <div class="empty-state">
        <p>🔍 Tidak ada transaksi yang cocok dengan kriteria filter.</p>
        <button type="button" class="btn btn-action-tool" style="margin-top: 10px;" id="btn-empty-reset-filter">Reset Filter</button>
      </div>
    `;
    const btnEmptyReset = document.getElementById("btn-empty-reset-filter");
    if (btnEmptyReset) {
      btnEmptyReset.addEventListener("click", resetFilter);
    }
    return;
  }

  // Urutkan transaksi dari yang terbaru
  const transaksiTerurut = [...transaksiTerfilter].sort((a, b) => {
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
        <div class="item-actions">
          <button type="button" class="btn-action btn-edit" title="Edit transaksi">Edit</button>
          <button type="button" class="btn-action btn-delete" title="Hapus transaksi">Hapus</button>
        </div>
      </div>
    `;

    const btnEdit = itemCard.querySelector(".btn-edit");
    btnEdit.addEventListener("click", () => {
      mulaiEditTransaksi(item.id);
    });

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

  // Daftarkan listener form tambah/edit transaksi
  const formTransaksi = document.getElementById("form-transaksi");
  if (formTransaksi) {
    formTransaksi.addEventListener("submit", tambahTransaksi);
  }

  // Listener tombol Batal Edit (B2)
  const btnBatalEdit = document.getElementById("btn-batal-edit");
  if (btnBatalEdit) {
    btnBatalEdit.addEventListener("click", batalkanEditTransaksi);
  }

  // Daftarkan listener saat jenis transaksi di form berubah
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

  // Listener B3: Filter & Pencarian
  const elPencarian = document.getElementById("filter-pencarian");
  if (elPencarian) {
    elPencarian.addEventListener("input", renderDaftar);
  }

  const filterJenis = document.getElementById("filter-jenis");
  if (filterJenis) {
    filterJenis.addEventListener("change", () => {
      perbaruiOpsiFilterKategori();
      renderDaftar();
    });
  }

  const filterKategori = document.getElementById("filter-kategori");
  if (filterKategori) {
    filterKategori.addEventListener("change", renderDaftar);
  }

  const filterDari = document.getElementById("filter-dari-tanggal");
  if (filterDari) {
    filterDari.addEventListener("change", renderDaftar);
  }

  const filterSampai = document.getElementById("filter-sampai-tanggal");
  if (filterSampai) {
    filterSampai.addEventListener("change", renderDaftar);
  }

  const btnResetFilter = document.getElementById("btn-reset-filter");
  if (btnResetFilter) {
    btnResetFilter.addEventListener("click", resetFilter);
  }

  // Listener B4: Backup Ekspor & Impor JSON
  const btnEkspor = document.getElementById("btn-ekspor-json");
  if (btnEkspor) {
    btnEkspor.addEventListener("click", eksporDataJson);
  }

  const btnImporTrigger = document.getElementById("btn-impor-trigger");
  const inputImpor = document.getElementById("input-impor-json");
  if (btnImporTrigger && inputImpor) {
    btnImporTrigger.addEventListener("click", () => {
      inputImpor.click();
    });
    inputImpor.addEventListener("change", imporDataJson);
  }

  // Isi dropdown kategori form awal & filter awal
  perbaruiOpsiKategori();
  perbaruiOpsiFilterKategori();

  // Render semua komponen UI
  renderSemua();
});
