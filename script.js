/**
 * script.js
 * Updated: 2025-04-06
 */

const timeoutBase = 450;
let isAnimationComplete = false;

const headline = document.getElementById("main-heading");
const introText = document.getElementById("intro-text");
const clientInfoIP = document.getElementById("ip-address");
const clientInfoBrowser = document.getElementById("browser");
const clientInfoSystem = document.getElementById("operating-system");
const clientInfoPlace = document.getElementById("place");
const aboutMe = document.getElementById("about-me");
const footer = document.getElementById("footer");
const links = document.getElementById("links");

document.addEventListener('DOMContentLoaded', function() {
  initializeHeadline();
  loadClientData();
  checkForTor();
});

function initializeHeadline() {
  setTimeout(() => {
    headline.classList.remove("hide");
    headline.classList.add("fadeIn", "animated", "glitch");
  }, timeoutBase + 1100);
}

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

const fadeIn = element => {
  element.classList.remove("hide");
  element.classList.add("fadeIn", "animated");
}

const getIpData = getJSON("https://ipinfo.io/json");

function showIntro(ipInfo) {
  setTimeout(() => {
    fadeIn(introText);
    
    clientInfoIP.innerHTML = ipInfo.ip;
    const clientJS = new ClientJS();
    
    if (/Edge\/12./i.test(navigator.userAgent)) {
      clientInfoBrowser.innerHTML = "Edge";
    } else {
      clientInfoBrowser.innerHTML = clientJS.getBrowser();
    }
    
    clientInfoSystem.innerHTML = clientJS.getOS();
    clientInfoPlace.innerHTML = ipInfo.city + "," + "\xa0" + ipInfo.country;
    
    setTimeout(() => {
      fadeIn(aboutMe);
      
      setTimeout(() => {
        fadeIn(footer);
        fadeIn(links);
      }, timeoutBase * 3);
      
    }, 1500);
    
  }, timeoutBase + 4000);
}

function showFallbackContent() {
  setTimeout(() => {
    fadeIn(introText);
    
    clientInfoIP.innerHTML = "anonymous visitor";
    clientInfoBrowser.innerHTML = "your browser";
    clientInfoSystem.innerHTML = "your device";
    clientInfoPlace.innerHTML = "somewhere in the world";
    
    setTimeout(() => {
      fadeIn(aboutMe);
      
      setTimeout(() => {
        fadeIn(footer);
        fadeIn(links);
      }, timeoutBase * 3);
      
    }, 1500);
    
  }, timeoutBase + 4000);
}

function isTorBrowser() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    
    if (vendor === 'Mozilla' && renderer === 'Mozilla') {
      return true;
    }
  } catch (e) {}
  
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    
    ctx.font = '18px Arial';
    ctx.fillText('TorBrowserCheck', 10, 30);
    
    const dataURL = canvas.toDataURL();
    
    const canvas2 = document.createElement('canvas');
    canvas2.width = 200;
    canvas2.height = 50;
    const ctx2 = canvas2.getContext('2d');
    ctx2.font = '18px Arial';
    ctx2.fillText('TorBrowserCheck', 10, 30);
    const dataURL2 = canvas2.toDataURL();
    
    if (dataURL === dataURL2 && dataURL.length > 0) {
      return true;
    }
  } catch (e) {}
  
  const userAgent = navigator.userAgent;
  
  if (
    (userAgent.includes('Firefox/') && !userAgent.includes('Chrome')) &&
    navigator.doNotTrack === "1" &&
    !('speechSynthesis' in window) &&
    (navigator.plugins.length <= 3)
  ) {
    return true;
  }
  
  return false;
}

async function checkIsTorExitNode() {
  try {
    const ipData = await getIpData;
    const userIP = ipData.ip;
    
    const response = await fetch(`https://check.torproject.org/api/exit-addresses`);
    
    if (response.ok) {
      const text = await response.text();
      const exitNodes = parseExitNodeAddresses(text);
      
      if (exitNodes.includes(userIP)) {
        return true;
      }
    }
    
    const backupResponse = await fetch(`https://check.torproject.org/cgi-bin/TorBulkExitList.py?ip=1.1.1.1&port=443`);
    
    if (backupResponse.ok) {
      const text = await backupResponse.text();
      const exitNodes = text
        .split('\n')
        .filter(line => !line.startsWith('#') && line.trim() !== '')
        .map(line => line.trim());
      
      if (exitNodes.includes(userIP)) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking Tor exit nodes:', error);
    return false;
  }
}

function parseExitNodeAddresses(exitAddressesText) {
  const exitNodes = [];
  const lines = exitAddressesText.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('ExitAddress ')) {
      const parts = line.split(' ');
      if (parts.length >= 2) {
        exitNodes.push(parts[1]);
      }
    }
  }
  
  return exitNodes;
}

async function checkForTor() {
  const results = await Promise.allSettled([
    Promise.race([
      checkIsTorExitNode(),
      new Promise(resolve => setTimeout(() => resolve(false), 3000))
    ]),
    Promise.resolve(isTorBrowser())
  ]);
  
  const isTorUser = results.some(result => result.status === 'fulfilled' && result.value === true);
  
  if (isTorUser) {
    displayTorBlockScreen();
  }
}

function displayTorBlockScreen() {
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

  overlay.innerHTML = `
    <h1 class="center-glitch" data-text="Access Denied">Access Denied</h1>
    <p>This website does not allow access via Tor Browser.</p>
    <p>Please use a standard web browser to view this content.</p>
    <p style="margin-top: 30px; font-size: 0.85em; opacity: 0.7;">Note: Some privacy-focused browsers may be incorrectly identified as Tor.<br>If you believe this is an error, try disabling privacy features or using another browser.</p>
  `;

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

  document.body.appendChild(overlay);
  document.getElementById('main-content').style.display = 'none';
  document.getElementById('ufo-animation').style.display = 'none';
}
