document.addEventListener("DOMContentLoaded", function () {
  console.log("* DOMContentLoaded");
  fetch("races.json")
    .then((response) => response.json())
    .then((data) => {
      const tableBody = document.getElementById("tableBody");
      tableBody.innerHTML = "";

      console.log("* data", data);
      data.forEach((rowData) => {
        console.log("* rowData", rowData);
        const row = document.createElement("tr");
        Object.keys(rowData).forEach((key) => {
          const cell = document.createElement("td");
          if (key === "Link") {
            const link = rowData[key][0];
            cell.innerHTML = `<a href="${link.URL}" target="_blank">${link.Desc}</a>`;
          } else if (key === "Images" || key === "BackupImages") {
            cell.innerHTML = rowData[key].join(", ");
          } else {
            cell.textContent = rowData[key];
          }
          row.appendChild(cell);
        });
        tableBody.appendChild(row);
      });
    })
    .catch((error) => console.error("Error fetching data:", error));
});

function sortTable(columnIndex) {
  const table = document.getElementById("dataTable");
  const rows = Array.from(table.getElementsByTagName("tr"));
  const sortedRows = rows.slice(1).sort((a, b) => {
    const aValue = a.getElementsByTagName("td")[columnIndex].textContent;
    const bValue = b.getElementsByTagName("td")[columnIndex].textContent;
    return aValue.localeCompare(bValue);
  });
  const tbody = table.getElementsByTagName("tbody")[0];
  sortedRows.forEach((row) => tbody.appendChild(row));
}
