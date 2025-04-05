'use strict';

// Module for Image Viewer functionality
const ImageViewer = (function () {
    // Variables
    let currentImageIndex = 0;
    let currentImages = [];
    let isDevelopmentServer = false;

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
        const prevButton = document.getElementById('prevImageBtn');
        const nextButton = document.getElementById('nextImageBtn');

        // Navigation buttons
        if (prevButton) prevButton.addEventListener('click', showPreviousImage);
        if (nextButton) nextButton.addEventListener('click', showNextImage);

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
    function openImageViewer(images, startIndex) {
        const modal = document.getElementById('imageViewerModal');

        // If modal isn't loaded yet, wait and try again
        if (!modal) {
            setTimeout(() => openImageViewer(images, startIndex), 100);
            return;
        }

        currentImages = images;
        currentImageIndex = startIndex;

        updateImageDisplay();
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

        // Set image source with correct path
        imageElement.src = isDevelopmentServer
            ? `/marathonPix/${imagePath}`
            : `/Races/marathonPix/${imagePath}`;

        // Update counter
        counter.textContent = `${currentImageIndex + 1}/${currentImages.length}`;
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

    // Handle keyboard navigation
    function handleKeyboardNavigation(event) {
        const modal = document.getElementById('imageViewerModal');

        // Only process keyboard events if modal is visible
        if (!modal || modal.style.display !== 'block') {
            return;
        }

        switch (event.key) {
            case 'ArrowLeft':
                showPreviousImage();
                break;
            case 'ArrowRight':
                showNextImage();
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