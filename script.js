

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
