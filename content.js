// Content script for additional functionality
let lastClickedElement = null;

console.log('Element Copy content script loaded');

// Store the element that was right-clicked
document.addEventListener('contextmenu', (event) => {
  lastClickedElement = event.target;
  console.log('Context menu opened on element:', lastClickedElement);
  
  // Store element position for the background script
  window.lastClickPosition = {
    x: event.clientX,
    y: event.clientY,
    element: event.target
  };
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  
  if (request.action === "copyElement") {
    let elementToCopy = lastClickedElement;
    
    // If we have coordinates, try to get element at that position
    if (request.x && request.y && !elementToCopy) {
      elementToCopy = document.elementFromPoint(request.x, request.y);
      console.log('Found element at coordinates:', elementToCopy);
    }
    
    if (elementToCopy) {
      const elementHTML = elementToCopy.outerHTML;
      console.log('Copying element HTML:', elementHTML.substring(0, 100) + '...');
      
      // Copy to clipboard
      navigator.clipboard.writeText(elementHTML).then(() => {
        console.log('Successfully copied to clipboard');
        showNotification("Element copied to clipboard!");
        sendResponse({success: true});
      }).catch(err => {
        console.error('Failed to copy element: ', err);
        fallbackCopyTextToClipboard(elementHTML);
        sendResponse({success: false, error: err.message});
      });
    } else {
      console.error('No element found to copy');
      showNotification("No element found to copy", 'error');
      sendResponse({success: false, error: "No element selected"});
    }
  }
  return true; // Will respond asynchronously
});

// Enhanced notification function
function showNotification(message, type = 'success') {
  // Remove any existing notifications
  const existingNotifications = document.querySelectorAll('.element-copy-notification');
  existingNotifications.forEach(notif => notif.remove());
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'element-copy-notification';
  notification.textContent = message;
  
  const backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${backgroundColor};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    z-index: 2147483647;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transition: all 0.3s ease;
    transform: translateX(100%);
    max-width: 300px;
    word-wrap: break-word;
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  requestAnimationFrame(() => {
    notification.style.transform = 'translateX(0)';
  });
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Fallback function for copying text
function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 2em;
    height: 2em;
    padding: 0;
    border: none;
    outline: none;
    box-shadow: none;
    background: transparent;
    opacity: 0;
    z-index: -1;
  `;
  
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    const successful = document.execCommand('copy');
    if (successful) {
      showNotification("Element copied to clipboard!");
    } else {
      showNotification("Failed to copy element", 'error');
    }
  } catch (err) {
    console.error('Fallback: Unable to copy', err);
    showNotification("Failed to copy element", 'error');
  }
  
  document.body.removeChild(textArea);
}

// Add visual feedback when hovering over elements
let highlightOverlay = null;

function createHighlightOverlay() {
  if (highlightOverlay) return highlightOverlay;
  
  highlightOverlay = document.createElement('div');
  highlightOverlay.style.cssText = `
    position: absolute;
    pointer-events: none;
    border: 2px solid #007acc;
    background: rgba(0, 122, 204, 0.1);
    z-index: 2147483646;
    transition: all 0.1s ease;
    display: none;
  `;
  document.body.appendChild(highlightOverlay);
  return highlightOverlay;
}

// Show element highlight on hover (optional feature)
document.addEventListener('mouseover', (event) => {
  if (event.ctrlKey) { // Only highlight when Ctrl is held
    const overlay = createHighlightOverlay();
    const rect = event.target.getBoundingClientRect();
    
    overlay.style.cssText += `
      display: block;
      left: ${rect.left + window.scrollX}px;
      top: ${rect.top + window.scrollY}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
    `;
  }
});

document.addEventListener('mouseout', () => {
  if (highlightOverlay) {
    highlightOverlay.style.display = 'none';
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key === 'Control' && highlightOverlay) {
    highlightOverlay.style.display = 'none';
  }
});
