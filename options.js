/**
 * Options Page Logic
 * Handles settings configuration
 */

// DOM elements
let elements = {};

// Default settings
const defaultSettings = {
  language: 'auto',
  ocrMode: 'local',
  remoteEndpoint: '',
  showConfidence: true,
  autoClean: true
};

// Initialize
function init() {
  // Get DOM elements
  elements = {
    language: document.getElementById('language'),
    ocrMode: document.getElementById('ocrMode'),
    remoteEndpoint: document.getElementById('remoteEndpoint'),
    showConfidence: document.getElementById('showConfidence'),
    autoClean: document.getElementById('autoClean'),
    saveBtn: document.getElementById('saveBtn'),
    resetBtn: document.getElementById('resetBtn'),
    statusMessage: document.getElementById('statusMessage'),
    remoteWarning: document.getElementById('remoteWarning'),
    remoteEndpointRow: document.getElementById('remoteEndpointRow')
  };

  // Attach event listeners
  elements.saveBtn.addEventListener('click', saveSettings);
  elements.resetBtn.addEventListener('click', resetSettings);
  elements.ocrMode.addEventListener('change', handleOCRModeChange);

  // Load settings
  loadSettings();
}

// Load settings
async function loadSettings() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
    const settings = response || defaultSettings;

    // Update UI
    elements.language.value = settings.language || 'auto';
    elements.ocrMode.value = settings.ocrMode || 'local';
    elements.remoteEndpoint.value = settings.remoteEndpoint || '';
    elements.showConfidence.checked = settings.showConfidence !== false;
    elements.autoClean.checked = settings.autoClean !== false;

    // Update visibility
    handleOCRModeChange();
  } catch (error) {
    console.error('Error loading settings:', error);
    showStatus('Error loading settings', 'error');
  }
}

// Save settings
async function saveSettings() {
  try {
    const settings = {
      language: elements.language.value,
      ocrMode: elements.ocrMode.value,
      remoteEndpoint: elements.remoteEndpoint.value,
      showConfidence: elements.showConfidence.checked,
      autoClean: elements.autoClean.checked
    };

    await chrome.runtime.sendMessage({
      action: 'saveSettings',
      settings: settings
    });

    showStatus('Settings saved successfully!', 'success');
  } catch (error) {
    console.error('Error saving settings:', error);
    showStatus('Error saving settings', 'error');
  }
}

// Reset settings
async function resetSettings() {
  if (!confirm('Reset all settings to defaults?')) {
    return;
  }

  try {
    await chrome.runtime.sendMessage({
      action: 'saveSettings',
      settings: defaultSettings
    });

    // Reload settings
    await loadSettings();

    showStatus('Settings reset to defaults', 'success');
  } catch (error) {
    console.error('Error resetting settings:', error);
    showStatus('Error resetting settings', 'error');
  }
}

// Handle OCR mode change
function handleOCRModeChange() {
  const isRemote = elements.ocrMode.value === 'remote';
  elements.remoteWarning.style.display = isRemote ? 'block' : 'none';
  elements.remoteEndpointRow.style.display = isRemote ? 'block' : 'none';
}

// Show status message
function showStatus(message, type) {
  elements.statusMessage.textContent = message;
  elements.statusMessage.className = `status-message ${type}`;

  setTimeout(() => {
    elements.statusMessage.className = 'status-message';
  }, 3000);
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
