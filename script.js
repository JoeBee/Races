document.addEventListener("DOMContentLoaded", function () {
  console.log("* DOMContentLoaded");
  fetch("races.json")
    .then((response) => response.json())
    .then((data) => {
      const tableBody = document.getElementById("tableBody");
      tableBody.innerHTML = "";

      // let checkBoxHtml =
      //   `<input type='checkbox' disabled='disabled' ${(key.IsMarathon === 'TRUE' ? 'checked' : '')}>`;

      console.log("* data", data);
      data.forEach((rowData) => {
        // console.log("* rowData", rowData);
        /* *** rowData
          BackupImages: (3) ['232c.jpg', '232b.jpg', '232a.jpg']
          Date: "11/15/2015"
          FinishTime: "4:40:00"
          Images: []
          IsMarathon: "TRUE"
          Link: [{…}]
          MarathonNumber: "232"
          OfficialEntrant: "TRUE"
          OverallOrder: "240"
          RaceName: "Myles Standish Marathon"
          String: "3    Joe Beyer     
        */
        const row = document.createElement("tr");
        Object.keys(rowData).forEach((key) => {
          const keyValue = rowData[key];
          const cell = document.createElement("td");

          if (key === "Link") {
            const link = rowData[key][0];
            if (link) {
              cell.innerHTML = `<a href="${link.URL}" target="_blank">${link.Desc}</a>`;
            }
          } else if (key === "Images" || key === "BackupImages") {
            cell.innerHTML = rowData[key].join(", ");
          } else if (key === "IsMarathon") {
            cell.innerHTML = `<input type='checkbox' disabled='disabled' ${
              keyValue === "TRUE" ? "checked" : ""
            }>`;
          } else if (key === "OfficialEntrant") {
            cell.innerHTML = `<input type='checkbox' disabled='disabled' ${
              keyValue === "TRUE" ? "checked" : ""
            }>`;
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
