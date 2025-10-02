document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const podcastList = document.getElementById('podcast-list');
    const audioPlayer = document.getElementById('audio-player');

    // --- State Management ---
    let currentlyPlayingItem = null; // To track the currently playing podcast item
    let currentlyPlayingButton = null; // To track the currently playing button

    // --- SVG Icons for Play/Pause buttons ---
    const playIconSVG = `
        <svg role="img" height="24" width="24" aria-hidden="true" viewBox="0 0 24 24">
            <path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"></path>
        </svg>`;
    const pauseIconSVG = `
        <svg role="img" height="24" width="24" aria-hidden="true" viewBox="0 0 24 24">
            <path d="M5.7 3a.7.7 0 00-.7.7v16.6a.7.7 0 00.7.7h2.6a.7.7 0 00.7-.7V3.7a.7.7 0 00-.7-.7H5.7zm10 0a.7.7 0 00-.7.7v16.6a.7.7 0 00.7.7h2.6a.7.7 0 00.7-.7V3.7a.7.7 0 00-.7-.7h-2.6z"></path>
        </svg>`;

    /**
     * Fetches the list of podcasts from the server's API.
     */
    async function fetchPodcasts() {
        try {
            const response = await fetch('/api/podcasts');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const podcasts = await response.json();
            renderPodcasts(podcasts);
        } catch (error) {
            console.error("Failed to fetch podcasts:", error);
            podcastList.innerHTML = '<div class="empty">Could not load podcasts. Please try again later.</div>';
        }
    }

    /**
     * Renders the list of podcasts on the page.
     * @param {string[]} podcasts - An array of podcast filenames.
     */
    function renderPodcasts(podcasts) {
        // Clear the loading message
        podcastList.innerHTML = '';

        if (podcasts.length === 0) {
            podcastList.innerHTML = '<div class="empty">No podcasts found. Run your main.py script to generate some!</div>';
            return;
        }

        podcasts.forEach(filename => {
            // Create the main container for the item
            const item = document.createElement('div');
            item.className = 'podcast-item';
            item.dataset.filename = filename; // Store filename for later use

            // Create the title element
            const title = document.createElement('div');
            title.className = 'podcast-title';
            // Clean up the filename to be a readable title
            title.textContent = filename.replace('.mp3', '').replace(/_/g, ' ');

            // Create the play button
            const playButton = document.createElement('button');
            playButton.className = 'play-button';
            playButton.innerHTML = playIconSVG;

            // Append title and button to the item
            item.appendChild(title);
            item.appendChild(playButton);

            // Add event listener to the whole item for playback
            item.addEventListener('click', () => handlePlay(item, playButton, filename));

            // Append the item to the main list
            podcastList.appendChild(item);
        });
    }

    /**
     * Handles the logic for playing, pausing, and switching tracks.
     * @param {HTMLElement} item - The podcast item div.
     * @param {HTMLElement} button - The play/pause button.
     * @param {string} filename - The filename of the audio to play.
     */
    function handlePlay(item, button, filename) {
        // Check if this item is already playing
        const isPlaying = item.classList.contains('playing');

        // If another track is playing, stop it first
        if (currentlyPlayingItem && currentlyPlayingItem !== item) {
            currentlyPlayingItem.classList.remove('playing');
            currentlyPlayingButton.innerHTML = playIconSVG;
        }

        if (isPlaying) {
            // Pause the current track
            audioPlayer.pause();
            item.classList.remove('playing');
            button.innerHTML = playIconSVG;
            currentlyPlayingItem = null;
            currentlyPlayingButton = null;
        } else {
            // Play the new track
            audioPlayer.src = `/podcasts/${filename}`;
            audioPlayer.play();
            item.classList.add('playing');
            button.innerHTML = pauseIconSVG;
            currentlyPlayingItem = item;
            currentlyPlayingButton = button;
        }
    }
    
    // --- Event listener for when the audio finishes playing ---
    audioPlayer.addEventListener('ended', () => {
        if (currentlyPlayingItem) {
            currentlyPlayingItem.classList.remove('playing');
            currentlyPlayingButton.innerHTML = playIconSVG;
            currentlyPlayingItem = null;
            currentlyPlayingButton = null;
        }
    });


    // --- Initial Fetch ---
    fetchPodcasts();
});
