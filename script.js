document.addEventListener('DOMContentLoaded', () => {
    const splashScreen = document.getElementById('splash-screen');
    const welcomeScreen = document.getElementById('welcome-screen');
    const signupButton = document.getElementById('signup-button');

    // New screen elements
    const signupLoadingScreen = document.getElementById('signup-loading-screen');
    const usernameInputScreen = document.getElementById('username-input-screen');
    const loginUsernameInput = document.getElementById('login-username-input'); // Renamed ID
    const continueButton = document.getElementById('continue-button');
    const processingScreen = document.getElementById('processing-screen');
    const processingMessage = document.getElementById('processing-message');
    const mainAppScreen = document.getElementById('main-app-screen');
    const usernameInitial = document.getElementById('username-initial');
    const usernameInitialContainer = document.getElementById('username-initial-container'); // Reference to the clickable circle

    // New search-related elements
    const mainSearchInput = document.getElementById('main-search-input');
    const searchIconButton = document.getElementById('search-icon-button');
    const searchLoadingScreen = document.getElementById('search-loading-screen');
    const searchResultsScreen = document.getElementById('search-results-screen');
    const searchQueryDisplay = document.getElementById('search-query-display');
    const searchResultsContainer = document.getElementById('search-results-container'); // New: reference to container

    // Trending apps container
    const trendingAppsContainer = document.getElementById('trending-apps-container');

    // Account Management Screen elements
    const accountManagementScreen = document.getElementById('account-management-screen');
    const managedUsernameDisplay = document.getElementById('managed-username');
    const darkModeBox = document.getElementById('dark-mode-box');
    const contactSupportBox = document.getElementById('contact-support-box');

    // New: App Details Screen elements
    const appDetailsLoadingScreen = document.getElementById('app-details-loading-screen');
    const appDetailsScreen = document.getElementById('app-details-screen');
    const appDetailsAppIcon = document.getElementById('app-details-app-icon');
    const appDetailsAppNameDisplay = document.getElementById('app-details-app-name-display');
    const appDescriptionText = document.getElementById('app-description-text'); // New: for description
    const appDescriptionBox = document.getElementById('app-description-box'); // New: ref to the description box
    const appImagesScrollContainer = document.getElementById('app-images-scroll-container'); // New: 8:5 scrollable box
    const appDetailsInstallButton = document.getElementById('app-details-install-button'); // New: Install button

    // Video playback elements
    const videoElement = document.querySelector('.bottom-rectangular-box video');
    let videoPlaylist = []; // Start with an empty playlist
    const baseAssetUrl = 'http://localhost:8080/'; // Base URL for assets

    // Function to fetch MP4 files from the localhost directory listing
    async function loadVideoPlaylist() {
        let files = [];
        const defaultFallbackVideos = [
            `${baseAssetUrl}vid1.mp4`,
            `${baseAssetUrl}vid.mp4` // Assuming 'vid.mp4' also exists as per user prompt
        ];

        try {
            const response = await fetch(baseAssetUrl);
            if (!response.ok) {
                // If the fetch itself fails (e.g., CORS, network issue, 404),
                // it might not be a parsable directory listing, so use fallback.
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const links = doc.querySelectorAll('a');

            let foundMp4s = false;
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (href && href.toLowerCase().endsWith('.mp4')) {
                    // Assuming links are relative to baseAssetUrl
                    const fullUrl = new URL(href, baseAssetUrl).href;
                    files.push(fullUrl);
                    foundMp4s = true;
                }
            });

            // If a directory listing was found (links existed) but no MP4s,
            // or if it was not a typical listing with MP4s, use fallback.
            if (!foundMp4s) {
                 console.warn("No MP4 files discovered in directory listing or parsing failed, using default fallback.");
                 files = defaultFallbackVideos;
            }

        } catch (error) {
            console.warn("Error fetching or parsing MP4 files, falling back to default. Error:", error);
            files = defaultFallbackVideos;
        }

        // Final check to ensure there's always at least one video
        if (files.length === 0) {
            files = [`${baseAssetUrl}vid1.mp4`]; // Absolute bare minimum fallback
        }
        
        // Remove duplicates if any (e.g., if defaultFallbackVideos contained ones also found in listing)
        return [...new Set(files)];
    }

    // --- Video Playback Logic ---
    if (videoElement) {
        // Load playlist and start playback
        loadVideoPlaylist().then(loadedVideos => {
            videoPlaylist = loadedVideos;
            // Initially play a random video
            if (videoPlaylist.length > 0) {
                const randomIndex = Math.floor(Math.random() * videoPlaylist.length);
                videoElement.src = videoPlaylist[randomIndex];
                videoElement.play().catch(e => console.error("Error playing initial video:", e));
            }
        });

        // Event listener for when a video ends - pick a new random video
        videoElement.addEventListener('ended', () => {
            if (videoPlaylist.length > 0) {
                const randomIndex = Math.floor(Math.random() * videoPlaylist.length);
                videoElement.src = videoPlaylist[randomIndex];
                videoElement.play().catch(e => console.error("Error playing next video:", e));
            }
        });
    }

    // Key for storing username in local storage
    const USERNAME_STORAGE_KEY = 'granxyAppUsername';
    const DARK_MODE_STORAGE_KEY = 'granxyAppDarkMode'; // New: Key for dark mode preference

    // List of available apps for search simulation (case-insensitive for startsWith check)
    const availableApps = [
        'Palmpay', 'Termux', 'YouTube', 'Whatsapp', 'Spotify', 'Telegram', 'Zoom',
        'Chrome', 'Gmail', 'Maps', 'Netflix', 'TikTok', 'Instagram', 'Facebook',
        'Twitter', 'Snapchat', 'Pinterest', 'Reddit', 'Discord', 'VLC'
    ];

    // Global variable to store which screen we were on before navigating to app details
    let screenBeforeAppDetails = mainAppScreen; // Can be mainAppScreen or searchResultsScreen

    // Function to show a screen and hide others
    const showScreen = (screenToShow) => {
        [
            splashScreen, welcomeScreen, signupLoadingScreen, usernameInputScreen,
            processingScreen, mainAppScreen, searchLoadingScreen, searchResultsScreen,
            accountManagementScreen, appDetailsLoadingScreen, appDetailsScreen
        ].forEach(screen => {
            if (screen === screenToShow) {
                screen.classList.add('active');
            } else {
                screen.classList.remove('active');
            }
        });
    };

    const openFileUrl = (url) => {
        const link = document.createElement('a');
        link.href = url;
        const filename = url.substring(url.lastIndexOf('/') + 1);
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log(`Attempting to open/download: ${url}`);
    };

    // Handler for app item interactions (GET button or search result box click)
    const handleAppItemInteraction = (url) => {
        openFileUrl(url); // Directly open if app lock is not enabled
    };

    /**
     * Creates and returns an app display box (8:2 rectangular box with 2:2 image and name).
     * @param {string} appName The name of the application (e.g., "Palmpay" or "Palmpay.apk").
     * @returns {HTMLElement} The created app box element.
     */
    const createAppBox = (appName) => {
        const resultItem = document.createElement('div');
        resultItem.classList.add('middle-rectangular-box');

        const squareBox = document.createElement('div');
        squareBox.classList.add('square-box');
        const appImage = document.createElement('img');
        appImage.classList.add('app-image');
        appImage.alt = ''; // Clear alt text for images that fail to load
        squareBox.appendChild(appImage);

        const appDetails = document.createElement('div');
        appDetails.classList.add('app-details');
        const appTitle = document.createElement('h3');
        appTitle.classList.add('app-title');
        
        const appNameClean = appName.replace(/\.apk$/i, ''); // Clean name for display
        appTitle.textContent = appNameClean;
        
        appDetails.append(appTitle);
        
        resultItem.append(squareBox, appDetails);

        // New: Add a "GET" button for trending apps
        const getButton = document.createElement('div');
        getButton.classList.add('get-button');
        getButton.textContent = 'GET';
        resultItem.appendChild(getButton);

        // Store data attributes on the result item for easy retrieval
        const apkUrl = `http://localhost:8080/${appNameClean}.apk`; // Always construct APK URL with clean name
        const imageUrl = `http://localhost:8080/${appNameClean}.png`; // Image URL always uses clean name

        resultItem.dataset.appNameClean = appNameClean;
        resultItem.dataset.apkUrl = apkUrl; 
        resultItem.dataset.imageUrl = imageUrl; 

        // Add click listener to the "GET" button
        getButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent the click from bubbling up to resultItem
            handleAppItemInteraction(resultItem.dataset.apkUrl);
        });
        
        // Add click listener to the entire result item (middle-rectangular-box)
        resultItem.addEventListener('click', async (event) => {
            // If the click originated from the 'GET' button, its specific handler already handled it
            if (event.target === getButton || getButton.contains(event.target)) {
                return;
            }

            // Store the screen we're coming from for swipe back
            screenBeforeAppDetails = searchResultsScreen.classList.contains('active') ? searchResultsScreen : mainAppScreen;

            const clickedAppNameClean = resultItem.dataset.appNameClean;
            const clickedAppImageUrl = resultItem.dataset.imageUrl;
            const clickedApkUrl = resultItem.dataset.apkUrl; // Contains the full APK URL

            showScreen(appDetailsLoadingScreen); // Show rolling dot for app details
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

            // Populate the app details screen
            appDetailsAppIcon.src = clickedAppImageUrl; // Top left 2:2 circle icon
            appDetailsAppNameDisplay.textContent = clickedAppNameClean;

            // Initialize install button state based on local storage
            const isAlreadyDownloaded = localStorage.getItem(`downloadedApk_${clickedAppNameClean}`) === 'true';
            updateInstallButtonUI(appDetailsInstallButton, isAlreadyDownloaded ? 'open' : 'install', clickedAppNameClean);

            // Fetch and display app description
            const descriptionUrl = `http://localhost:8080/${clickedAppNameClean}.txt`;
            try {
                const response = await fetch(descriptionUrl);
                if (response.ok) {
                    const descriptionText = await response.text();
                    appDescriptionText.textContent = descriptionText.trim();
                } else {
                    appDescriptionText.textContent = `Description not found for ${clickedAppNameClean}.`;
                    console.warn(`Description file ${descriptionUrl} not found or failed to load.`);
                }
            } catch (error) {
                appDescriptionText.textContent = `Error loading description for ${clickedAppNameClean}.`;
                console.error(`Error fetching description for ${clickedAppNameClean}:`, error);
            }

            // Clear existing screenshot images and populate the screenshot scroll container
            appImagesScrollContainer.innerHTML = ''; // Clear any existing inner boxes (or placeholder content)
            const screenshotCount = 5; // User specified five inner rectangular boxes

            for (let i = 1; i <= screenshotCount; i++) {
                const screenshotUrl = `http://localhost:8080/${clickedAppNameClean}S${i}.png`;
                
                const innerImageBox = document.createElement('div');
                innerImageBox.classList.add('inner-image-box'); // Apply existing styling
                
                const screenshotImg = document.createElement('img');
                screenshotImg.classList.add('screenshot-image'); // New class for screenshot images
                screenshotImg.src = screenshotUrl;
                screenshotImg.alt = `Screenshot ${i} for ${clickedAppNameClean}`;
                
                screenshotImg.onerror = () => {
                    console.warn(`Screenshot ${screenshotUrl} failed to load. Displaying placeholder.`);
                    innerImageBox.style.backgroundColor = '#ccc'; // Grey background for missing image
                    innerImageBox.innerHTML = `<p style="font-size:0.8em; color:#666; text-align:center;">No Image S${i}</p>`;
                    // Ensure the placeholder text is centered
                    innerImageBox.style.display = 'flex';
                    innerImageBox.style.alignItems = 'center';
                    innerImageBox.style.justifyContent = 'center';
                };

                innerImageBox.appendChild(screenshotImg);
                appImagesScrollContainer.appendChild(innerImageBox);
            }

            showScreen(appDetailsScreen); // Show the app details screen
        });

        // Fetch image based on appName (remove .apk extension for image lookup)
        fetch(imageUrl)
            .then(response => {
                if (response.ok) {
                    appImage.src = imageUrl;
                } else {
                    appImage.src = imageUrl; // Set src even if not found, browser will show broken image
                }
            })
            .catch(error => {
                console.error('Error fetching image:', error);
                appImage.src = imageUrl; // Set src even on error, browser will show broken image
            });

        return resultItem;
    };

    // Populate Trending Apps
    // This runs on DOMContentLoaded regardless of login status, ensuring they are ready
    // when mainAppScreen becomes active.
    trendingAppsContainer.appendChild(createAppBox('Palmpay'));
    trendingAppsContainer.appendChild(createAppBox('Termux'));

    // --- Dark Mode Logic ---
    const toggleDarkMode = () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem(DARK_MODE_STORAGE_KEY, isDarkMode);
    };

    // Apply dark mode on load
    const savedDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY);
    if (savedDarkMode === 'true') {
        document.body.classList.add('dark-mode');
    }

    // Check for existing username on app load
    const savedUsername = localStorage.getItem(USERNAME_STORAGE_KEY);

    if (savedUsername) {
        // If username exists, bypass splash/welcome and go straight to main app screen
        usernameInitial.textContent = savedUsername.charAt(0).toUpperCase();
        showScreen(mainAppScreen);
        // No need for further timeouts or event listeners for initial flow
    } else {
        // Initial splash screen delay if no username is saved
        setTimeout(() => {
            showScreen(welcomeScreen);
        }, 3000); // 3000 milliseconds = 3 seconds

        // Sign up button click handler (only attach if not auto-logged in)
        signupButton.addEventListener('click', () => {
            showScreen(signupLoadingScreen);

            setTimeout(() => {
                showScreen(usernameInputScreen);
                loginUsernameInput.focus(); // Focus on the input field
            }, 3000); // Display rolling dot for 3 seconds
        });
    }

    // Continue button click handler (always attach, as it's part of the sign-up flow)
    continueButton.addEventListener('click', async () => {
        const username = loginUsernameInput.value.trim();
        if (!username) {
            alert("Please enter a username to continue.");
            return;
        }

        showScreen(processingScreen);
        processingMessage.textContent = ''; // Clear previous message

        const messages = [
            "Connecting to the local host database",
            "Creating username just for your account, public access not implemented",
            "Extracting data from the local storage for receiving available apps",
            "account ready"
        ];

        // Sequence of messages with delays
        for (let i = 0; i < messages.length; i++) {
            processingMessage.textContent = messages[i];
            await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2 seconds for each message
        }

        // After the last message and 2 seconds, remove word and rolling dots
        processingMessage.textContent = ''; // Remove the last message
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait another 2 seconds as per instruction

        // Save username to local storage after successful account creation
        localStorage.setItem(USERNAME_STORAGE_KEY, username);

        // Transition to the main app screen
        showScreen(mainAppScreen);
        usernameInitial.textContent = username.charAt(0).toUpperCase(); // Display first letter of username
    });

    // Main search input event listener
    mainSearchInput.addEventListener('input', () => {
        if (mainSearchInput.value.trim().length > 0) {
            searchIconButton.style.display = 'flex'; // Show icon when typing
        } else {
            searchIconButton.style.display = 'none'; // Hide icon when input is empty
        }
    });

    // Search icon button click handler
    searchIconButton.addEventListener('click', async () => {
        const query = mainSearchInput.value.trim();
        if (!query) {
            return;
        }

        showScreen(searchLoadingScreen); // Display rolling dot

        await new Promise(resolve => setTimeout(resolve, 1000)); // Display rolling dot for 1 second

        // Clear previous results
        searchResultsContainer.innerHTML = '';
        searchQueryDisplay.textContent = `results for "${query}"`; // Display the exact query

        const lowerCaseQuery = query.toLowerCase();
        let resultsToDisplay = [];

        // If query is 2 to 4 alphabets, search for apps that start with it
        if (lowerCaseQuery.length >= 2 && lowerCaseQuery.length <= 4 && /^[a-z]+$/.test(lowerCaseQuery)) {
            resultsToDisplay = availableApps.filter(appName => 
                appName.toLowerCase().startsWith(lowerCaseQuery)
            );
        } else {
            // Otherwise, perform an exact match search
            // (or if the query is not purely alphabetic in the 2-4 length range)
            const exactMatch = availableApps.find(app => app.toLowerCase() === lowerCaseQuery);
            if (exactMatch) {
                 resultsToDisplay.push(exactMatch);
            } else {
                 resultsToDisplay.push(query); // Treat the query as a potential app name for display/lookup
            }
        }

        if (resultsToDisplay.length > 0) {
            resultsToDisplay.forEach(appName => {
                searchResultsContainer.appendChild(createAppBox(appName));
            });
        } else {
            // Display a message if no results are found
            const noResultsMessage = document.createElement('p');
            noResultsMessage.textContent = `No results found for "${query}"`;
            noResultsMessage.style.textAlign = 'center';
            noResultsMessage.style.marginTop = '20px';
            searchResultsContainer.appendChild(noResultsMessage);
        }

        showScreen(searchResultsScreen); // Transition to results page
    });

    // Implement swipe-to-go-back functionality for search results screen AND account management screen AND app details screen
    const setupSwipeListener = (screenElement, getTargetScreen) => { // getTargetScreen is now a function
        let startX = 0;
        let isSwiping = false;
        const SWIPE_THRESHOLD = 75; // Minimum horizontal distance in pixels to consider it a swipe

        screenElement.addEventListener('touchstart', (e) => {
            // New: If on appDetailsScreen, prevent swipe-back if touch starts inside the scrollable image container
            if (screenElement === appDetailsScreen && appImagesScrollContainer.contains(e.target)) {
                isSwiping = false; // Ensure isSwiping is false
                return; // Do not start swipe-back logic
            }

            if (e.touches.length === 1) {
                startX = e.touches[0].clientX;
                isSwiping = true;
            }
        });

        screenElement.addEventListener('touchmove', (e) => {
            if (!isSwiping || e.touches.length !== 1) {
                return;
            }

            const currentX = e.touches[0].clientX;
            const deltaX = currentX - startX;

            if (deltaX > SWIPE_THRESHOLD) {
                isSwiping = false;
                const targetScreen = typeof getTargetScreen === 'function' ? getTargetScreen() : getTargetScreen;
                if (targetScreen) {
                    showScreen(targetScreen);
                }
            }
        });

        screenElement.addEventListener('touchend', () => {
            isSwiping = false;
        });

        screenElement.addEventListener('touchcancel', () => {
            isSwiping = false;
        });
    };

    setupSwipeListener(searchResultsScreen, () => mainAppScreen);
    setupSwipeListener(accountManagementScreen, () => mainAppScreen);
    setupSwipeListener(appDetailsScreen, () => screenBeforeAppDetails); // Return to the actual screen before app details

    // --- Account Management Functionality ---
    usernameInitialContainer.addEventListener('click', () => {
        const currentUsername = localStorage.getItem(USERNAME_STORAGE_KEY);
        if (currentUsername) {
            managedUsernameDisplay.textContent = currentUsername;
            showScreen(accountManagementScreen);
        }
    });

    darkModeBox.addEventListener('click', toggleDarkMode);

    contactSupportBox.addEventListener('click', () => {
        window.open("https://wa.me/2347079837423?text=Hello Granxy I'm a Granxy App Store User", '_blank');
    });

    // --- Install Button Logic (App Details Screen) ---
    const updateInstallButtonUI = (buttonElement, state, appName) => {
        const textSpan = buttonElement.querySelector('.install-button-text');
        let progressBar = buttonElement.querySelector('.install-progress-bar');

        // Clear existing progress bar
        if (progressBar) {
            progressBar.remove();
            progressBar = null;
        }

        buttonElement.classList.remove('install-active', 'downloading-active', 'open-active'); // Clean up old states

        if (state === 'install') {
            textSpan.textContent = 'Install';
            buttonElement.classList.add('install-active');
        } else if (state === 'downloading') {
            textSpan.textContent = ''; // Remove "Install" word during download
            buttonElement.classList.add('downloading-active');
            
            progressBar = document.createElement('div');
            progressBar.classList.add('install-progress-bar');
            buttonElement.appendChild(progressBar);
            progressBar.style.width = '0%'; // Start from 0
        } else if (state === 'open') {
            textSpan.textContent = 'Open';
            buttonElement.classList.add('open-active');
        }
    };

    appDetailsInstallButton.addEventListener('click', async () => {
        const currentAppName = appDetailsAppNameDisplay.textContent; // Get the app name from the display
        const apkUrl = `http://localhost:8080/${currentAppName}.apk`;
        const isDownloaded = localStorage.getItem(`downloadedApk_${currentAppName}`) === 'true';

        if (isDownloaded) {
            // State: "Open" - User wants to open the downloaded APK
            console.log(`Attempting to open downloaded APK: ${apkUrl}`);
            openFileUrl(apkUrl); 
        } else {
            // State: "Install" - User wants to download
            updateInstallButtonUI(appDetailsInstallButton, 'downloading', currentAppName);

            // Simulate download progress
            const progressBar = appDetailsInstallButton.querySelector('.install-progress-bar');
            if (!progressBar) return; // Should not happen if updateInstallButtonUI works

            let progress = 0;
            const duration = 3000; // 3 seconds for simulated download
            const interval = 50; // Update every 50ms
            const steps = duration / interval;
            const increment = 100 / steps;

            const animateProgress = () => {
                if (progress < 100) {
                    progress += increment;
                    progressBar.style.width = `${progress}%`;
                    requestAnimationFrame(animateProgress);
                } else {
                    progressBar.style.width = '100%'; // Ensure it fills completely
                    // Download complete, now simulate check for storage
                    localStorage.setItem(`downloadedApk_${currentAppName}`, 'true'); // Simulate successful download
                    updateInstallButtonUI(appDetailsInstallButton, 'open', currentAppName);
                }
            };
            requestAnimationFrame(animateProgress);
        }
    });
});