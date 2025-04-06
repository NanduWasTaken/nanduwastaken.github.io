/**
 * Global constants and configurations
 */
const timeoutBase = 450;
let isAnimationComplete = false;

/**
 * DOM elements
 */
const headline = document.getElementById("main-heading");
const introText = document.getElementById("intro-text");
const clientInfoIP = document.getElementById("ip-address");
const clientInfoBrowser = document.getElementById("browser");
const clientInfoSystem = document.getElementById("operating-system");
const clientInfoPlace = document.getElementById("place");
const aboutMe = document.getElementById("about-me");
const footer = document.getElementById("footer");
const links = document.getElementById("links");

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
    headline.classList.remove("hide");
    headline.classList.add("fadeIn", "animated", "glitch");
  }, timeoutBase + 1100);
}

/**
 * Load client data using the IP API
 */
function loadClientData() {
  getIpData.then(ipInfo => {
    if (ipInfo && ipInfo !== "" && ipInfo.ip !== undefined && ipInfo.ip !== "undefined") {
      showIntro(ipInfo);
    }
  }).catch(error => {
    console.log('Error loading IP data:', error);
    showFallbackContent();
  });
}

/**
 * Utility function to fetch JSON data
 * @param {string} url - URL to fetch JSON from
 * @returns {Promise} - Promise with the JSON data
 */
const getJSON = (url) => {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = () => {
      let status = xhr.status;
      status === 200 ? resolve(xhr.response) : reject({
        status: xhr.status,
        statusText: xhr.statusText,
      });
    };
    xhr.onerror = () => {
      reject({
        status: xhr.status,
        statusText: xhr.statusText,
      });
    };
    xhr.send();
  });
};

/**
 * Utility function to fade in elements
 * @param {HTMLElement} element - Element to fade in
 */
const fadeIn = element => {
  element.classList.remove("hide");
  element.classList.add("fadeIn", "animated");
}

/**
 * Fetch IP data from API
 */
const getIpData = getJSON("https://ipinfo.io/json");

/**
 * Display intro text with client information
 * @param {Object} ipInfo - Information about client's IP
 */
function showIntro(ipInfo) {
  setTimeout(() => {
    fadeIn(introText);
    
    // Display client info
    clientInfoIP.innerHTML = ipInfo.ip;
    const clientJS = new ClientJS();
    
    // Handle Edge browser detection
    if (/Edge\/12./i.test(navigator.userAgent)) {
      clientInfoBrowser.innerHTML = "Edge";
    } else {
      clientInfoBrowser.innerHTML = clientJS.getBrowser();
    }
    
    clientInfoSystem.innerHTML = clientJS.getOS();
    clientInfoPlace.innerHTML = ipInfo.city + "," + "\xa0" + ipInfo.country;
    
    // Show the "I'm Nandu" text only after client info is displayed
    setTimeout(() => {
      fadeIn(aboutMe);
      
      // Show footer and links after the "I'm Nandu" text
      setTimeout(() => {
        fadeIn(footer);
        fadeIn(links);
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
    fadeIn(introText);
    
    // Replace the spans with generic text
    clientInfoIP.innerHTML = "anonymous visitor";
    clientInfoBrowser.innerHTML = "your browser";
    clientInfoSystem.innerHTML = "your device";
    clientInfoPlace.innerHTML = "somewhere in the world";
    
    // Show the "I'm Nandu" text after a delay
    setTimeout(() => {
      fadeIn(aboutMe);
      
      // Show footer and links after the "I'm Nandu" text
      setTimeout(() => {
        fadeIn(footer);
        fadeIn(links);
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
      const userIP = await getIpData.then(data => data.ip);
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
    <p style="margin-top: 30px; font-size: 0.85em; opacity: 0.7;">Note: Some privacy-focused browsers may be incorrectly identified as Tor.<br>If you believe this is an error, try disabling privacy features or use a different browser.</p>
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
