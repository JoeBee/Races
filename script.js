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
            let imgs = rowData[key];
            let outputHtml = "";
            let charCounter = 0;
            imgs.forEach((x) => {
              // outputHtml += `<img src="/marathonPix/${x}" alt="${x}"> `;
              charCounter = charCounter + x.length;

              outputHtml += `<a href="/Races/marathonPix/${x}" target="_blank">${x}</a>`;
              if (charCounter > 95) {
                outputHtml += `<br>`;
                charCounter = 0;
              }
            });
            cell.innerHTML = outputHtml; // rowData[key].join(", ");
            // console.log("* Images", key, imgs);
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
  let sortAscending = colAscending[columnIndex] === true ? false : true;
  colAscending[columnIndex] = sortAscending;

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
      if (sortAscending) return intB - intA;
      else return intA - intB;
    }
    if (columnIndex == 3) {
      if (isValidDate(aValue) && isValidDate(bValue)) {
        let dateA = parseDate(aValue);
        let dateB = parseDate(bValue);
        return dateA - dateB;
      }
      if (sortAscending) return aValue.localeCompare(bValue);
      else return bValue.localeCompare(aValue);
    }
    if (columnIndex == 4) {
      var timeA = parseTime(aValue);
      var timeB = parseTime(bValue);
      if (sortAscending) return timeA - timeB;
      else return timeB - timeA;
    } else {
      if (sortAscending) return aValue.localeCompare(bValue);
      else return bValue.localeCompare(aValue);
    }
  });
  const tbody = table.getElementsByTagName("tbody")[0];
  sortedRows.forEach((row) => tbody.appendChild(row));
}

function isValidDate(dateString) {
  // Check if Date.parse() returns a valid date (not NaN) and the parsed date is not equal to "Invalid Date"
  return (
    !isNaN(Date.parse(dateString)) && new Date(dateString) !== "Invalid Date"
  );
}

function parseDate(dateString) {
  var parts = dateString.split("/");
  // Note: months are 0-based in JavaScript Date, so we need to subtract 1
  return new Date(parts[2], parts[0] - 1, parts[1]);
}

function parseTime(timeString) {
  timeString = timeString.replace("~", "");
  timeString = timeString.replace("?", "0");
  timeString = timeString.replace("x", "0");
  timeString = timeString.replace("~unknown~", "");
  timeString = timeString.replace("unknown~", "");
  let parts = timeString.split(":");
  if (!parts.length == 2) parts.push("00");

  // if (!parts[2]) console.log("* timeString:", timeString);
  return new Date(1970, 0, 1, parts[0], parts[1], parts[2]);
}
