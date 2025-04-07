/**
 * Global constants and configurations
 */
const timeoutBase = 450;
let isAnimationComplete = false;

/**
 * DOM elements
 */
const elements = {
  headline: document.getElementById("main-heading"),
  introText: document.getElementById("intro-text"),
  clientInfoIP: document.getElementById("ip-address"),
  clientInfoBrowser: document.getElementById("browser"),
  clientInfoSystem: document.getElementById("operating-system"),
  clientInfoPlace: document.getElementById("place"),
  aboutMe: document.getElementById("about-me"),
  footer: document.getElementById("footer"),
  links: document.getElementById("links"),
};

/**
 * Initialize animations and data loading
 */
document.addEventListener('DOMContentLoaded', function() {
  initializeHeadline();
  loadClientData();
  checkForTor();
});

/**
 * Initialize the headline animation
 */
function initializeHeadline() {
  setTimeout(() => {
    elements.headline.classList.remove("hide");
    elements.headline.classList.add("fadeIn", "animated", "glitch");
  }, timeoutBase + 1100);
}

/**
 * Load client data using the IP API
 */
function loadClientData() {
  fetchJSON("https://ipinfo.io/json")
    .then(ipInfo => {
      if (ipInfo && ipInfo.ip) {
        showIntro(ipInfo);
      }
    })
    .catch(error => {
      console.log('Error loading IP data:', error);
      showFallbackContent();
    });
}

/**
 * Utility function to fetch JSON data
 * @param {string} url - URL to fetch JSON from
 * @returns {Promise} - Promise with the JSON data
 */
async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json();
}

/**
 * Utility function to fade in elements
 * @param {HTMLElement} element - Element to fade in
 */
function fadeIn(element) {
  element.classList.remove("hide");
  element.classList.add("fadeIn", "animated");
}

/**
 * Display intro text with client information
 * @param {Object} ipInfo - Information about client's IP
 */
function showIntro(ipInfo) {
  setTimeout(() => {
    fadeIn(elements.introText);
    
    // Display client info
    elements.clientInfoIP.innerHTML = ipInfo.ip;
    const clientJS = new ClientJS();
    
    // Handle Edge browser detection
    if (/Edge\/12./i.test(navigator.userAgent)) {
      elements.clientInfoBrowser.innerHTML = "Edge";
    } else {
      elements.clientInfoBrowser.innerHTML = clientJS.getBrowser();
    }
    
    elements.clientInfoSystem.innerHTML = clientJS.getOS();
    elements.clientInfoPlace.innerHTML = `${ipInfo.city},\xa0${ipInfo.country}`;
    
    // Show the "I'm Nandu" text only after client info is displayed
    setTimeout(() => {
      fadeIn(elements.aboutMe);
      
      // Show footer and links after the "I'm Nandu" text
      setTimeout(() => {
        fadeIn(elements.footer);
        fadeIn(elements.links);
      }, timeoutBase * 3);
      
    }, 1500); // Small delay after client info appears
    
  }, timeoutBase + 4000);
}

/**
 * Show fallback content if IP data cannot be loaded
 */
function showFallbackContent() {
  console.log('Running fallback content due to error loading IP data');
  
  setTimeout(() => {
    fadeIn(elements.introText);
    
    // Replace the spans with generic text
    elements.clientInfoIP.innerHTML = "anonymous visitor";
    elements.clientInfoBrowser.innerHTML = "your browser";
    elements.clientInfoSystem.innerHTML = "your device";
    elements.clientInfoPlace.innerHTML = "somewhere in the world";
    
    // Show the "I'm Nandu" text after a delay
    setTimeout(() => {
      fadeIn(elements.aboutMe);
      
      // Show footer and links after the "I'm Nandu" text
      setTimeout(() => {
        fadeIn(elements.footer);
        fadeIn(elements.links);
      }, timeoutBase * 3);
      
    }, 1500);
    
  }, timeoutBase + 4000);
}

/**
 * Check if user is using Tor Browser
 * @returns {boolean} - True if user is using Tor
 */
function isTorBrowser() {
  // Check for common Tor Browser fingerprints
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('tor') || 
         document.hidden !== undefined && 
         navigator.doNotTrack === "1" && 
         window.screenX === 0 && 
         (window.screen.width === 1000 && window.screen.height === 900 ||
          window.outerWidth === 1000 && window.outerHeight === 900);
}

/**
 * Check if IP address is a Tor exit node
 * @returns {Promise<boolean>} - True if IP is a Tor exit node
 */
async function checkIsTorExitNode() {
  try {
    const response = await fetch('https://check.torproject.org/exit-addresses');
    if (response.ok) {
      const text = await response.text();
      const userIP = await fetchJSON("https://ipinfo.io/json").then(data => data.ip);
      return text.includes(userIP);
    }
  } catch (error) {
    console.error('Error checking Tor exit nodes:', error);
  }
  return false;
}

/**
 * Main function to check and block Tor users
 */
async function checkForTor() {
  if (isTorBrowser() || await checkIsTorExitNode()) {
    displayTorBlockScreen();
  }
}

/**
 * Display blocking screen for Tor users
 */
function displayTorBlockScreen() {
  const overlay = createTorBlockOverlay();
  document.body.appendChild(overlay);
  document.getElementById('main-content').style.display = 'none';
  document.getElementById('ufo-animation').style.display = 'none';
}

/**
 * Create overlay element for Tor block screen
 * @returns {HTMLElement} - Overlay element
 */
function createTorBlockOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'tor-block-overlay';
  overlay.innerHTML = `
    <h1 class="center-glitch" data-text="Access Denied">Access Denied</h1>
    <p>This website does not allow access via Tor Browser.</p>
    <p>Please use a standard web browser to view this content.</p>
    <p style="margin-top: 30px; font-size: 0.85em; opacity: 0.7;">
      Note: Some privacy-focused browsers may be incorrectly identified as Tor.<br>
      If you believe this is an error, try disabling privacy features and refreshing the page.
    </p>
  `;
  return overlay;
}
