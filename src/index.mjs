import "./styles.css";

const ITEMS_PER_PAGE = 10;
let transactions = [];
let currentPage = 1;
let editingId = null;

// Load transactions from localStorage when the page loads
document.addEventListener("DOMContentLoaded", () => {
  const savedTransactions = localStorage.getItem("transactions");
  if (savedTransactions) {
    transactions = JSON.parse(savedTransactions);
  }
  renderTable();
});

// Add event listeners
document.getElementById("betting").addEventListener("input", calculateHadiah);
document.getElementById("saveButton").addEventListener("click", addTransaction);
document
  .getElementById("addNewDataButton")
  .addEventListener("click", toggleInputForm);
document.getElementById("filterButton").addEventListener("click", filterData);
document.getElementById("exportButton").addEventListener("click", exportCSV);
document.getElementById("saveEditButton").addEventListener("click", saveEdit);
document
  .getElementById("cancelEditButton")
  .addEventListener("click", cancelEdit);
document
  .getElementById("cancelInputButton")
  .addEventListener("click", cancelInputForm);

function calculateHadiah() {
  const betting = parseInt(document.getElementById("betting").value) || 0;
  let hadiah = 0;
  if (betting >= 1600 && betting <= 1800) hadiah = 30000;
  else if (betting >= 2000 && betting <= 8000) hadiah = 50000;
  else if (betting >= 10000 && betting <= 18000) hadiah = 80000;
  else if (betting >= 20000 && betting <= 1000000) hadiah = 100000;
  // Optionally display hadiah somewhere
}

function toggleInputForm() {
  const form = document.getElementById("inputForm");
  if (form.style.display === "none") {
    form.style.display = "block";
    clearForm();
  } else {
    cancelInputForm();
  }
}

function cancelInputForm() {
  const form = document.getElementById("inputForm");
  form.style.display = "none";
  clearForm();
}

function addTransaction() {
  const tanggal = document.getElementById("tanggal").value;
  const periode = document.getElementById("periode").value;
  const userId = document.getElementById("userId").value;
  const betting = parseInt(document.getElementById("betting").value) || 0;
  const scatter = document.getElementById("scatter").value;
  const lampiran1 = document.getElementById("lampiran1").value;
  const lampiran2 = document.getElementById("lampiran2").value;
  const lampiran3 = document.getElementById("lampiran3").value;
  const status = "Pending"; // Default status is Pending

  if (!tanggal || !periode || !userId || !betting || !scatter) {
    alert("Semua field wajib diisi!");
    return;
  }

  let hadiah = 0;
  if (betting >= 1600 && betting <= 1800) hadiah = 30000;
  else if (betting >= 2000 && betting <= 8000) hadiah = 50000;
  else if (betting >= 10000 && betting <= 18000) hadiah = 80000;
  else if (betting >= 20000 && betting <= 1000000) hadiah = 100000;

  transactions.push({
    id: transactions.length + 1,
    tanggal,
    periode,
    userId,
    hadiah,
    betting,
    scatter,
    lampiran1,
    lampiran2,
    lampiran3,
    status,
  });
  saveToLocalStorage();
  renderTable();
  cancelInputForm();
}

function renderTable() {
  const table = document.getElementById("transactionTable");
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const paginatedData = transactions.slice(start, end);

  table.innerHTML = `
    <tr>
      <th>No</th>
      <th>Tanggal</th>
      <th>Periode</th>
      <th>User ID</th>
      <th>Hadiah</th>
      <th>Betting</th>
      <th>Scatter</th>
      <th>SS 1</th>
      <th>SS 2</th>
      <th>SS 3</th>
      <th>Status</th>
      <th>Aksi</th>
    </tr>
    ${paginatedData
      .map(
        (t) => `
      <tr style="background-color: ${
        t.status === "Rejected"
          ? "#ffcccc"
          : t.status === "Approved"
          ? "#ccffcc"
          : t.status === "Pending"
          ? "#ffffcc"
          : "inherit"
      };">
        <td>${t.id}</td>
        <td>${t.tanggal}</td>
        <td>${t.periode}</td>
        <td>${t.userId}</td>
        <td>Rp ${t.hadiah.toLocaleString()}</td>
        <td>${t.betting}</td>
        <td>${t.scatter}</td>
        <td><a href="${
          t.lampiran1 || "#"
        }" target="_blank" onclick="openLink(event, '${
          t.lampiran1
        }')">SS 1</a></td>
        <td><a href="${
          t.lampiran2 || "#"
        }" target="_blank" onclick="openLink(event, '${
          t.lampiran2
        }')">SS 2</a></td>
        <td><a href="${
          t.lampiran3 || "#"
        }" target="_blank" onclick="openLink(event, '${
          t.lampiran3
        }')">SS 3</a></td>
        <td>${t.status}</td>
        <td>
          <button class="action-btn" data-id="${t.id}" data-action="edit" ${
          t.status !== "Pending" ? "disabled" : ""
        }>Edit</button>
          <button class="action-btn" data-id="${t.id}" data-action="reject" ${
          t.status !== "Pending" ? "disabled" : ""
        }>Reject</button>
          <button class="action-btn" data-id="${t.id}" data-action="approve" ${
          t.status !== "Pending" ? "disabled" : ""
        }>Approve</button>
        </td>
      </tr>
    `
      )
      .join("")}
  `;

  // Add event listeners to action buttons after rendering
  document.querySelectorAll(".action-btn").forEach((btn) => {
    btn.addEventListener("click", handleAction);
  });

  renderPagination();
}

function renderPagination() {
  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const pagination = document.getElementById("pagination");
  let html = `<button onclick="changePage(${currentPage - 1})" ${
    currentPage === 1 ? "disabled" : ""
  }>Previous</button>`;

  for (let i = 1; i <= totalPages; i++) {
    html += `<button onclick="changePage(${i})" ${
      i === currentPage ? 'style="font-weight:bold;"' : ""
    }>${i}</button>`;
  }

  html += `<button onclick="changePage(${currentPage + 1})" ${
    currentPage === totalPages ? "disabled" : ""
  }>Next</button>`;
  pagination.innerHTML = html;
}

window.changePage = function (page) {
  if (page > 0 && page <= Math.ceil(transactions.length / ITEMS_PER_PAGE)) {
    currentPage = page;
    renderTable();
  }
};

window.openLink = function (event, url) {
  event.preventDefault();
  if (url) {
    window.open(url, "_blank");
  }
};

function handleAction(event) {
  const id = parseInt(event.target.getAttribute("data-id"));
  const action = event.target.getAttribute("data-action");
  const transaction = transactions.find((t) => t.id === id);

  if (transaction.status !== "Pending") {
    return; // Prevent any action if not Pending
  }

  switch (action) {
    case "edit":
      editTransaction(id);
      break;
    case "reject":
      transaction.status = "Rejected";
      saveToLocalStorage();
      renderTable();
      break;
    case "approve":
      transaction.status = "Approved";
      saveToLocalStorage();
      renderTable();
      break;
  }
}

function editTransaction(id) {
  editingId = id;
  const transaction = transactions.find((t) => t.id === id);
  if (transaction.status !== "Pending") {
    return; // Prevent editing if not Pending
  }
  document.getElementById("editTanggal").value = transaction.tanggal;
  document.getElementById("editPeriode").value = transaction.periode;
  document.getElementById("editUserId").value = transaction.userId;
  document.getElementById("editBetting").value = transaction.betting;
  document.getElementById("editScatter").value = transaction.scatter;
  document.getElementById("editLampiran1").value = transaction.lampiran1;
  document.getElementById("editLampiran2").value = transaction.lampiran2;
  document.getElementById("editLampiran3").value = transaction.lampiran3;
  document.getElementById("editStatus").value = transaction.status;
  document.getElementById("editModal").style.display = "block";
}

function saveEdit() {
  const transaction = transactions.find((t) => t.id === editingId);
  if (transaction && transaction.status === "Pending") {
    transaction.tanggal = document.getElementById("editTanggal").value;
    transaction.periode = document.getElementById("editPeriode").value;
    transaction.userId = document.getElementById("editUserId").value;
    transaction.betting =
      parseInt(document.getElementById("editBetting").value) || 0;
    transaction.scatter = document.getElementById("editScatter").value;
    transaction.lampiran1 = document.getElementById("editLampiran1").value;
    transaction.lampiran2 = document.getElementById("editLampiran2").value;
    transaction.lampiran3 = document.getElementById("editLampiran3").value;
    transaction.status = document.getElementById("editStatus").value;

    let hadiah = 0;
    if (transaction.betting >= 1600 && transaction.betting <= 1800)
      hadiah = 30000;
    else if (transaction.betting >= 2000 && transaction.betting <= 8000)
      hadiah = 50000;
    else if (transaction.betting >= 10000 && transaction.betting <= 18000)
      hadiah = 80000;
    else if (transaction.betting >= 20000 && transaction.betting <= 1000000)
      hadiah = 100000;
    transaction.hadiah = hadiah;

    saveToLocalStorage();
    document.getElementById("editModal").style.display = "none";
    renderTable();
  }
}

function cancelEdit() {
  document.getElementById("editModal").style.display = "none";
}

function rejectTransaction(id) {
  const transaction = transactions.find((t) => t.id === id);
  if (transaction && transaction.status === "Pending") {
    transaction.status = "Rejected";
    saveToLocalStorage();
    renderTable();
  }
}

function approveTransaction(id) {
  const transaction = transactions.find((t) => t.id === id);
  if (transaction && transaction.status === "Pending") {
    transaction.status = "Approved";
    saveToLocalStorage();
    renderTable();
  }
}

function deleteTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);
  saveToLocalStorage();
  renderTable();
}

function filterData() {
  renderTable();
}

function exportCSV() {
  let csv =
    "No,Tanggal,Periode,User ID,Hadiah,Betting,Scatter,Link 1,Link 2,Link 3,Status\n";
  transactions.forEach((t) => {
    csv += `${t.id},${t.tanggal},${t.periode},${
      t.userId
    },Rp ${t.hadiah.toLocaleString()},${t.betting},${t.scatter},${
      t.lampiran1
    },${t.lampiran2},${t.lampiran3},${t.status}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "transactions.csv";
  a.click();
}

function clearForm() {
  document.getElementById("tanggal").value = "";
  document.getElementById("periode").value = "";
  document.getElementById("userId").value = "";
  document.getElementById("betting").value = "";
  document.getElementById("scatter").value = "";
  document.getElementById("lampiran1").value = "";
  document.getElementById("lampiran2").value = "";
  document.getElementById("lampiran3").value = "";
  document.getElementById("status").value = "Semua";
}

function saveToLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

renderTable();
