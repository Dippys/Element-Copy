// Content script for additional functionality
let lastClickedElement = null;
let hoveredElement = null;
let currentSelectedElement = null;
let elementStack = [];
let extensionEnabled = true;
let currentKeybinds = {
  copyElement: 'Ctrl+Shift+C',
  selectParent: 'Ctrl+Shift+ArrowUp',
  selectChild: 'Ctrl+Shift+ArrowDown',
  copySelected: 'Ctrl+Shift+Enter',
  cancel: 'Escape'
};

console.log('Element Copy content script loaded');

// Load settings from storage
chrome.storage.sync.get(['extensionEnabled', 'customKeybinds'], (result) => {
  extensionEnabled = result.extensionEnabled !== false; // Default to true
  if (result.customKeybinds) {
    currentKeybinds = { ...currentKeybinds, ...result.customKeybinds };
  }
  
  if (extensionEnabled) {
    showNotification("Element Copy loaded! Use Ctrl+Shift+C to copy elements, ↑↓ to select parents/children", 'info');
  }
});

// Store the element that was right-clicked
document.addEventListener('contextmenu', (event) => {
  if (!extensionEnabled) return;
  
  lastClickedElement = event.target;
  console.log('Context menu opened on element:', lastClickedElement);
  
  // Store element position for the background script
  window.lastClickPosition = {
    x: event.clientX,
    y: event.clientY,
    element: event.target
  };
});

// Track hovered element for hotkey functionality
document.addEventListener('mouseover', (event) => {
  if (!extensionEnabled) return;
  
  hoveredElement = event.target;
  
  // Build element stack (current element and all its parents)
  elementStack = [];
  let current = event.target;
  while (current && current !== document.body && current !== document.documentElement) {
    elementStack.push(current);
    current = current.parentElement;
  }
});

// Hotkey functionality - Ctrl+Shift+C to copy element
let selectedElementIndex = 0;

function matchesKeybind(event, keybind) {
  const parts = keybind.split('+');
  
  // Check modifier keys
  const needsCtrl = parts.includes('Ctrl');
  const needsAlt = parts.includes('Alt');
  const needsShift = parts.includes('Shift');
  const needsMeta = parts.includes('Meta');
  
  if (event.ctrlKey !== needsCtrl) return false;
  if (event.altKey !== needsAlt) return false;
  if (event.shiftKey !== needsShift) return false;
  if (event.metaKey !== needsMeta) return false;
  
  // Check main key
  const mainKey = parts.find(part => !['Ctrl', 'Alt', 'Shift', 'Meta'].includes(part));
  if (!mainKey) return false;
  
  // Convert display keys back to event keys
  let eventKey = mainKey;
  if (mainKey === '↑') eventKey = 'ArrowUp';
  if (mainKey === '↓') eventKey = 'ArrowDown';
  if (mainKey === '←') eventKey = 'ArrowLeft';
  if (mainKey === '→') eventKey = 'ArrowRight';
  if (mainKey === 'Esc') eventKey = 'Escape';
  if (mainKey === 'Space') eventKey = ' ';
  if (mainKey === 'Tab') eventKey = 'Tab';
  if (mainKey === 'Backspace') eventKey = 'Backspace';
  if (mainKey === 'Delete') eventKey = 'Delete';
  
  // Handle function keys (F1, F2, etc.)
  if (mainKey.startsWith('F') && mainKey.length <= 3) {
    eventKey = mainKey;
  }
  
  // Handle letter keys (they should be case insensitive)
  if (mainKey.length === 1 && mainKey >= 'A' && mainKey <= 'Z') {
    return event.key.toLowerCase() === mainKey.toLowerCase() || event.code === `Key${mainKey}`;
  }
  
  return event.key === eventKey || event.code === `Key${eventKey.toUpperCase()}`;
}

document.addEventListener('keydown', (event) => {
  if (!extensionEnabled) return;
  
  // Copy element under cursor
  if (matchesKeybind(event, currentKeybinds.copyElement)) {
    event.preventDefault();
    
    if (hoveredElement) {
      currentSelectedElement = hoveredElement;
      selectedElementIndex = 0;
      copyCurrentElement();
    } else {
      showNotification("No element under cursor", 'error');
    }
  }
  
  // Arrow up to select parent element
  if (matchesKeybind(event, currentKeybinds.selectParent)) {
    event.preventDefault();
    
    if (elementStack.length > 0 && selectedElementIndex < elementStack.length - 1) {
      selectedElementIndex++;
      currentSelectedElement = elementStack[selectedElementIndex];
      highlightCurrentElement();
      showElementInfo();
    }
  }
  
  // Arrow down to select child element
  if (matchesKeybind(event, currentKeybinds.selectChild)) {
    event.preventDefault();
    
    if (elementStack.length > 0 && selectedElementIndex > 0) {
      selectedElementIndex--;
      currentSelectedElement = elementStack[selectedElementIndex];
      highlightCurrentElement();
      showElementInfo();
    }
  }
  
  // Enter to copy currently selected element
  if (matchesKeybind(event, currentKeybinds.copySelected)) {
    event.preventDefault();
    
    if (currentSelectedElement) {
      copyCurrentElement();
    }
  }
  
  // Escape to cancel selection
  if (matchesKeybind(event, currentKeybinds.cancel)) {
    event.preventDefault();
    clearSelection();
  }
});

function copyCurrentElement() {
  if (currentSelectedElement) {
    const elementHTML = currentSelectedElement.outerHTML;
    console.log('Copying element HTML:', elementHTML.substring(0, 100) + '...');
    
    navigator.clipboard.writeText(elementHTML).then(() => {
      console.log('Successfully copied to clipboard');
      const tagName = currentSelectedElement.tagName.toLowerCase();
      const className = currentSelectedElement.className ? `.${currentSelectedElement.className.split(' ').join('.')}` : '';
      showNotification(`Element copied: <${tagName}${className}>`);
      clearSelection();
    }).catch(err => {
      console.error('Failed to copy element: ', err);
      fallbackCopyTextToClipboard(elementHTML);
    });
  }
}

function highlightCurrentElement() {
  if (currentSelectedElement) {
    const overlay = createHighlightOverlay();
    const rect = currentSelectedElement.getBoundingClientRect();
    
    overlay.style.cssText = `
      position: absolute;
      pointer-events: none;
      border: 3px solid #ff6b6b;
      background: rgba(255, 107, 107, 0.2);
      z-index: 2147483646;
      transition: all 0.2s ease;
      display: block;
      left: ${rect.left + window.scrollX}px;
      top: ${rect.top + window.scrollY}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
    `;
  }
}

function showElementInfo() {
  if (currentSelectedElement) {
    const tagName = currentSelectedElement.tagName.toLowerCase();
    const className = currentSelectedElement.className ? `.${currentSelectedElement.className.split(' ').join('.')}` : '';
    const id = currentSelectedElement.id ? `#${currentSelectedElement.id}` : '';
    showNotification(`Selected: <${tagName}${id}${className}> (${selectedElementIndex + 1}/${elementStack.length})`, 'info');
  }
}

function clearSelection() {
  currentSelectedElement = null;
  selectedElementIndex = 0;
  if (highlightOverlay) {
    highlightOverlay.style.display = 'none';
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  
  // Handle settings updates from popup
  if (request.action === "updateSettings") {
    extensionEnabled = request.enabled;
    if (request.keybinds) {
      currentKeybinds = request.keybinds;
    }
    
    if (extensionEnabled) {
      showNotification("Element Copy enabled", 'info');
    } else {
      showNotification("Element Copy disabled", 'error');
      clearSelection();
    }
    
    sendResponse({success: true});
    return true;
  }
  
  // Handle ping from popup
  if (request.action === "ping") {
    sendResponse({success: true, enabled: extensionEnabled});
    return true;
  }
  
  if (request.action === "copyElement") {
    if (!extensionEnabled) {
      sendResponse({success: false, error: "Extension is disabled"});
      return true;
    }
    
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
  
  let backgroundColor;
  switch(type) {
    case 'success':
      backgroundColor = '#4CAF50';
      break;
    case 'error':
      backgroundColor = '#f44336';
      break;
    case 'info':
      backgroundColor = '#2196F3';
      break;
    default:
      backgroundColor = '#4CAF50';
  }
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${backgroundColor};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;
    font-size: 13px;
    font-weight: 500;
    z-index: 2147483647;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transition: all 0.3s ease;
    transform: translateX(100%);
    max-width: 350px;
    word-wrap: break-word;
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  requestAnimationFrame(() => {
    notification.style.transform = 'translateX(0)';
  });
  
  // Remove notification after different durations based on type
  const duration = type === 'info' ? 2000 : 3000;
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, duration);
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
  if (!extensionEnabled) return;
  
  if (event.ctrlKey && !event.shiftKey) { // Only highlight when Ctrl is held (but not Ctrl+Shift)
    const overlay = createHighlightOverlay();
    const rect = event.target.getBoundingClientRect();
    
    overlay.style.cssText = `
      position: absolute;
      pointer-events: none;
      border: 2px solid #007acc;
      background: rgba(0, 122, 204, 0.1);
      z-index: 2147483646;
      transition: all 0.1s ease;
      display: block;
      left: ${rect.left + window.scrollX}px;
      top: ${rect.top + window.scrollY}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
    `;
  }
});

document.addEventListener('mouseout', () => {
  if (highlightOverlay && !currentSelectedElement) {
    highlightOverlay.style.display = 'none';
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key === 'Control' && highlightOverlay && !currentSelectedElement) {
    highlightOverlay.style.display = 'none';
  }
});
