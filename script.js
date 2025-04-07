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

// Initialize the page
document.addEventListener('DOMContentLoaded', initPage);

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
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch(error => {
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
    
    // Set client IP
    if (ipInfo && ipInfo.ip) {
      clientInfoIP.textContent = ipInfo.ip;
    } else {
      clientInfoIP.textContent = "unknown";
    }
    
    // Set browser and OS info using ClientJS
    const clientJS = new ClientJS();
    
    // Fix Edge browser detection
    if (/Edge\/\d+/i.test(navigator.userAgent)) {
      clientInfoBrowser.textContent = "Edge";
    } else {
      clientInfoBrowser.textContent = clientJS.getBrowser();
    }
    
    // Set OS info
    clientInfoSystem.textContent = clientJS.getOS();
    
    // Set location info
    if (ipInfo && ipInfo.city && ipInfo.country) {
      clientInfoPlace.textContent = `${ipInfo.city}, ${ipInfo.country}`;
    } else {
      clientInfoPlace.textContent = "unknown location";
    }
  }, timeoutBase + 4000);
}

/**
 * Show about section after intro
 */
function showAboutSection() {
  setTimeout(() => {
    fadeIn(aboutMe);
    fadeIn(footer);
    fadeIn(links);
  }, (introText.classList.contains("hide") === false) ? timeoutBase * 15 : timeoutBase);
}

/**
 * Check if the user is using Tor Browser
 * @returns {boolean} - True if using Tor Browser
 */
function isTorBrowser() {
  return navigator.userAgent.includes("Tor") || 
         document.hidden !== undefined && 
         /Firefox/.test(navigator.userAgent) &&
         /rv:/.test(navigator.userAgent);
}

/**
 * Check if IP is a Tor exit node
 * @returns {Promise<boolean>} - True if IP is a Tor exit node
 */
async function checkIsTorExitNode() {
  try {
    const ipInfo = await getJSON("https://ipinfo.io/json");
    // Here you would ideally check against a Tor exit node list
    // For demo, we'll use a simplified check
    return false; // Replace with actual implementation
  } catch (error) {
    console.error("Error checking Tor exit node:", error);
    return false;
  }
}

/**
 * Block users using Tor Browser
 */
async function blockTorUsers() {
  if (isTorBrowser() || await checkIsTorExitNode()) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'black';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.color = 'white';
    overlay.style.fontFamily = 'Ubuntu Mono, monospace';
    overlay.style.padding = '20px';
    overlay.style.textAlign = 'center';

    // Add message with center-glitch class
    overlay.innerHTML = `
      <h1 class="center-glitch" data-text="Access Denied">Access Denied</h1>
      <p>This website does not allow access via Tor Browser.</p>
      <p>Please use a standard web browser to view this content.</p>
      <p style="margin-top: 30px; font-size: 0.85em; opacity: 0.7;">
        Note: Some privacy-focused browsers may be incorrectly identified as Tor.<br>
        If you believe this is an error, try disabling privacy features or using another browser.
      </p>
    `;

    // Add custom CSS for the center-aligned glitch effect
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .center-glitch {
        position: relative;
        font-size: 5vw;
        margin-bottom: 20px;
      }
      @media (max-width: 31.25em) {
        .center-glitch {
          font-size: 25px;
        }
      }
      @media (min-width: 43.75em) {
        .center-glitch {
          font-size: 35px;
        }
      }
      .center-glitch:before,
      .center-glitch:after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        width: 100%;
        background: black;
        clip: rect(0, 900px, 0, 0);
        overflow: hidden;
      }
      .center-glitch:after {
        left: 4px;
        text-shadow: 4px 0 #294ad8;
        color: white;
        animation: noise-anim 5s infinite linear alternate-reverse;
      }
      .center-glitch:before {
        left: -4px;
        text-shadow: -4px 0 #227131;
        color: white;
        animation: noise-anim-2 5s infinite linear alternate-reverse;
      }
    `;
    document.head.appendChild(styleElement);

    // Add to document
    document.body.appendChild(overlay);
    
    // Hide the main content
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('ufo-animation').style.display = 'none';
  }
}

/**
 * Initialize the page
 */
function initPage() {
  // Get IP data and show intro
  const ipDataPromise = getJSON("https://ipinfo.io/json");
  ipDataPromise
    .then(ipInfo => {
      if (ipInfo && ipInfo.ip) {
        showIntro(ipInfo);
      } else {
        throw new Error("Invalid IP data");
      }
    })
    .catch(error => {
      console.error('Error loading IP data:', error);
      // Show intro with default values
      showIntro({});
    });

  // Show about section after delay
  setTimeout(() => {
    showAboutSection();
  }, timeoutBase * 10);

  // Check for Tor users
  blockTorUsers();
}
