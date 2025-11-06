/**
 * Background Service Worker for Manga OCR Extension
 * Handles extension lifecycle, context menus, and messaging
 */

// Initialize extension on install
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Manga OCR Extension installed:', details.reason);

  // Create context menu items
  createContextMenus();

  // Set default settings
  if (details.reason === 'install') {
    chrome.storage.local.set({
      language: 'auto', // auto, eng, jpn
      ocrMode: 'local', // local or remote
      remoteEndpoint: '',
      showConfidence: true,
      autoClean: true
    });
  }
});

// Create context menu items
function createContextMenus() {
  chrome.contextMenus.removeAll(() => {
    // Context menu for images
    chrome.contextMenus.create({
      id: 'ocr-image',
      title: 'Run Manga OCR on Image',
      contexts: ['image']
    });

    // Context menu for page
    chrome.contextMenus.create({
      id: 'ocr-page',
      title: 'Run Manga OCR on Page',
      contexts: ['page']
    });

    // Context menu for selection
    chrome.contextMenus.create({
      id: 'ocr-selection',
      title: 'Capture Region for OCR',
      contexts: ['page']
    });
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('Context menu clicked:', info.menuItemId);

  switch (info.menuItemId) {
    case 'ocr-image':
      handleImageOCR(info, tab);
      break;
    case 'ocr-page':
      handlePageOCR(tab);
      break;
    case 'ocr-selection':
      handleRegionSelection(tab);
      break;
  }
});

// Handle OCR on a specific image
async function handleImageOCR(info, tab) {
  try {
    // Send message to content script to process the image
    await chrome.tabs.sendMessage(tab.id, {
      action: 'ocrImage',
      imageUrl: info.srcUrl
    });
  } catch (error) {
    console.error('Error in handleImageOCR:', error);
  }
}

// Handle OCR on entire page
async function handlePageOCR(tab) {
  try {
    await chrome.tabs.sendMessage(tab.id, {
      action: 'ocrPage'
    });
  } catch (error) {
    console.error('Error in handlePageOCR:', error);
  }
}

// Handle region selection for OCR
async function handleRegionSelection(tab) {
  try {
    await chrome.tabs.sendMessage(tab.id, {
      action: 'selectRegion'
    });
  } catch (error) {
    console.error('Error in handleRegionSelection:', error);
  }
}

// Handle keyboard commands
chrome.commands.onCommand.addListener((command) => {
  console.log('Command received:', command);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      switch (command) {
        case 'toggle-sidebar':
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'toggleSidebar'
          });
          break;
        case 'capture-region':
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'selectRegion'
          });
          break;
      }
    }
  });
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);

  if (request.action === 'getSettings') {
    chrome.storage.local.get(null, (settings) => {
      sendResponse(settings);
    });
    return true; // Keep channel open for async response
  }

  if (request.action === 'saveSettings') {
    chrome.storage.local.set(request.settings, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'captureVisibleTab') {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      sendResponse({ dataUrl });
    });
    return true;
  }
});

console.log('Manga OCR background service worker loaded');
