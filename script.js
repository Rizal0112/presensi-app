// ================== CEK LOGIN ==================
if (localStorage.getItem("isLogin") !== "true") {
    window.location.href = "login.html";
}

// ================== DATA ==================
let data = JSON.parse(localStorage.getItem("presensi")) || [];
let currentData = [...data];

let currentPage = 1;
let rowsPerPage = 10;
let sortDirection = {};

// ================== RENDER TABLE ==================
function renderTable() {
    let table = document.getElementById("dataTable");
    table.innerHTML = "";

    let start = (currentPage - 1) * rowsPerPage;
    let end = rowsPerPage === "all" ? currentData.length : start + rowsPerPage;

    let paginatedData = rowsPerPage === "all" 
        ? currentData 
        : currentData.slice(start, end);

    paginatedData.forEach((item, index) => {
        let realIndex = start + index;

        let row = `
            <tr>
                <td>${item.Nama}</td>
                <td>${item.NIU}</td>
                <td>${item.Kelas}</td>
                <td>${item.Waktu}</td>
                <td>${item.Poin}</td>
                <td>
                    <button class="btn-delete" onclick="hapusData(${realIndex})">❌</button>
                </td>
            </tr>
        `;
        table.innerHTML += row;
    });

    renderPagination();
}

// ================== PAGINATION ==================
function renderPagination() {
    let totalPages = rowsPerPage === "all" 
        ? 1 
        : Math.ceil(currentData.length / rowsPerPage);

    let pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
}

    let maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = startPage + maxVisible - 1;

    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // PREV
    if (currentPage > 1) {
        let prev = document.createElement("button");
        prev.innerText = "⬅";
        prev.onclick = () => {
            currentPage--;
            renderTable();
        };
        pagination.appendChild(prev);
    }

    // RANGE
    for (let i = startPage; i <= endPage; i++) {
        let btn = document.createElement("button");
        btn.innerText = i;

        if (i === currentPage) btn.classList.add("active");

        btn.onclick = () => {
            currentPage = i;
            renderTable();
        };

        pagination.appendChild(btn);
    }

    // NEXT
    if (currentPage < totalPages) {
        let next = document.createElement("button");
        next.innerText = "➡";
        next.onclick = () => {
            currentPage++;
            renderTable();
        };
        pagination.appendChild(next);
    }
}

// ================== HAPUS ==================
function hapusData(index) {
    if (confirm("Yakin mau hapus data ini?")) {
        data.splice(index, 1);
        localStorage.setItem("presensi", JSON.stringify(data));

        currentData = [...data];
        renderTable();
    }
}


function hapusSemua() {
    if (confirm("Hapus semua data?")) {
        data = [];
        localStorage.removeItem("presensi");

        currentData = [];
        renderTable();
    }
}

// ================== FORM SUBMIT ==================
document.getElementById("formData").addEventListener("submit", function(e) {
    e.preventDefault();

    let Nama = document.getElementById("Nama").value;
    let NIU = document.getElementById("NIU").value;
    let Kelas = document.getElementById("Kelas").value;

    let waktuObj = new Date();
    let Waktu = waktuObj.toLocaleString();

    let Poin = hitungPoin(Kelas, waktuObj);

    let newData = { Nama, NIU, Kelas, Waktu, Poin };

    data.push(newData);
    localStorage.setItem("presensi", JSON.stringify(data));

    currentData = [...data];
    renderTable();
    this.reset();
});

// ================== FILTER ==================
function filterData() {
    let keyword = document.getElementById("searchInput").value.toLowerCase();
    let kelasFilter = document.getElementById("filterKelas").value;
    let tanggalFilter = document.getElementById("filterTanggal").value;

    currentData = data.filter(item => {
        let matchSearch =
            item.Nama.toLowerCase().includes(keyword) ||
            item.NIU.toLowerCase().includes(keyword) ||
            item.Kelas.toLowerCase().includes(keyword);

        let matchKelas = kelasFilter === "" || item.Kelas === kelasFilter;

        let matchTanggal = true;
        if (tanggalFilter) {
            let rowDate = new Date(item.Waktu).toISOString().split("T")[0];
            matchTanggal = rowDate === tanggalFilter;
        }

        return matchSearch && matchKelas && matchTanggal;
    });

    currentPage = 1;
    renderTable();
}

document.getElementById("searchInput").addEventListener("input", filterData);
document.getElementById("filterKelas").addEventListener("change", filterData);
document.getElementById("filterTanggal").addEventListener("change", filterData);

// ================== SORT ==================
function sortTable(key) {
    sortDirection[key] = !sortDirection[key];

    currentData.sort((a, b) => {
        if (a[key] < b[key]) return sortDirection[key] ? -1 : 1;
        if (a[key] > b[key]) return sortDirection[key] ? 1 : -1;
        return 0;
    });

    renderTable();
}

// ================== ROW PER PAGE ==================
document.getElementById("rowsPerPage").addEventListener("change", function() {
    rowsPerPage = this.value === "all" ? "all" : parseInt(this.value);
    currentPage = 1;
    renderTable();
});

// ================== EXCEL ==================
function downloadExcel() {
    let rows = [["Nama", "NIU", "Kelas", "Waktu", "Poin"]];

    data.forEach(item => {
        rows.push([item.Nama, item.NIU, item.Kelas, item.Waktu, item.Poin]);
    });

    let csvContent = "data:text/csv;charset=utf-8," 
        + rows.map(e => e.join(",")).join("\n");

    let link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "data_presensi.csv");
    document.body.appendChild(link);
    link.click();
}

// ================== LOGOUT ==================
function logout() {
    if (confirm("Yakin mau logout?")) {
        localStorage.removeItem("isLogin");
        localStorage.removeItem("userEmail");
        window.location.href = "login.html";
    }
}

// ================== POIN ==================
function getJadwal(kelas) {
    if (kelas === "Fisika") 
        return { praktikum: 1, deadline: 4, hour: 15 };

    if (kelas === "Geofisika") 
        return { praktikum: 4, deadline: 1, hour: 12 };

    if (kelas === "IUP Physics") 
        return { praktikum: 5, deadline: 2, hour: 12 };
}
function getPraktikumTerakhir(submit, hariPraktikum) {
    let date = new Date(submit);

    let selisih = (submit.getDay() - hariPraktikum + 7) % 7;
    date.setDate(submit.getDate() - selisih);

    date.setHours(0,0,0,0);
    return date;
}

function hitungPoin(kelas, waktuSubmit) {
    let jadwal = getJadwal(kelas);
    let submit = new Date(waktuSubmit);

    // 🔥 Ambil praktikum terakhir (anchor minggu)
    let praktikum = getPraktikumTerakhir(submit, jadwal.praktikum);

    // 🔥 Deadline = dari praktikum itu
    let deadline = new Date(praktikum);

    let diff = (jadwal.deadline - jadwal.praktikum + 7) % 7;
    deadline.setDate(praktikum.getDate() + diff);
    deadline.setHours(jadwal.hour, 0, 0, 0);

    let selisih = (submit - deadline) / (1000 * 60);

    if (selisih <= 0) return 0;
    if (selisih <= 30) return -5;
    if (selisih <= 60) return -10;
    if (selisih < 1440) return -15;
    return "-50%";
}
// ================== INIT ==================
renderTable();