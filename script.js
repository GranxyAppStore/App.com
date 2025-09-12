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
    const usernameInitialCircle = document.getElementById('username-initial-circle'); // Get the circle element

    // New search-related elements
    const mainSearchInput = document.getElementById('main-search-input');
    const searchIconButton = document.getElementById('search-icon-button');
    const searchLoadingScreen = document.getElementById('search-loading-screen');
    const searchResultsScreen = document.getElementById('search-results-screen');
    const searchQueryDisplay = document.getElementById('search-query-display');
    const searchResultsContainer = document.getElementById('search-results-container'); // New: reference to container

    // Trending apps container
    const trendingAppsContainer = document.getElementById('trending-apps-container');

    // Video playback elements
    const videoElement = document.querySelector('.bottom-rectangular-box video');
    const videoPlaylist = [
        "http://localhost:8080/vid.mp4", // Keeping this as is, as it was in previous code
        "/vid1.mp4" // Changed to relative path for asset
        // Add more video URLs here if "the next MP4 file" refers to a known sequence
    ];
    let currentVideoIndex = 0;

    // New Account Management screen elements
    const accountManagementScreen = document.getElementById('account-management-screen');
    const accountBackButton = document.getElementById('account-back-button');
    const accountUsernameDisplay = document.getElementById('account-username-display');
    const darkModeOptionBox = document.getElementById('dark-mode-option-box');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const contactSupportBox = document.getElementById('contact-support-box');

    // New: App Lock elements
    const enableAppLockBox = document.getElementById('enable-app-lock-option-box');
    const appLockModal = document.getElementById('app-lock-modal');
    const appLockBox = appLockModal ? appLockModal.querySelector('.app-lock-box') : null; // The inner 4:4 box
    const appLockMessage = document.getElementById('app-lock-message');

    // Key for storing username in local storage
    const USERNAME_STORAGE_KEY = 'granxyAppUsername';
    const DARK_MODE_STORAGE_KEY = 'granxyAppDarkMode';
    // New: App Lock Constants & State
    const APP_LOCK_ENABLED_KEY = 'granxyAppLockEnabled';
    const BIOMETRIC_HOLD_DURATION_MS = 5000; // 5 seconds
    let isAppLockEnabled = localStorage.getItem(APP_LOCK_ENABLED_KEY) === 'true'; // Load state

    let touchHoldTimer = null; // To track touch-and-hold duration for biometrics
    let pendingAppLockAction = null; // Stores the function to execute after successful biometrics

    // List of available apps for search simulation (case-insensitive for startsWith check)
    const availableApps = [
        'Palmpay', 'Termux', 'YouTube', 'Whatsapp', 'Spotify', 'Telegram', 'Zoom',
        'Chrome', 'Gmail', 'Maps', 'Netflix', 'TikTok', 'Instagram', 'Facebook',
        'Twitter', 'Snapchat', 'Pinterest', 'Reddit', 'Discord', 'VLC'
    ];

    // Function to show a screen and hide others
    const showScreen = (screenToShow) => {
        [splashScreen, welcomeScreen, signupLoadingScreen, usernameInputScreen, processingScreen, mainAppScreen, searchLoadingScreen, searchResultsScreen, accountManagementScreen].forEach(screen => {
            if (screen === screenToShow) {
                screen.classList.add('active');
            } else {
                screen.classList.remove('active');
            }
        });
    };

    /**
     * Shows the app lock modal with a given message.
     * @param {string} message The message to display in the modal.
     */
    const showAppLockModal = (message) => {
        if (appLockModal) {
            appLockMessage.textContent = message;
            appLockModal.classList.add('active');
            if (appLockBox) {
                appLockBox.style.transform = 'scale(1)'; // Reset scale for animation
            }
        }
    };

    /**
     * Hides the app lock modal.
     */
    const hideAppLockModal = () => {
        if (appLockModal) {
            appLockModal.classList.remove('active');
        }
    };

    /**
     * Applies a shake animation to the body element.
     * @param {HTMLElement} element The element to apply the shake animation to.
     */
    const applyShakeAnimation = (element) => {
        element.classList.add('shake-animation');
        setTimeout(() => {
            element.classList.remove('shake-animation');
        }, 2000); // Shake for 2 seconds
    };

    /**
     * Creates and returns an app display box (8:2 rectangular box with 2:2 image and name).
     * @param {string} appName The name of the application.
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
        appTitle.textContent = appName; // Display the app name
        
        appDetails.append(appTitle);
        
        resultItem.append(squareBox, appDetails);

        // New: Add a "GET" button for trending apps
        const getButton = document.createElement('div');
        getButton.classList.add('get-button');
        getButton.textContent = 'GET';
        resultItem.appendChild(getButton);

        // Store the APK URL on the result item itself
        const apkUrl = `http://localhost:8080/${appName}.apk`;
        resultItem.dataset.apkUrl = apkUrl; 

        // --- NEW: Combined click listener for the entire app box ---
        const handleAppBoxClick = (event) => {
            const urlToOpen = resultItem.dataset.apkUrl;

            if (!urlToOpen) {
                console.warn('APK URL not found for this app item.');
                return;
            }

            // If App Lock is enabled, intercept the action
            if (isAppLockEnabled) {
                // Store the action to be performed after biometric verification
                pendingAppLockAction = () => {
                    // This is the original logic for opening/downloading the file
                    const link = document.createElement('a');
                    link.href = urlToOpen;
                    link.download = urlToOpen.substring(urlToOpen.lastIndexOf('/') + 1);
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    console.log(`File opened/downloaded: ${urlToOpen}`);
                    pendingAppLockAction = null; // Clear pending action
                };
                triggerAppLockBiometricVerification();
            } else {
                // If App Lock is NOT enabled, proceed directly
                const link = document.createElement('a');
                link.href = urlToOpen;
                link.download = urlToOpen.substring(urlToOpen.lastIndexOf('/') + 1);
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                console.log(`File opened/downloaded: ${urlToOpen}`);
            }
        };

        // Attach the combined click listener to the entire middle-rectangular-box
        resultItem.addEventListener('click', handleAppBoxClick);

        // Fetch image based on appName
        const imageUrl = `/${appName}.png`; // Changed to relative path for asset
        fetch(imageUrl)
            .then(response => {
                if (response.ok) {
                    appImage.src = imageUrl;
                } else {
                    appImage.src = ''; // Clear src, no error message displayed
                }
            })
            .catch(error => {
                console.error('Error fetching image:', error);
                appImage.src = ''; // Clear src, no error message displayed
            });

        return resultItem;
    };

    /**
     * Triggers the biometric verification process for an app lock.
     * The `pendingAppLockAction` is executed on successful verification.
     */
    const triggerAppLockBiometricVerification = () => {
        showAppLockModal('Touch and hold to read biometrics');

        // Store original message for potential reset
        const originalMessage = appLockMessage.textContent;

        const handleTouchStart = (e) => {
            e.preventDefault(); // Prevent text selection on long press
            if (touchHoldTimer) clearTimeout(touchHoldTimer); // Clear any existing timer
            if (appLockBox) appLockBox.style.transform = 'scale(1.05)'; // Visual feedback for touch

            touchHoldTimer = setTimeout(() => {
                // Successful 5-second hold: Biometric match simulated
                if (pendingAppLockAction) {
                    appLockMessage.textContent = 'Match'; // Indicate successful verification
                    setTimeout(() => {
                        hideAppLockModal();
                        pendingAppLockAction(); // Execute the stored action
                        removeTempListeners(); // Clean up listeners
                    }, 500); // Short delay before executing action and hiding
                }
            }, BIOMETRIC_HOLD_DURATION_MS);
        };

        const handleTouchEnd = () => {
            if (touchHoldTimer) {
                clearTimeout(touchHoldTimer);
                touchHoldTimer = null;
            }
            if (appLockBox) appLockBox.style.transform = 'scale(1)'; // Reset visual feedback

            // If released before 5 seconds, it's a simulated "bad fingerprint"
            if (appLockMessage.textContent === originalMessage && isAppLockEnabled) {
                appLockMessage.textContent = 'bad finger prints';
                applyShakeAnimation(document.body); // Shake the app background
                setTimeout(() => {
                    hideAppLockModal();
                    removeTempListeners(); // Clean up listeners
                }, 2000); // Remove modal after shake duration
            }
        };

        const removeTempListeners = () => {
            if (appLockBox) {
                appLockBox.removeEventListener('touchstart', handleTouchStart);
                appLockBox.removeEventListener('touchend', handleTouchEnd);
                appLockBox.removeEventListener('mousedown', handleTouchStart); // For desktop
                appLockBox.removeEventListener('mouseup', handleTouchEnd);     // For desktop
                appLockBox.removeEventListener('mouseleave', handleTouchEnd); // For desktop if drag out
            }
        };

        // Add temporary listeners for this specific interaction
        if (appLockBox) {
            appLockBox.addEventListener('touchstart', handleTouchStart, { passive: false });
            appLockBox.addEventListener('touchend', handleTouchEnd);
            appLockBox.addEventListener('mousedown', handleTouchStart); // For desktop
            appLockBox.addEventListener('mouseup', handleTouchEnd);     // For desktop
            appLockBox.addEventListener('mouseleave', handleTouchEnd); // For desktop if mouse leaves while holding
        }
    };

    // --- Video Playback Logic ---
    if (videoElement && videoPlaylist.length > 0) {
        // Set initial video source
        videoElement.src = videoPlaylist[currentVideoIndex];

        // Event listener for when a video ends
        videoElement.addEventListener('ended', () => {
            currentVideoIndex = (currentVideoIndex + 1) % videoPlaylist.length; // Move to the next video, loop back to start if at the end
            videoElement.src = videoPlaylist[currentVideoIndex];
            videoElement.play().catch(e => console.error("Error playing next video:", e)); // Attempt to play, catch potential autoplay errors
        });
    }

    // Populate Trending Apps
    // This runs on DOMContentLoaded regardless of login status, ensuring they are ready
    // when mainAppScreen becomes active.
    trendingAppsContainer.appendChild(createAppBox('Palmpay'));
    trendingAppsContainer.appendChild(createAppBox('Termux'));

    // --- Dark Mode Logic ---
    const applyDarkMode = (isEnabled) => {
        if (isEnabled) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        darkModeToggle.checked = isEnabled; // Ensure toggle state matches
    };

    // Check for saved dark mode preference on load
    const savedDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY);
    if (savedDarkMode === 'enabled') {
        applyDarkMode(true);
    } else {
        applyDarkMode(false); // Ensure light mode is applied if not explicitly enabled
    }

    // Dark mode toggle click handler
    darkModeOptionBox.addEventListener('click', (event) => {
        // Toggle the checkbox visually
        darkModeToggle.checked = !darkModeToggle.checked;
        // Apply the dark mode based on the new state
        const isEnabled = darkModeToggle.checked;
        applyDarkMode(isEnabled);
        localStorage.setItem(DARK_MODE_STORAGE_KEY, isEnabled ? 'enabled' : 'disabled');
    });

    // Check for existing username on app load
    let savedUsername = localStorage.getItem(USERNAME_STORAGE_KEY);

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
        savedUsername = username; // Update the savedUsername variable

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
            if (availableApps.map(app => app.toLowerCase()).includes(lowerCaseQuery)) {
                 resultsToDisplay.push(availableApps.find(app => app.toLowerCase() === lowerCaseQuery));
            }
            // If it's not an exact match from availableApps, fall back to trying the exact query
            // for image/apk names as was done previously.
            if (resultsToDisplay.length === 0) {
                 resultsToDisplay.push(query); // Treat the query as a potential app name
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

    // Implement swipe-to-go-back functionality for search results screen
    let startX = 0;
    let isSwiping = false;
    const SWIPE_THRESHOLD = 75; // Minimum horizontal distance in pixels to consider it a swipe

    searchResultsScreen.addEventListener('touchstart', (e) => {
        // Only consider single-touch events
        if (e.touches.length === 1) {
            startX = e.touches[0].clientX;
            isSwiping = true; // Start swiping from anywhere on the screen
        }
    });

    searchResultsScreen.addEventListener('touchmove', (e) => {
        if (!isSwiping || e.touches.length !== 1) {
            return;
        }

        const currentX = e.touches[0].clientX;
        const deltaX = currentX - startX;

        // If swiped right enough, go back to main app screen
        if (deltaX > SWIPE_THRESHOLD) {
            isSwiping = false; // Prevent further triggers for this swipe
            showScreen(mainAppScreen);
            // Optionally, clear search input or results if desired after going back
            // mainSearchInput.value = '';
            // searchIconButton.style.display = 'none';
            // searchResultsContainer.innerHTML = '';
            // searchQueryDisplay.textContent = '';
        }
    });

    searchResultsScreen.addEventListener('touchend', () => {
        isSwiping = false; // Reset swipe state
    });

    searchResultsScreen.addEventListener('touchcancel', () => {
        isSwiping = false; // Reset swipe state on cancel
    });

    // --- Account Management Screen Logic ---
    usernameInitialCircle.addEventListener('click', () => {
        showScreen(accountManagementScreen);
        // Display username in the header
        accountUsernameDisplay.textContent = `${savedUsername}, let's manage your account`;
        // Initial App Lock setup on load or when entering the screen
        if (enableAppLockBox) {
            if (isAppLockEnabled) {
                enableAppLockBox.style.display = 'none'; // Hide if already enabled
            } else {
                enableAppLockBox.style.display = 'flex'; // Show if not enabled
            }
        }
    });

    accountBackButton.addEventListener('click', () => {
        showScreen(mainAppScreen);
    });
    
    // Contact or Support Granxy click handler
    contactSupportBox.addEventListener('click', () => {
        const whatsappUrl = `https://wa.me/2347079837423?text=Hello Granxy it's me ${savedUsername} I am a Granxy App Store User`;
        window.open(whatsappUrl, '_blank');
    });

    // --- NEW: Enable App Lock Box Logic ---
    if (enableAppLockBox) {
        enableAppLockBox.addEventListener('click', () => {
            showAppLockModal('Touch and hold to read biometrics');

            const originalMessage = appLockMessage.textContent;

            const handleTouchStart = (e) => {
                e.preventDefault(); // Prevent text selection on long press
                if (touchHoldTimer) clearTimeout(touchHoldTimer); // Clear any existing timer
                if (appLockBox) appLockBox.style.transform = 'scale(1.05)'; // Visual feedback for touch

                touchHoldTimer = setTimeout(() => {
                    // Biometrics read successfully after 5 seconds
                    isAppLockEnabled = true;
                    localStorage.setItem(APP_LOCK_ENABLED_KEY, 'true');
                    appLockMessage.textContent = 'Done';
                    if (enableAppLockBox) enableAppLockBox.style.display = 'none'; // Hide permanently
                    setTimeout(hideAppLockModal, 1000); // Hide modal after 1 second
                    removeTempListeners(); // Clean up listeners
                }, BIOMETRIC_HOLD_DURATION_MS);
            };

            const handleTouchEnd = () => {
                if (touchHoldTimer) {
                    clearTimeout(touchHoldTimer);
                    touchHoldTimer = null;
                }
                if (appLockBox) appLockBox.style.transform = 'scale(1)'; // Reset visual feedback

                // If released before 5 seconds, it's not a successful registration
                if (appLockMessage.textContent === originalMessage) {
                    // Do nothing, just reset for next attempt
                    console.log("Fingerprint registration cancelled (released too early)");
                }
            };

            const removeTempListeners = () => {
                if (appLockBox) {
                    appLockBox.removeEventListener('touchstart', handleTouchStart);
                    appLockBox.removeEventListener('touchend', handleTouchEnd);
                    appLockBox.removeEventListener('mousedown', handleTouchStart); // For desktop
                    appLockBox.removeEventListener('mouseup', handleTouchEnd);     // For desktop
                    appLockBox.removeEventListener('mouseleave', handleTouchEnd); // For desktop if drag out
                }
            };

            // Add temporary listeners for this specific interaction
            if (appLockBox) {
                appLockBox.addEventListener('touchstart', handleTouchStart, { passive: false });
                appLockBox.addEventListener('touchend', handleTouchEnd);
                appLockBox.addEventListener('mousedown', handleTouchStart); // For desktop
                appLockBox.addEventListener('mouseup', handleTouchEnd);     // For desktop
                appLockBox.addEventListener('mouseleave', handleTouchEnd); // For desktop if mouse leaves while holding
            }
        });
    }
});