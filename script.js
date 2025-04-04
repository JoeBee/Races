'use strict';

// Global variables
let raceData = [];
let originalRaceData = [];
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

// ===== Event Listeners =====

document.addEventListener("DOMContentLoaded", initializeApp);

function initializeApp() {
  // Determine if we're running on development server
  isDevelopmentServer = window.location.hostname === "localhost";

  // Set up scroll button event listeners
  document.getElementById("scroll-up").addEventListener("click", scrollToTop);
  document.getElementById("scroll-down").addEventListener("click", scrollToBottom);

  // Load race data
  loadRaceData();
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function scrollToBottom() {
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

// ===== Data Loading =====

function loadRaceData() {
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
      originalRaceData = JSON.parse(JSON.stringify(data)); // Deep copy
      makeDisplayTable();
    })
    .catch(error => {
      console.error("Error fetching or processing data:", error);
      tableBody.innerHTML = `<tr><td colspan='10' style='text-align:center;color:red;'>Error loading data: ${error.message}</td></tr>`;
    });
}

// ===== Event Handlers =====

function handleCheckboxClick(columnKey) {
  makeDisplayTable();
}

function handleResetClick() {
  // Reset checkboxes
  const elyIsMarathon = document.getElementById("IsMarathon");
  const elyOfficialEntrant = document.getElementById("OfficialEntrant");
  elyIsMarathon.checked = false;
  elyOfficialEntrant.checked = false;

  // Reset sort directions
  columnSortDirections = [false, false, false, false, false, false, false];

  // Reset data to original
  raceData = JSON.parse(JSON.stringify(originalRaceData)); // Deep copy

  // Update display
  makeDisplayTable();
}

// ===== Data Processing =====

function filterDatacheck() {
  const elyIsMarathon = document.getElementById("IsMarathon");
  const elyOfficialEntrant = document.getElementById("OfficialEntrant");

  // Start with all data
  let filteredData = [...raceData];

  // Filter for marathon events
  if (elyIsMarathon && elyIsMarathon.checked) {
    filteredData = filteredData.filter(item => item["IsMarathon"] === "TRUE");
  }

  // Filter for official entrants
  if (elyOfficialEntrant && elyOfficialEntrant.checked) {
    filteredData = filteredData.filter(item => item["OfficialEntrant"] === "TRUE");
  }

  // Update header with count information
  writeHeaderInfo(filteredData.length, raceData.length);

  return filteredData;
}

function sortTable(colKey) {
  if (!COLUMN_NAMES.includes(colKey)) {
    console.error(`Invalid column key: ${colKey}`);
    return;
  }

  const colIndex = COLUMN_NAMES.indexOf(colKey);
  const isSortAscending = !columnSortDirections[colIndex];
  columnSortDirections[colIndex] = isSortAscending;

  raceData.sort((a, b) => {
    let aValue = a[colKey] || '';
    let bValue = b[colKey] || '';

    // Ensure we have string values for comparison
    aValue = String(aValue);
    bValue = String(bValue);

    if (colKey === "OverallOrder" || colKey === "MarathonNumber") {
      return handleNumericSort(aValue, bValue, isSortAscending);
    }
    else if (colKey === "Date") {
      return handleDateSort(aValue, bValue, isSortAscending);
    }
    else if (colKey === "FinishTime") {
      return handleTimeSort(aValue, bValue, isSortAscending);
    }
    else {
      // Default string comparison
      return isSortAscending ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    }
  });

  makeDisplayTable();
}

function handleNumericSort(aValue, bValue, isSortAscending) {
  // Handle empty values for numerical sorting
  if (aValue === "") aValue = isSortAscending ? "-9999" : "9999";
  if (bValue === "") bValue = isSortAscending ? "-9999" : "9999";

  const intA = parseInt(aValue, 10) || 0;
  const intB = parseInt(bValue, 10) || 0;

  return isSortAscending ? intB - intA : intA - intB;
}

function handleDateSort(aValue, bValue, isSortAscending) {
  if (isValidDate(aValue) && isValidDate(bValue)) {
    const dateA = parseDate(aValue);
    const dateB = parseDate(bValue);
    return isSortAscending ? dateB - dateA : dateA - dateB;
  }
  return isSortAscending ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
}

function handleTimeSort(aValue, bValue, isSortAscending) {
  const timeA = parseTime(aValue);
  const timeB = parseTime(bValue);
  return isSortAscending ? timeB - timeA : timeA - timeB;
}

// ===== UI Functions =====

function makeDisplayTable() {
  const displayData = filterDatacheck();
  const tableBody = document.getElementById("tableBody");

  // Create a document fragment for better performance
  const fragment = document.createDocumentFragment();

  // Clear existing content
  tableBody.innerHTML = "";

  displayData.forEach((rowData) => {
    const row = document.createElement("tr");

    COLUMN_NAMES.forEach((key) => {
      if (!rowData.hasOwnProperty(key)) return;

      const keyValue = rowData[key];
      const cell = document.createElement("td");

      if (key === "Link") {
        renderLinkCell(cell, rowData[key]);
      } else if (key === "Images" || key === "BackupImages") {
        renderImagesCell(cell, rowData[key]);
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

function renderLinkCell(cell, links) {
  if (!Array.isArray(links) || links.length === 0) return;

  const link = links[0];
  if (link && link.URL && link.Desc) {
    const anchor = document.createElement('a');
    anchor.href = link.URL;
    anchor.textContent = link.Desc;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer"; // Security best practice
    cell.appendChild(anchor);
  }
}

function renderImagesCell(cell, imgs) {
  if (!Array.isArray(imgs) || imgs.length === 0) return;

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

function writeHeaderInfo(iDisplaying, iTotalRecs) {
  const myDiv = document.getElementById("dynamicText");
  let displayText = "";
  if (iDisplaying === iTotalRecs) {
    displayText = `Displaying all ${iTotalRecs} records`;
  } else {
    displayText = `Displaying ${iDisplaying} of ${iTotalRecs} records`;
  }
  myDiv.textContent = displayText;
}

// ===== Helper Functions =====

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

/**
 * Parses a time string in HH:MM:SS format
 * @param {string} timeString - The time string to parse
 * @return {Date} - The parsed Date object for comparison
 */
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

  // Add seconds if needed
  if (timeParts.length !== 3) {
    timeParts.push("00");
  }

  // Ensure all parts are valid numbers
  const hours = parseInt(timeParts[0]) || 0;
  const minutes = parseInt(timeParts[1]) || 0;
  const seconds = parseInt(timeParts[2]) || 0;

  return new Date(1970, 0, 1, hours, minutes, seconds);
}
