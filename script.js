let MarathonDataAll = []; // Read once upon page load
let colAscending = [false, false, false, false, false, false, false];

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
  fetch("races.json")
    .then((response) => response.json())
    .then((data) => {
      MarathonDataAll = data;
      console.log("* MarathonDataAll", MarathonDataAll);
      makeDisplayTable(); // MarathonDataAll);
    })
    .catch((error) => console.error("Error fetching data:", error));
});

// ----------------------------------------------------------

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

// To implement 3-state check boxes the best way seems to be
// // to include a hidden inputbox, not implemented here (yet)
// const checkbox = document.getElementById("myCheckbox");
// const stateInput = document.getElementById("checkboxState");

function checkBoxClicked(colKey) {
  // let element = document.getElementById(colKey);
  // console.log(colKey, element.checked); // , element.indeterminate);
  // //SetCheckboxState(element);

  // let colIndex = colsAry.indexOf(colKey);
  // console.log(" colIndex", colIndex);

  // const filteredData = MarathonDataAll.filter((item) => {
  //   const columnValue = item[Object.keys(item)[colIndex]];
  //   return columnValue === "TRUE"; // Filtering where IsMarathon is true
  // });

  // console.log("* ", element.checked, colKey, filteredData.length);

  makeDisplayTable();
}

// -----------------------------------------------------

function filterDatacheck() {
  let elyIsMarathon = document.getElementById("IsMarathon");
  let elyOfficialEntrant = document.getElementById("OfficialEntrant");

  let rtnData = MarathonDataAll;

  if (!elyIsMarathon.checked) {
    let colIndexMar = colsAry.indexOf("IsMarathon");
    rtnData = rtnData.filter((item) => {
      const columnValue = item[Object.keys(item)[colIndexMar]];
      return columnValue !== "TRUE";
    });
  }

  if (!elyOfficialEntrant.checked) {
    console.log(" - official is checked");
    console.log(" - pre count", rtnData.length);
    let colIndexOff = colsAry.indexOf("OfficialEntrant");
    rtnData = rtnData.filter((item) => {
      const columnValue = item[Object.keys(item)[colIndexOff]];
      return columnValue !== "TRUE";
    });
    console.log(" - post count", rtnData.length);
  }

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
}

// -----------------------------------------------------

// function SetCheckboxState(checkbox) {
//   console.log("********** state", checkbox.checked, checkbox.indeterminate);

//   if (checkbox.indeterminate) {
//     checkbox.checked = true;
//     checkbox.indeterminate = false;
//   } else if (checkbox.checked) {
//     checkbox.checked = false;
//     checkbox.indeterminate = true;
//   } else {
//     checkbox.checked = true;
//   }
//   console.log("*-*-* ", checkbox.checked, checkbox.indeterminate);
// }

// -----------------------------------------------------
// function changeState(checkbox) {
//   if (checkbox.indeterminate) {
//     checkbox.checked = true;
//     checkbox.indeterminate = false;
//   } else if (checkbox.checked) {
//     checkbox.checked = false;
//     checkbox.indeterminate = true;
//   } else {
//     checkbox.checked = true;
//     checkbox.indeterminate = false; // Ensure indeterminate state is cleared if checkbox is checked
//   }
//   console.log(getCheckboxState(checkbox));
// }

// function getCheckboxState(checkbox) {
//   if (checkbox.checked) {
//     return "checked";
//   } else if (checkbox.indeterminate) {
//     return "indeterminate";
//   } else {
//     return "unchecked";
//   }
// }

// -----------------------------------------------------
// const checkbox = document.getElementById("myCheckbox");
// const stateInput = document.getElementById("checkboxState");

/*
function checkboxClick() {
  // Add your desired functionality here (e.g., console logs)
  console.log("Checkbox clicked!");

  // Update indeterminate state based on checkbox value
  if (checkbox.checked) {
    checkbox.indeterminate = false;
  } else {
    // ... sub-checkbox check logic ... (replace with your logic)
    const subCheckboxes = document.querySelectorAll(".subCheckbox");
    let someChecked = false;
    for (const subCheckbox of subCheckboxes) {
      if (subCheckbox.checked) {
        someChecked = true;
        break;
      }
    }
    checkbox.indeterminate = someChecked;
  }

  // Update hidden field value with checkbox state
  console.log("setting hidden box value ", checkbox.indeterminate);
  stateInput.value = checkbox.indeterminate;
}

// Attach click event listener
 checkbox.addEventListener("click", checkboxClick);

*/
// Set initial hidden field value (optional)
// You can set this based on your application logic (true, false, or "")
// const storedState = localStorage.getItem("checkboxState"); // Check local storage for previous state (optional)
// if (storedState !== null) {
//   checkbox.indeterminate = storedState === "true";
// } else {
//   stateInput.value = ""; // Set empty string for initial state (optional)
// }

// -----------------------------------------------------

// -----------------------------------------------------
// -----------------------------------------------------
