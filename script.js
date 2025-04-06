let timeoutBase = 450;

const headline = document.getElementById("main-heading");
setTimeout(() => {
  headline.classList.remove("hide");
  headline.classList.add("fadeIn", "animated", "glitch");
  // updateScroll();
}, timeoutBase + 1100);


const getJSON = (url) => {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = () => {
      let status = xhr.status;
      status == 200 ? resolve(xhr.response) : reject({
        status: this.status,
        statusText: xhr.statusText,
      });
    };
    xhr.onerror = () => {
      reject({
        status: this.status,
        statusText: xhr.statusText,
      });
    };
    xhr.send();
  });
};

const fadeIn = element => {
  element.classList.remove("hide");
  element.classList.add("fadeIn", "animated")
}

// alternative: https://ipapi.co/json
const getIpData = getJSON("https://ipinfo.io/json");

const introText = document.getElementById("intro-text"),
  clientInfoIP = document.getElementById("ip-address"),
  clientInfoBrowser = document.getElementById("browser"),
  clientInfoSystem = document.getElementById("operating-system"),
  clientInfoPlace = document.getElementById("place");

function showIntro(ipInfo) {
  setTimeout(() => {
    fadeIn(introText)
    clientInfoIP.innerHTML = ipInfo.ip;
    const clientJS = new ClientJS();
    if (/Edge\/12./i.test(navigator.userAgent))
      // apparently Edge likes to think it's Chrome; according to the user agent...
      clientInfoBrowser.innerHTML = "Edge";
    else
      clientInfoBrowser.innerHTML = clientJS.getBrowser();
    clientInfoSystem.innerHTML = clientJS.getOS();
    clientInfoPlace.innerHTML = ipInfo.city + "," + "\xa0" + ipInfo.country;
  }, timeoutBase + 4000);
}

getIpData.then(ipInfo => {
  if (ipInfo && ipInfo != "" && ipInfo.ip != undefined && ipInfo.ip != "undefined")
    showIntro(ipInfo);
}).catch(error => {
  console.log('Hmmm, it seems like there\'s an issue... \n' +
    ' - running error handler to hide intro text (and continue to display other content)');
});

setTimeout(() => {
  const aboutMe = document.getElementById("about-me"),
    footer = document.getElementById("footer"),
    links = document.getElementById("links");
  setTimeout(() => {
    fadeIn(aboutMe);
    // fadeIn(footer);
    // fadeIn(links);
  }, (introText.classList.contains("hide") == false) ? timeoutBase * 15 : timeoutBase);
}, timeoutBase * 10);


// Function to detect Tor Browser
function isTorBrowser() {
  // Check for Tor Browser user agent characteristics
  const userAgent = navigator.userAgent.toLowerCase();
  const isTor = 
    // Look for Firefox with Tor characteristics
    (userAgent.indexOf('firefox') > -1 && 
     // Check for missing navigator properties that Tor Browser often modifies
     (navigator.doNotTrack === '1' || 
      navigator.mimeTypes.length === 0 ||
      navigator.plugins.length === 0)) ||
    // Check for other fingerprinting protections that Tor Browser enables
    navigator.hardwareConcurrency === 2;
  
  return isTor;
}

// Function to check if IP is a known Tor exit node using external API
async function checkIsTorExitNode() {
  try {
    // Use the Tor Project's exit node check API
    const response = await fetch('https://check.torproject.org/api/ip');
    const data = await response.json();
    return data.IsTor === true;
  } catch (error) {
    console.error('Error checking Tor exit node:', error);
    return false;
  }
}

// Main function to block Tor users
async function blockTorUsers() {
  if (isTorBrowser() || await checkIsTorExitNode()) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.color = 'white';
    overlay.style.fontFamily = 'Ubuntu Mono, monospace';
    overlay.style.padding = '20px';
    overlay.style.textAlign = 'center';

    // Add message
    overlay.innerHTML = `
      <h1 class="glitch" data-text="Access Denied">Access Denied</h1>
      <p>This website does not allow access via Tor Browser.</p>
      <p>Please use a standard web browser to view this content.</p>
    `;

    // Add to document
    document.body.appendChild(overlay);
    
    // Hide the main content
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('ufo-animation').style.display = 'none';
  }
}

// Run the check when the page loads
document.addEventListener('DOMContentLoaded', blockTorUsers);
