let raceData = []; // Read once upon page load
let originalRaceData = []; // Used in resets to clear sort order
let columnSortDirections = [false, false, false, false, false, false, false];

let isDevelopmentServer = false;

const COLUMN_NAMES = [
  "OverallOrder",
  "MarathonNumber",
  "RaceName",
  "Date",
  "FinishTime",
  "IsMarathon",
  "OfficialEntrant",
  "Link",
  "Images",
  "String",
];

// ----------------------------------------------------------

// *** Page Load
document.addEventListener("DOMContentLoaded", function () {
  let hostname = window.location.hostname;
  isDevelopmentServer = hostname === "localhost";

  fetch("races.json")
    .then((response) => response.json())
    .then((data) => {
      raceData = data;
      originalRaceData = JSON.parse(JSON.stringify(data)); // Break the reference
      makeDisplayTable(); // raceData);
    })
    .catch((error) => console.error("Error fetching data:", error));
});

// ----------------------------------------------------------
// Right side scroll arrows
document.getElementById("scroll-up").addEventListener("click", function () {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.getElementById("scroll-down").addEventListener("click", function () {
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
});

// ----------------------------------------------------------

// To implement 3-state check boxes the best way seems to be
// // to include a hidden inputbox, not implemented here (yet)
// const checkbox = document.getElementById("myCheckbox");
// const stateInput = document.getElementById("checkboxState");

function handleCheckboxClick(columnKey) {
  makeDisplayTable();
}

// -----------------------------------------------------

function filterDatacheck() {
  let elyIsMarathon = document.getElementById("IsMarathon");
  let elyOfficialEntrant = document.getElementById("OfficialEntrant");

  let rtnData = raceData;

  // Marathon+ Only
  if (elyIsMarathon.checked) {
    let colIndexMar = COLUMN_NAMES.indexOf("IsMarathon");
    rtnData = rtnData.filter((item) => {
      const columnValue = item[Object.keys(item)[colIndexMar]];
      return columnValue === "TRUE";
    });
  }

  // Official Entrant Only
  if (elyOfficialEntrant.checked) {
    let colIndexOff = COLUMN_NAMES.indexOf("OfficialEntrant");
    rtnData = rtnData.filter((item) => {
      const columnValue = item[Object.keys(item)[colIndexOff]];
      return columnValue == "TRUE";
    });
  }

  writeHeaderInfo(rtnData.length, raceData.length);
  return rtnData;
}

// -----------------------------------------------------

function sortTable(colKey) {
  let colIndex = COLUMN_NAMES.indexOf(colKey);
  let isSortAscending = !columnSortDirections[colIndex];
  columnSortDirections[colIndex] = isSortAscending;

  raceData.sort((a, b) => {
    let aValue = a[colKey];
    let bValue = b[colKey];

    if (colKey == "OverallOrder" || colKey == "MarathonNumber") {
      // Because all records don't have Marathon Number we want these records sorting to the bottom
      if (isSortAscending) {
        if (aValue == "") aValue = -9999;
        if (bValue == "") bValue = -9999;
      } else {
        if (aValue == "") aValue = 9999;
        if (bValue == "") bValue = 9999;
      }

      let intA = parseInt(aValue);
      let intB = parseInt(bValue);

      if (isSortAscending) return parseInt(intB) - parseInt(intA);
      else return parseInt(intA) - parseInt(intB);
    }
    else if (colKey == "Date") {
      if (isValidDate(aValue) && isValidDate(bValue)) {
        let dateA = parseDate(aValue);
        let dateB = parseDate(bValue);
        return dateA - dateB;
      }
      if (isSortAscending) return aValue.localeCompare(bValue);
      else return bValue.localeCompare(aValue);
    }
    else if (colKey == "FinishTime") {
      let timeA = parseTime(aValue);
      let timeB = parseTime(bValue);
      if (isSortAscending) return timeA - timeB;
      else return timeB - timeA;
    }
    // else if (colKey == "Link" || colKey == "Images") {
    //   let varA;
    //   let varB;
    //   if (!aValue || aValue.length == 0)
    //     varA = undefined;
    //   else
    //     varA = aValue[0];

    //   if (!bValue || bValue.length == 0)
    //     varB = undefined;
    //   else
    //     varB = bValue[0];

    //   let txtA = parseInt(varA);
    //   let txtB = parseInt(varB);
    //   if (isSortAscending) return txtA - txtB;
    //   else return txtB - txtA;
    // }
    else {
      if (isSortAscending) return aValue.localeCompare(bValue);
      else return bValue.localeCompare(aValue);
    }
  });

  makeDisplayTable(); // raceData);
}

// -----------------------------------------------------

function makeDisplayTable() {
  let displayData = filterDatacheck();

  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  displayData.forEach((rowData) => {
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
    let iColCounter = 0;
    Object.keys(rowData).forEach((key) => {
      const keyValue = rowData[key];
      const cell = document.createElement("td");

      if (key === "Link") {
        const link = rowData[key][0];
        if (link) {
          cell.innerHTML = `<a href="${link.URL}" target="_blank">${link.Desc}</a>`;
        }
      } else if (key === "Images" || key === "BackupImages") {
        let imgs = rowData[key];
        let outputHtml = "";
        let characterCount = 0;
        imgs.forEach((x) => {
          // outputHtml += `<img src="/marathonPix/${x}" alt="${x}"> `;
          characterCount = characterCount + x.length;

          if (isDevelopmentServer)
            outputHtml += `<a href="/marathonPix/${x}" target="_blank">${x}</a>`;
          else
            outputHtml += `<a href="/Races/marathonPix/${x}" target="_blank">${x}</a>`;

          // Limit how many images before newline
          if (characterCount > 85) {
            outputHtml += `<br>`;
            characterCount = 0;
          }
        });
        cell.innerHTML = outputHtml; // rowData[key].join(", ");
      } else if (key === "IsMarathon") {
        cell.innerHTML = keyValue === "TRUE" ? "✓" : "";
        cell.style.textAlign = "center";
      } else if (key === "OfficialEntrant") {
        cell.innerHTML = keyValue === "TRUE" ? "✓" : "";
        cell.style.textAlign = "center";
      } else if (key === "String") {
        cell.innerHTML = rowData[key];
      } else {
        cell.textContent = rowData[key];
      }

      row.appendChild(cell);
    });
    tableBody.appendChild(row);
  });
}



// -----------------------------------------------------

function handleResetClick() {
  let elyIsMarathon = document.getElementById("IsMarathon");
  let elyOfficialEntrant = document.getElementById("OfficialEntrant");
  elyIsMarathon.checked = false;
  elyOfficialEntrant.checked = false;
  columnSortDirections = [false, false, false, false, false, false, false];
  raceData = JSON.parse(JSON.stringify(originalRaceData)); // Break the reference;

  makeDisplayTable();
}

// *********************************************************
// *** HELPERS
function isValidDate(dateString) {
  // Check if Date.parse() returns a valid date (not NaN) and the parsed date is not equal to "Invalid Date"
  return (
    !isNaN(Date.parse(dateString)) && new Date(dateString) !== "Invalid Date"
  );
}

// ----------------------------------------------------------

function parseDate(dateString) {
  var parts = dateString.split("/");
  // Note: months are 0-based in JavaScript Date, so we need to subtract 1
  return new Date(parts[2], parts[0] - 1, parts[1]);
}

// ----------------------------------------------------------

function parseTime(timeString) {
  timeString = timeString.replace("~", "");
  timeString = timeString.replace("?", "0");
  timeString = timeString.replace("x", "0");
  timeString = timeString.replace("~unknown~", "");
  timeString = timeString.replace("unknown~", "");
  let timeParts = timeString.split(":");
  if (!timeParts.length == 2) timeParts.push("00");

  return new Date(1970, 0, 1, timeParts[0], timeParts[1], timeParts[2]);
}
// -----------------------------------------------------

function writeHeaderInfo(iDisplaying, iTotalRecs) {
  let myDiv = document.getElementById("dynamicText");
  let displayText = "";
  if (iDisplaying === iTotalRecs) {
    displayText = `Displaying all ${iTotalRecs} records`;
  } else {
    displayText = `Displaying ${iDisplaying} of ${iTotalRecs} records`;
  }
  myDiv.textContent = displayText;
}

// -----------------------------------------------------

// If you're creating header cells programmatically, add the style attribute
function createTableHeader() {
  // ... existing code ...

  const headerCell = document.createElement("th");
  headerCell.style.verticalAlign = "middle";
  headerCell.style.height = "40px";

  // ... rest of your code
}

// -----------------------------------------------------
