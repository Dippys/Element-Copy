// Popup script for Element Copy extension
let extensionEnabled = true;
let currentKeybinds = {
  copyElement: 'Ctrl+Shift+C',
  selectParent: 'Ctrl+Shift+ArrowUp',
  selectChild: 'Ctrl+Shift+ArrowDown',
  copySelected: 'Ctrl+Shift+Enter',
  cancel: 'Escape'
};

const defaultKeybinds = {
  copyElement: 'Ctrl+Shift+C',
  selectParent: 'Ctrl+Shift+ArrowUp',
  selectChild: 'Ctrl+Shift+ArrowDown',
  copySelected: 'Ctrl+Shift+Enter',
  cancel: 'Escape'
};

const actionLabels = {
  copyElement: 'Copy element under cursor',
  selectParent: 'Select parent element',
  selectChild: 'Select child element',
  copySelected: 'Copy selected element',
  cancel: 'Cancel selection'
};

let currentEditingAction = null;

// DOM elements
const toggleSwitch = document.getElementById('toggleSwitch');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const keybindEditor = document.getElementById('keybindEditor');
const keybindInput = document.getElementById('keybindInput');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const resetBtn = document.getElementById('resetBtn');
const editingLabel = document.getElementById('editingLabel');

// Load saved settings when popup opens
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
});

function loadSettings() {
  // Load extension enabled state
  chrome.storage.sync.get(['extensionEnabled'], (result) => {
    extensionEnabled = result.extensionEnabled !== false; // Default to true
    updateToggleState();
  });

  // Load custom keybinds
  chrome.storage.sync.get(['customKeybinds'], (result) => {
    if (result.customKeybinds) {
      currentKeybinds = { ...currentKeybinds, ...result.customKeybinds };
    }
    updateAllKeybindDisplays();
  });
}

function saveSettings() {
  chrome.storage.sync.set({
    extensionEnabled: extensionEnabled,
    customKeybinds: currentKeybinds
  });

  // Send message to content scripts to update their state
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'updateSettings',
        enabled: extensionEnabled,
        keybinds: currentKeybinds
      }).catch(() => {
        // Ignore errors if content script isn't loaded
      });
    }
  });
}

function setupEventListeners() {
  // Toggle switch functionality
  toggleSwitch.addEventListener('click', () => {
    extensionEnabled = !extensionEnabled;
    updateToggleState();
    saveSettings();
  });

  // Edit button listeners
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      startEditingKeybind(action);
    });
  });

  // Save keybind button
  saveBtn.addEventListener('click', () => {
    saveKeybind();
  });

  // Cancel keybind button
  cancelBtn.addEventListener('click', () => {
    hideKeybindEditor();
  });

  // Reset keybind button
  resetBtn.addEventListener('click', () => {
    resetKeybind();
  });

  // Keybind input handler
  keybindInput.addEventListener('keydown', (e) => {
    e.preventDefault();
    const keyCombination = captureKeyCombination(e);
    keybindInput.value = keyCombination;
  });

  // Prevent context menu on keybind input
  keybindInput.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });
}

function updateToggleState() {
  if (extensionEnabled) {
    toggleSwitch.classList.add('active');
    statusDot.classList.remove('disabled');
    statusText.textContent = 'Extension Enabled';
  } else {
    toggleSwitch.classList.remove('active');
    statusDot.classList.add('disabled');
    statusText.textContent = 'Extension Disabled';
  }
}

function updateAllKeybindDisplays() {
  Object.keys(currentKeybinds).forEach(action => {
    updateKeybindDisplay(action, currentKeybinds[action]);
  });
}

function updateKeybindDisplay(action, keybind) {
  const displayElement = document.getElementById(`${action}-display`);
  if (displayElement) {
    displayElement.innerHTML = '';
    const keys = keybind.split('+');
    keys.forEach(key => {
      const keyElement = document.createElement('span');
      keyElement.className = 'key';
      keyElement.textContent = key;
      displayElement.appendChild(keyElement);
    });
  }
}

function startEditingKeybind(action) {
  currentEditingAction = action;
  
  // Update all edit buttons
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.classList.remove('editing');
    btn.textContent = 'Edit';
  });
  
  // Mark current button as editing
  const currentBtn = document.querySelector(`.edit-btn[data-action="${action}"]`);
  if (currentBtn) {
    currentBtn.classList.add('editing');
    currentBtn.textContent = 'Editing...';
  }
  
  // Show editor
  editingLabel.textContent = `Editing: ${actionLabels[action]}`;
  keybindInput.value = formatKeybindForDisplay(currentKeybinds[action]);
  keybindEditor.classList.add('active');
  keybindInput.focus();
}

function hideKeybindEditor() {
  keybindEditor.classList.remove('active');
  keybindInput.value = '';
  currentEditingAction = null;
  
  // Reset all edit buttons
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.classList.remove('editing');
    btn.textContent = 'Edit';
  });
}

function captureKeyCombination(event) {
  const keys = [];
  
  if (event.ctrlKey) keys.push('Ctrl');
  if (event.altKey) keys.push('Alt');
  if (event.shiftKey) keys.push('Shift');
  if (event.metaKey) keys.push('Meta');
  
  // Add the main key
  if (event.key && !['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) {
    let key = event.key;
    
    // Convert arrow keys to readable format
    if (key === 'ArrowUp') key = '↑';
    if (key === 'ArrowDown') key = '↓';
    if (key === 'ArrowLeft') key = '←';
    if (key === 'ArrowRight') key = '→';
    
    // Convert other keys to readable format
    if (key === ' ') key = 'Space';
    if (key === 'Enter') key = 'Enter';
    if (key === 'Escape') key = 'Esc';
    if (key === 'Tab') key = 'Tab';
    if (key === 'Backspace') key = 'Backspace';
    if (key === 'Delete') key = 'Delete';
    
    // Convert function keys
    if (key.startsWith('F') && key.length <= 3) key = key; // F1, F2, etc.
    
    // Convert letter keys to uppercase
    if (key.length === 1 && key >= 'a' && key <= 'z') {
      key = key.toUpperCase();
    }
    
    keys.push(key);
  }
  
  return keys.join('+');
}

function formatKeybindForDisplay(keybind) {
  return keybind;
}

function saveKeybind() {
  const newKeybind = keybindInput.value.trim();
  
  if (newKeybind && currentEditingAction) {
    // Check for conflicts
    const conflict = checkKeybindConflict(newKeybind, currentEditingAction);
    if (conflict) {
      showNotification(`Keybind conflicts with: ${actionLabels[conflict]}`, 'error');
      return;
    }
    
    // Save the new keybind
    currentKeybinds[currentEditingAction] = newKeybind;
    updateKeybindDisplay(currentEditingAction, newKeybind);
    saveSettings();
    
    showNotification('Keybind updated successfully!', 'success');
  }
  
  hideKeybindEditor();
}

function resetKeybind() {
  if (currentEditingAction) {
    const defaultKeybind = defaultKeybinds[currentEditingAction];
    keybindInput.value = defaultKeybind;
    
    // Check for conflicts with default
    const conflict = checkKeybindConflict(defaultKeybind, currentEditingAction);
    if (conflict) {
      showNotification(`Default keybind conflicts with current ${actionLabels[conflict]} keybind. Please choose a different combination.`, 'error');
      return;
    }
    
    currentKeybinds[currentEditingAction] = defaultKeybind;
    updateKeybindDisplay(currentEditingAction, defaultKeybind);
    saveSettings();
    
    showNotification('Keybind reset to default!', 'success');
    hideKeybindEditor();
  }
}

function checkKeybindConflict(newKeybind, excludeAction) {
  for (const [action, keybind] of Object.entries(currentKeybinds)) {
    if (action !== excludeAction && keybind === newKeybind) {
      return action;
    }
  }
  return null;
}

function showNotification(message, type = 'success') {
  // Remove any existing notifications
  const existingNotifications = document.querySelectorAll('.temp-notification');
  existingNotifications.forEach(notif => notif.remove());
  
  // Create a temporary notification
  const notification = document.createElement('div');
  notification.className = 'temp-notification';
  notification.textContent = message;
  
  let backgroundColor;
  switch(type) {
    case 'success':
      backgroundColor = '#28a745';
      break;
    case 'error':
      backgroundColor = '#dc3545';
      break;
    default:
      backgroundColor = '#28a745';
  }
  
  notification.style.cssText = `
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    background: ${backgroundColor};
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 12px;
    z-index: 10000;
    animation: slideDown 0.3s ease;
    max-width: 300px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Add CSS for notification animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translate(-50%, -10px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
`;
document.head.appendChild(style);

// Check if content script is loaded on current tab
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'ping' }).then(() => {
      // Content script is loaded
    }).catch(() => {
      // Content script not loaded, show info
      const tipBox = document.querySelector('.tip-box .tip-text');
      if (tipBox) {
        tipBox.innerHTML = '<strong>Note:</strong> Refresh the page to activate the extension on this tab.';
      }
    });
  }
});
