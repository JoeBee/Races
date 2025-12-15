'use strict';

// Module for Image Viewer functionality
const ImageViewer = (function () {
    // Variables
    let currentImageIndex = 0;
    let currentImages = [];
    let currentRaceData = null;
    let isDevelopmentServer = false;
    let allRaces = [];
    let currentRaceIndex = 0;
    let racesWithImages = [];

    // Initialize the viewer
    function init() {
        // Determine if we're running on development server
        isDevelopmentServer = window.location.hostname === "localhost";

        // Load the HTML for the image viewer
        loadImageViewerHTML();
    }

    // Load the image viewer HTML from template
    function loadImageViewerHTML() {
        // Fetch HTML template and inject into the DOM
        fetch('components/imageViewer.html')
            .then(response => response.text())
            .then(html => {
                // Create temporary container
                const temp = document.createElement('div');
                temp.innerHTML = html;

                // Append the viewer to the body
                document.body.appendChild(temp.firstElementChild);

                // Set up event listeners after the HTML is loaded
                setupEventListeners();
            })
            .catch(error => {
                console.error('Error loading image viewer:', error);
            });
    }

    // Set up event listeners for the viewer
    function setupEventListeners() {
        const modal = document.getElementById('imageViewerModal');
        const closeButton = document.querySelector('.close-button');
        const prevImageButton = document.getElementById('prevImageBtn');
        const nextImageButton = document.getElementById('nextImageBtn');
        const prevRaceButton = document.getElementById('prevRaceBtn');
        const nextRaceButton = document.getElementById('nextRaceBtn');

        // Image Navigation buttons
        if (prevImageButton) prevImageButton.addEventListener('click', showPreviousImage);
        if (nextImageButton) nextImageButton.addEventListener('click', showNextImage);

        // Race Navigation buttons
        if (prevRaceButton) prevRaceButton.addEventListener('click', showPreviousRace);
        if (nextRaceButton) nextRaceButton.addEventListener('click', showNextRace);

        // Close button
        if (closeButton) {
            closeButton.addEventListener('click', function () {
                modal.style.display = 'none';
                closeImageViewer();
            });
        }

        // Close on click outside content
        if (modal) {
            modal.addEventListener('click', function (event) {
                if (event.target === modal) {
                    modal.style.display = 'none';
                    closeImageViewer();
                }
            });
        }
    }

    // Open the image viewer with a set of images
    function openImageViewer(images, startIndex, raceData, races = []) {
        const modal = document.getElementById('imageViewerModal');

        // If modal isn't loaded yet, wait and try again
        if (!modal) {
            setTimeout(() => openImageViewer(images, startIndex, raceData, races), 100);
            return;
        }

        currentImages = images;
        currentImageIndex = startIndex;
        currentRaceData = raceData;
        allRaces = races;

        // Filter races to only include those with images
        racesWithImages = races.filter(race => race.Images && race.Images.length > 0);

        // Find current race index in the filtered list
        if (raceData && racesWithImages.length > 0) {
            currentRaceIndex = racesWithImages.findIndex(race =>
                race.MarathonNumber === raceData.MarathonNumber
            );
            if (currentRaceIndex === -1) currentRaceIndex = 0;
        }

        updateImageDisplay();
        updateRaceNavigation();
        modal.style.display = 'block';

        // Add keyboard navigation
        document.addEventListener('keydown', handleKeyboardNavigation);
    }

    // Update the displayed image
    function updateImageDisplay() {
        const imageElement = document.getElementById('currentImage');
        const counter = document.getElementById('imageCounter');

        if (!imageElement || !counter) return;

        const imagePath = currentImages[currentImageIndex];

        // Set image source relative to the current page (works for localhost and /Races hosting)
        imageElement.src = `./marathonPix/${imagePath}`;

        // Update counter
        counter.textContent = `${currentImageIndex + 1}/${currentImages.length}`;

        // Update race information if available
        updateRaceInfo();
    }

    // Update the race information
    function updateRaceInfo() {
        const marathonNumber = document.getElementById('raceMarathonNumber');
        const raceName = document.getElementById('raceName');
        const raceDate = document.getElementById('raceDate');

        if (marathonNumber && raceName && raceDate && currentRaceData) {
            if (currentRaceData.MarathonNumber) {
                marathonNumber.textContent = `Marathon#${currentRaceData.MarathonNumber}`;
            }
            raceName.textContent = currentRaceData.RaceName;
            raceDate.textContent = currentRaceData.Date;
        }
    }

    // Update race navigation display
    function updateRaceNavigation() {
        const raceCounter = document.getElementById('raceCounter');
        const prevRaceBtn = document.getElementById('prevRaceBtn');
        const nextRaceBtn = document.getElementById('nextRaceBtn');

        if (!raceCounter || !prevRaceBtn || !nextRaceBtn) return;

        // Update race counter
        // console.log('1. ', currentImageIndex);
        // console.log('2. ', currentImages);
        // console.log('3. ', currentRaceData);
        // console.log('4. ', isDevelopmentServer);
        // console.log('5. ', allRaces);
        // console.log('6. ', currentRaceIndex);
        // console.log('7. ', racesWithImages);

        raceCounter.textContent = `Race ${currentRaceData.OverallOrder} of ${allRaces.length}`;

        // Update button states
        prevRaceBtn.disabled = currentRaceIndex === 0;
        nextRaceBtn.disabled = currentRaceIndex === racesWithImages.length - 1;
    }

    // Show the previous image
    function showPreviousImage() {
        currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
        updateImageDisplay();
    }

    // Show the next image
    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % currentImages.length;
        updateImageDisplay();
    }

    // Show the previous race
    function showPreviousRace() {
        if (currentRaceIndex > 0) {
            currentRaceIndex--;
            const raceData = racesWithImages[currentRaceIndex];
            if (raceData && raceData.Images) {
                currentImages = raceData.Images;
                currentImageIndex = 0;
                currentRaceData = raceData;
                updateImageDisplay();
                updateRaceNavigation();
            }
        }
    }

    // Show the next race
    function showNextRace() {
        if (currentRaceIndex < racesWithImages.length - 1) {
            currentRaceIndex++;
            const raceData = racesWithImages[currentRaceIndex];
            if (raceData && raceData.Images) {
                currentImages = raceData.Images;
                currentImageIndex = 0;
                currentRaceData = raceData;
                updateImageDisplay();
                updateRaceNavigation();
            }
        }
    }

    // Handle keyboard navigation
    function handleKeyboardNavigation(event) {
        const modal = document.getElementById('imageViewerModal');

        // Only process keyboard events if modal is visible
        if (!modal || modal.style.display !== 'block') {
            return;
        }

        switch (event.key) {
            case 'ArrowLeft':
                if (event.shiftKey) {
                    showPreviousRace();
                } else {
                    showPreviousImage();
                }
                break;
            case 'ArrowRight':
                if (event.shiftKey) {
                    showNextRace();
                } else {
                    showNextImage();
                }
                break;
            case 'Escape':
                modal.style.display = 'none';
                closeImageViewer();
                break;
        }
    }

    // Clean up event listeners when modal is closed
    function closeImageViewer() {
        document.removeEventListener('keydown', handleKeyboardNavigation);
    }

    // Public API
    return {
        init: init,
        openImageViewer: openImageViewer
    };
})();

// Initialize the module when the DOM is ready
document.addEventListener('DOMContentLoaded', ImageViewer.init);

// Export the module for global use
window.ImageViewer = ImageViewer; 