// Base timing for animations
const timeoutBase = 450;

// DOM elements
const headline = document.getElementById("main-heading");
const introText = document.getElementById("intro-text");
const clientInfoIP = document.getElementById("ip-address");
const clientInfoBrowser = document.getElementById("browser");
const clientInfoSystem = document.getElementById("operating-system");
const clientInfoPlace = document.getElementById("place");
const aboutMe = document.getElementById("about-me");
const footer = document.getElementById("footer");
const links = document.getElementById("links");
const rickrollContainer = document.getElementById("rickroll-container");
const rickrollAudio = document.getElementById("rickroll-audio");

// Initialize the page
document.addEventListener("DOMContentLoaded", initPage);

// Show the headline with animation
setTimeout(() => {
  headline.classList.remove("hide");
  headline.classList.add("fadeIn", "animated", "glitch");
}, timeoutBase + 1100);


/**
 * Fetch JSON data from a URL
 * @param {string} url - The URL to fetch from
 * @returns {Promise} - Promise containing the response
 */
function getJSON(url) {
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      return Promise.reject({
        status: error.message,
        statusText: error.message,
      });
    });
}

/**
 * Apply fade-in animation to an element
 * @param {HTMLElement} element - DOM element to animate
 */
function fadeIn(element) {
  if (element) {
    element.classList.remove("hide");
    element.classList.add("fadeIn", "animated");
  }
}

/**
 * Show user information in the intro text
 * @param {Object} ipInfo - Information about the user's IP
 */
function showIntro(ipInfo) {
  setTimeout(() => {
    fadeIn(introText);
    fadeIn(rickrollContainer);

    if (rickrollAudio) {
      rickrollAudio.currentTime = 0;
      rickrollAudio.play().catch(() => {
        // Autoplay might be blocked by browser until user interacts
      });
    }
    // Set client IP
    if (ipInfo && ipInfo.ip) {
      //clientInfoIP.textContent = ipInfo.ip;
      clientInfoIP.textContent = "9.9.9.9";
    } else {
      clientInfoIP.textContent = "unknown";
    }

    // Set browser and OS info using ClientJS
    const clientJS = new ClientJS();

    // Tor detection
    if (isTorBrowser()) {
      clientInfoBrowser.textContent = "TOR";
    } else if (/Edge\/\d+/i.test(navigator.userAgent)) {
      clientInfoBrowser.textContent = "Edge";
    } else {
      clientInfoBrowser.textContent = clientJS.getBrowser();
    }

    // Set OS info
    clientInfoSystem.textContent = clientJS.getOS();

    // Set location info
    if (ipInfo && ipInfo.city && ipInfo.country) {
      // clientInfoPlace.textContent = `${ipInfo.city}, ${ipInfo.country}`;
      clientInfoPlace.textContent = "RickRoll by, Rick Astley";
    } else {
      clientInfoPlace.textContent = "unknown location";
    }

    // Show about section after a delay of 5 seconds
    setTimeout(() => {
      fadeIn(aboutMe);
    }, 5000); // 5 seconds delay before showing the "I'm Nandu" section
  }, timeoutBase + 4000);
}

/**
 * Initialize the page
 */
function initPage() {
  // Get IP data and show intro
  getJSON("https://ipinfo.io/json")
    .then((ipInfo) => {
      if (ipInfo && ipInfo.ip) {
        showIntro(ipInfo);
      } else {
        throw new Error("Invalid IP data");
      }
    })
    .catch((error) => {
      console.error("Error loading IP data:", error);
      // Show intro with default values
      showIntro({});
    });

  // Show about section after delay
  setTimeout(() => {
    showAboutSection();
  }, timeoutBase * 10);
}

/**
 * Show about section after intro
 */
function showAboutSection() {
  setTimeout(
    () => {
      fadeIn(aboutMe);
    },
    introText.classList.contains("hide") === false
      ? timeoutBase * 15
      : timeoutBase
  );
}

/**
 * Check if the user is using Tor Browser
 * @returns {boolean} - True if using Tor Browser
 */
function isTorBrowser() {
  const userAgent = navigator.userAgent;
  const isTor =
    userAgent.includes("Tor") ||
    (document.hidden !== undefined &&
      /Firefox/.test(userAgent) &&
      /rv:/.test(userAgent));

  // Additional checks for Tor Browser
  const torPatterns = [
    /tor/i,
    /tbb/i,
    /tbb\/[\d.]+/i,
    /torbrowser/i,
    /tor browser/i,
  ];

  return isTor || torPatterns.some((pattern) => pattern.test(userAgent));
}
