// Background script for handling context menu
chrome.runtime.onInstalled.addListener(() => {
  console.log('Element Copy extension installed');
  // Create context menu item
  chrome.contextMenus.create({
    id: "copyElement",
    title: "Copy Element",
    contexts: ["all"]
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('Context menu clicked:', info.menuItemId);
  console.log('Tab info:', tab);
  
  if (info.menuItemId === "copyElement") {
    // Validate tab and tab ID
    if (!tab || typeof tab.id !== 'number' || tab.id < 0) {
      console.error('Invalid tab ID:', tab?.id);
      return;
    }
    
    console.log('Sending message to content script with coords:', info.pageX, info.pageY);
    // Send message to content script to copy element
    chrome.tabs.sendMessage(tab.id, {
      action: "copyElement",
      x: info.pageX,
      y: info.pageY
    }).catch(err => {
      console.error('Failed to send message to content script:', err);
    });
  }
});
