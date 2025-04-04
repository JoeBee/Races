'use strict';

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

  // Show loading indicator
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "<tr><td colspan='10' style='text-align:center;'>Loading data...</td></tr>";

  fetch("races.json")
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format: expected an array');
      }
      raceData = data;
      originalRaceData = JSON.parse(JSON.stringify(data)); // Break the reference
      makeDisplayTable();
    })
    .catch(error => {
      console.error("Error fetching or processing data:", error);
      tableBody.innerHTML = `<tr><td colspan='10' style='text-align:center;color:red;'>Error loading data: ${error.message}</td></tr>`;
    });
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
  const elyIsMarathon = document.getElementById("IsMarathon");
  const elyOfficialEntrant = document.getElementById("OfficialEntrant");

  // Start with all data
  let filteredData = [...raceData];

  // Filter for marathon events
  if (elyIsMarathon && elyIsMarathon.checked) {
    filteredData = filteredData.filter(item => {
      const isMarathon = item["IsMarathon"];
      return isMarathon === "TRUE";
    });
  }

  // Filter for official entrants
  if (elyOfficialEntrant && elyOfficialEntrant.checked) {
    filteredData = filteredData.filter(item => {
      const isOfficial = item["OfficialEntrant"];
      return isOfficial === "TRUE";
    });
  }

  // Update header with count information
  writeHeaderInfo(filteredData.length, raceData.length);

  return filteredData;
}

// -----------------------------------------------------

function sortTable(colKey) {
  if (!COLUMN_NAMES.includes(colKey)) {
    console.error(`Invalid column key: ${colKey}`);
    return;
  }

  const colIndex = COLUMN_NAMES.indexOf(colKey);
  const isSortAscending = !columnSortDirections[colIndex];
  columnSortDirections[colIndex] = isSortAscending;

  raceData.sort((a, b) => {
    let aValue = a[colKey];
    let bValue = b[colKey];

    // Ensure we have string values for comparison
    aValue = aValue !== undefined ? String(aValue) : '';
    bValue = bValue !== undefined ? String(bValue) : '';

    if (colKey === "OverallOrder" || colKey === "MarathonNumber") {
      // Handle empty values for numerical sorting
      if (isSortAscending) {
        if (aValue === "") aValue = "-9999";
        if (bValue === "") bValue = "-9999";
      } else {
        if (aValue === "") aValue = "9999";
        if (bValue === "") bValue = "9999";
      }

      const intA = parseInt(aValue, 10) || 0;
      const intB = parseInt(bValue, 10) || 0;

      return isSortAscending ? intB - intA : intA - intB;
    }
    else if (colKey === "Date") {
      if (isValidDate(aValue) && isValidDate(bValue)) {
        const dateA = parseDate(aValue);
        const dateB = parseDate(bValue);
        return isSortAscending ? dateB - dateA : dateA - dateB;
      }
      return isSortAscending ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    }
    else if (colKey === "FinishTime") {
      const timeA = parseTime(aValue);
      const timeB = parseTime(bValue);
      return isSortAscending ? timeB - timeA : timeA - timeB;
    }
    else {
      return isSortAscending ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    }
  });

  makeDisplayTable();
}

// -----------------------------------------------------

function makeDisplayTable() {
  const displayData = filterDatacheck();
  const tableBody = document.getElementById("tableBody");

  // Create a document fragment for better performance
  const fragment = document.createDocumentFragment();

  // Clear existing content
  tableBody.innerHTML = "";

  // Helper function to sanitize HTML content
  const sanitizeHTML = (html) => {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
  };

  displayData.forEach((rowData) => {
    const row = document.createElement("tr");

    Object.keys(rowData).forEach((key) => {
      const keyValue = rowData[key];
      const cell = document.createElement("td");

      if (key === "Link") {
        const link = rowData[key][0];
        if (link && link.URL && link.Desc) {
          // Create a proper DOM element instead of using innerHTML
          const anchor = document.createElement('a');
          anchor.href = link.URL;
          anchor.textContent = link.Desc;
          anchor.target = "_blank";
          anchor.rel = "noopener noreferrer"; // Security best practice
          cell.appendChild(anchor);
        }
      } else if (key === "Images" || key === "BackupImages") {
        const imgs = rowData[key];
        if (Array.isArray(imgs) && imgs.length > 0) {
          let characterCount = 0;

          imgs.forEach((imgPath) => {
            if (!imgPath) return;

            characterCount += imgPath.length;

            const anchor = document.createElement('a');
            anchor.href = isDevelopmentServer
              ? `/marathonPix/${imgPath}`
              : `/Races/marathonPix/${imgPath}`;
            anchor.textContent = imgPath;
            anchor.target = "_blank";
            anchor.rel = "noopener noreferrer";
            cell.appendChild(anchor);

            // Add line break if needed
            if (characterCount > 85) {
              cell.appendChild(document.createElement('br'));
              characterCount = 0;
            }
          });
        }
      } else if (key === "IsMarathon" || key === "OfficialEntrant") {
        cell.textContent = keyValue === "TRUE" ? "✓" : "";
        cell.style.textAlign = "center";
      } else if (key === "String") {
        // Use safer innerHTML assignment
        const sanitized = rowData[key].replace(/<\/BR>/gi, '<br>');
        cell.innerHTML = sanitized;
      } else {
        cell.textContent = rowData[key] || "";
      }

      row.appendChild(cell);
    });

    fragment.appendChild(row);
  });

  tableBody.appendChild(fragment);
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
/**
 * Checks if a string represents a valid date
 * @param {string} dateString - The date string to validate
 * @return {boolean} - True if the date is valid
 */
function isValidDate(dateString) {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }

  // Check if the date format is MM/DD/YYYY
  const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }

  // Parse the date parts and check if they form a valid date
  const [, month, day, year] = dateString.match(dateRegex);

  // Create a new date and verify the components match what was provided
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  return (
    date.getFullYear() === parseInt(year, 10) &&
    date.getMonth() === parseInt(month, 10) - 1 &&
    date.getDate() === parseInt(day, 10)
  );
}

/**
 * Parses a date string in MM/DD/YYYY format
 * @param {string} dateString - The date string to parse
 * @return {Date} - The parsed Date object
 */
function parseDate(dateString) {
  if (!dateString || !isValidDate(dateString)) {
    // Return a default date if input is invalid
    return new Date(1970, 0, 1);
  }

  const parts = dateString.split('/');
  const month = parseInt(parts[0], 10) - 1; // Months are 0-based in JavaScript
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  return new Date(year, month, day);
}

// ----------------------------------------------------------

function parseTime(timeString) {
  // Handle null or undefined values
  if (!timeString) return new Date(1970, 0, 1, 0, 0, 0);

  // Clean up the time string
  timeString = timeString.replace("~", "")
    .replace("?", "0")
    .replace("x", "0")
    .replace("~unknown~", "")
    .replace("unknown~", "");

  // Split into hours, minutes, seconds
  let timeParts = timeString.split(":");

  // Fix logic error: add seconds if needed
  if (timeParts.length !== 2) {
    timeParts.push("00");
  }

  // Ensure all parts are valid numbers
  const hours = parseInt(timeParts[0]) || 0;
  const minutes = parseInt(timeParts[1]) || 0;
  const seconds = parseInt(timeParts[2]) || 0;

  return new Date(1970, 0, 1, hours, minutes, seconds);
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
