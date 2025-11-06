/**
 * Popup UI Logic
 * Handles quick actions and settings
 */

// DOM elements
let elements = {};
let settings = {};

// Initialize
function init() {
  // Get DOM elements
  elements = {
    toggleSidebar: document.getElementById('toggleSidebar'),
    captureRegion: document.getElementById('captureRegion'),
    capturePage: document.getElementById('capturePage'),
    languageSelect: document.getElementById('languageSelect'),
    showConfidence: document.getElementById('showConfidence'),
    autoClean: document.getElementById('autoClean'),
    optionsLink: document.getElementById('optionsLink'),
    helpLink: document.getElementById('helpLink'),
    status: document.getElementById('status')
  };

  // Attach event listeners
  elements.toggleSidebar.addEventListener('click', handleToggleSidebar);
  elements.captureRegion.addEventListener('click', handleCaptureRegion);
  elements.capturePage.addEventListener('click', handleCapturePage);
  elements.languageSelect.addEventListener('change', handleSettingChange);
  elements.showConfidence.addEventListener('change', handleSettingChange);
  elements.autoClean.addEventListener('change', handleSettingChange);
  elements.optionsLink.addEventListener('click', handleOpenOptions);
  elements.helpLink.addEventListener('click', handleHelp);

  // Load settings
  loadSettings();
}

// Load settings
async function loadSettings() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
    settings = response || {
      language: 'auto',
      showConfidence: true,
      autoClean: true
    };

    updateUI();
  } catch (error) {
    console.error('Error loading settings:', error);
    showStatus('Error loading settings', 'error');
  }
}

// Update UI from settings
function updateUI() {
  elements.languageSelect.value = settings.language || 'auto';
  elements.showConfidence.checked = settings.showConfidence !== false;
  elements.autoClean.checked = settings.autoClean !== false;
}

// Handle toggle sidebar
async function handleToggleSidebar() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.tabs.sendMessage(tab.id, { action: 'toggleSidebar' });
    showStatus('Sidebar toggled', 'success');
    setTimeout(() => window.close(), 500);
  } catch (error) {
    console.error('Error toggling sidebar:', error);
    showStatus('Error: Reload the page first', 'error');
  }
}

// Handle capture region
async function handleCaptureRegion() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.tabs.sendMessage(tab.id, { action: 'selectRegion' });
    showStatus('Select a region...', 'success');
    setTimeout(() => window.close(), 500);
  } catch (error) {
    console.error('Error starting region capture:', error);
    showStatus('Error: Reload the page first', 'error');
  }
}

// Handle capture page
async function handleCapturePage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.tabs.sendMessage(tab.id, { action: 'ocrPage' });
    showStatus('Capturing page...', 'success');
    setTimeout(() => window.close(), 500);
  } catch (error) {
    console.error('Error capturing page:', error);
    showStatus('Error: Reload the page first', 'error');
  }
}

// Handle setting change
async function handleSettingChange() {
  settings.language = elements.languageSelect.value;
  settings.showConfidence = elements.showConfidence.checked;
  settings.autoClean = elements.autoClean.checked;

  try {
    await chrome.runtime.sendMessage({
      action: 'saveSettings',
      settings: settings
    });
    showStatus('Settings saved', 'success');
  } catch (error) {
    console.error('Error saving settings:', error);
    showStatus('Error saving settings', 'error');
  }
}

// Handle open options
function handleOpenOptions(e) {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
}

// Handle help
function handleHelp(e) {
  e.preventDefault();
  showStatus('See README for help', 'info');
}

// Show status message
function showStatus(message, type = 'info') {
  elements.status.textContent = message;
  elements.status.style.color = type === 'error' ? '#ffcccc' : '#ffffff';

  setTimeout(() => {
    elements.status.textContent = '';
  }, 3000);
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
