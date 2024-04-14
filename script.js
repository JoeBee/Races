document.addEventListener("DOMContentLoaded", function () {
  fetch("races.json")
    .then((response) => response.json())
    .then((data) => {
      const tableBody = document.getElementById("tableBody");
      tableBody.innerHTML = "";

      // let checkBoxHtml =
      //   `<input type='checkbox' disabled='disabled' ${(key.IsMarathon === 'TRUE' ? 'checked' : '')}>`;

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

          // if (key === "OverallOrder") {
          //   cell.textContent = parseInt(rowData[key]);
          // }
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

// ----------------------------------------------------------

let colAscending = [false, false, false, false, false, false, false];

function sortTable(columnIndex) {
  let sortOrder = colAscending[columnIndex] === true ? false : true;
  colAscending[columnIndex] = sortOrder;

  const table = document.getElementById("dataTable");
  const rows = Array.from(table.getElementsByTagName("tr"));
  console.log("* sort rows", rows);
  /*
      0  Overall Order	
      1. Marathon Number
      2. Race Name
      3. Date	
      4. Finish Time	
      5. Is Marathon
      6. Official Entrant
*/

  const sortedRows = rows.slice(1).sort((a, b) => {
    let aValue = a.getElementsByTagName("td")[columnIndex].textContent;
    let bValue = b.getElementsByTagName("td")[columnIndex].textContent;
    if (columnIndex == 0 || columnIndex == 1) {
      var intA = parseInt(aValue);
      var intB = parseInt(bValue);
      if (sortOrder) return intB - intA;
      else return intA - intB;
    } else {
      if (sortOrder) return aValue.localeCompare(bValue);
      else return bValue.localeCompare(aValue);
    }
  });
  const tbody = table.getElementsByTagName("tbody")[0];
  sortedRows.forEach((row) => tbody.appendChild(row));
}
