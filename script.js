let MarathonDataAll = []; // Read once upon page load
let MarathonDataOriginal = []; // Used in resets to clear sort order
let colAscending = [false, false, false, false, false, false, false];

let isTestServer = false;

const colsAry = [
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
  console.log('* LOADED');
  let hostname = window.location.hostname;
  isTestServer = hostname === "localhost";

  console.log("*** isTestServer, hostname", isTestServer, hostname);

  fetch("races.json")
    .then((response) => response.json())
    .then((data) => {
      MarathonDataAll = data;
      MarathonDataOriginal = JSON.parse(JSON.stringify(data)); // Break the reference

      console.log("* MarathonDataAll", MarathonDataAll);
      makeDisplayTable(); // MarathonDataAll);
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

function checkBoxClicked(colKey) {
  makeDisplayTable();
}

// -----------------------------------------------------

function filterDatacheck() {
  let elyIsMarathon = document.getElementById("IsMarathon");
  let elyOfficialEntrant = document.getElementById("OfficialEntrant");

  let rtnData = MarathonDataAll;

  // Marathon+ Only
  if (elyIsMarathon.checked) {
    let colIndexMar = colsAry.indexOf("IsMarathon");
    rtnData = rtnData.filter((item) => {
      const columnValue = item[Object.keys(item)[colIndexMar]];
      return columnValue === "TRUE";
    });
    console.log(" - Mar post count", rtnData.length);
  }

  // Official Entrant Only
  if (elyOfficialEntrant.checked) {
    let colIndexOff = colsAry.indexOf("OfficialEntrant");
    rtnData = rtnData.filter((item) => {
      const columnValue = item[Object.keys(item)[colIndexOff]];
      return columnValue == "TRUE";
    });
    console.log(" - Off post count", rtnData.length);
  }

  writeHeaderInfo(rtnData.length, MarathonDataAll.length);
  return rtnData;
}

// -----------------------------------------------------

function sortTable(colKey) {
  let colIndex = colsAry.indexOf(colKey);
  let sortAscending = colAscending[colIndex] === true ? false : true;
  colAscending[colIndex] = sortAscending;

  MarathonDataAll.sort((a, b) => {
    let aValue = a[colKey];
    let bValue = b[colKey];

    if (colKey == "OverallOrder" || colKey == "MarathonNumber") {
      // Because all records don't have Marathon Number we want these records sorting to the bottom
      if (sortAscending) {
        if (aValue == "") aValue = -9999;
        if (bValue == "") bValue = -9999;
      } else {
        if (aValue == "") aValue = 9999;
        if (bValue == "") bValue = 9999;
      }

      let intA = parseInt(aValue);
      let intB = parseInt(bValue);

      if (sortAscending) return parseInt(intB) - parseInt(intA);
      else return parseInt(intA) - parseInt(intB);
    }
    if (colKey == "Date") {
      if (isValidDate(aValue) && isValidDate(bValue)) {
        let dateA = parseDate(aValue);
        let dateB = parseDate(bValue);
        return dateA - dateB;
      }
      if (sortAscending) return aValue.localeCompare(bValue);
      else return bValue.localeCompare(aValue);
    }
    if (colKey == "FinishTime") {
      var timeA = parseTime(aValue);
      var timeB = parseTime(bValue);
      if (sortAscending) return timeA - timeB;
      else return timeB - timeA;
    } else {
      if (sortAscending) return aValue.localeCompare(bValue);
      else return bValue.localeCompare(aValue);
    }
  });

  makeDisplayTable(); // MarathonDataAll);
}

// -----------------------------------------------------

function makeDisplayTable() {
  let displayData = filterDatacheck();

  console.log("Count:", displayData.length);

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
        let charCounter = 0;
        imgs.forEach((x) => {
          // outputHtml += `<img src="/marathonPix/${x}" alt="${x}"> `;
          charCounter = charCounter + x.length;

          if (isTestServer)
            outputHtml += `<a href="/marathonPix/${x}" target="_blank">${x}</a>`;
          else
            outputHtml += `<a href="/Races/marathonPix/${x}" target="_blank">${x}</a>`;

          // Limit how many images before newline
          if (charCounter > 85) {
            outputHtml += `<br>`;
            charCounter = 0;
          }
        });
        cell.innerHTML = outputHtml; // rowData[key].join(", ");
        // console.log("* Images", key, imgs);
      } else if (key === "IsMarathon") {
        cell.innerHTML = keyValue === "TRUE" ? "✓" : "";
        cell.style.textAlign = "center";
      } else if (key === "OfficialEntrant") {
        cell.innerHTML = keyValue === "TRUE" ? "✓" : "";
        cell.style.textAlign = "center";
      } else {
        cell.textContent = rowData[key];
      }

      row.appendChild(cell);
    });
    tableBody.appendChild(row);
  });
}

// -----------------------------------------------------

function resetClicked() {
  console.log("******* reset");

  let elyIsMarathon = document.getElementById("IsMarathon");
  let elyOfficialEntrant = document.getElementById("OfficialEntrant");
  elyIsMarathon.checked = false;
  elyOfficialEntrant.checked = false;
  colAscending = [false, false, false, false, false, false, false];
  MarathonDataAll = JSON.parse(JSON.stringify(MarathonDataOriginal)); // Break the reference;

  console.log("* All ", MarathonDataAll[0], MarathonDataAll[0].OverallOrder);
  console.log(
    "* Original ",
    MarathonDataOriginal[0],
    MarathonDataOriginal[0].OverallOrder
  );

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
  let parts = timeString.split(":");
  if (!parts.length == 2) parts.push("00");

  // if (!parts[2]) console.log("* timeString:", timeString);
  return new Date(1970, 0, 1, parts[0], parts[1], parts[2]);
}
// -----------------------------------------------------

function writeHeaderInfo(iDisplaying, iTotalRecs) {
  let myDiv = document.getElementById("dynamcicText");
  let displayText = "";
  if (iDisplaying === iTotalRecs) {
    displayText = `Displaying all ${iTotalRecs} records`;
  } else {
    displayText = `Displaying ${iDisplaying} of ${iTotalRecs} records`;
  }
  myDiv.textContent = displayText;
}

// *********************************************************

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
