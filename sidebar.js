/**
 * Sidebar UI Logic
 * Handles OCR results display, user interactions, and communication with content script
 */

let ocrResults = [];
let settings = {
  language: 'auto',
  showConfidence: true
};

// DOM Elements
const elements = {
  statusBar: null,
  progressContainer: null,
  progressFill: null,
  progressText: null,
  resultsContainer: null,
  languageSelect: null,
  closeSidebar: null,
  captureRegion: null,
  captureImage: null,
  copyAll: null,
  exportTxt: null,
  clearResults: null
};

// Initialize sidebar
function init() {
  // Get DOM elements
  elements.statusBar = document.getElementById('statusBar');
  elements.progressContainer = document.getElementById('progressContainer');
  elements.progressFill = document.getElementById('progressFill');
  elements.progressText = document.getElementById('progressText');
  elements.resultsContainer = document.getElementById('resultsContainer');
  elements.languageSelect = document.getElementById('languageSelect');
  elements.closeSidebar = document.getElementById('closeSidebar');
  elements.captureRegion = document.getElementById('captureRegion');
  elements.captureImage = document.getElementById('captureImage');
  elements.copyAll = document.getElementById('copyAll');
  elements.exportTxt = document.getElementById('exportTxt');
  elements.clearResults = document.getElementById('clearResults');

  // Attach event listeners
  elements.closeSidebar.addEventListener('click', handleCloseSidebar);
  elements.captureRegion.addEventListener('click', handleCaptureRegion);
  elements.captureImage.addEventListener('click', handleCaptureImage);
  elements.copyAll.addEventListener('click', handleCopyAll);
  elements.exportTxt.addEventListener('click', handleExportTxt);
  elements.clearResults.addEventListener('click', handleClearResults);
  elements.languageSelect.addEventListener('change', handleLanguageChange);

  // Listen for messages from content script
  window.addEventListener('message', handleMessage);

  // Load settings
  loadSettings();

  console.log('Sidebar initialized');
}

// Load settings from storage
function loadSettings() {
  window.parent.postMessage({
    type: 'getSettings'
  }, '*');
}

// Handle messages from content script
function handleMessage(event) {
  const message = event.data;

  if (!message.type || !message.type.startsWith('mangaOCR_')) {
    return;
  }

  console.log('Sidebar received message:', message);

  switch (message.type) {
    case 'mangaOCR_settings':
      settings = message.settings;
      updateUIFromSettings();
      break;

    case 'mangaOCR_ocrStart':
      showProgress('Starting OCR...');
      break;

    case 'mangaOCR_ocrProgress':
      updateProgress(message.progress, message.status);
      break;

    case 'mangaOCR_ocrComplete':
      handleOCRComplete(message.results);
      break;

    case 'mangaOCR_ocrError':
      handleOCRError(message.error);
      break;
  }
}

// Update UI from settings
function updateUIFromSettings() {
  elements.languageSelect.value = settings.language || 'auto';
}

// Show progress
function showProgress(text) {
  elements.progressContainer.classList.add('active');
  elements.progressText.textContent = text;
  elements.progressFill.style.width = '0%';
  setStatus('Processing...', 'processing');
}

// Update progress
function updateProgress(percent, text) {
  elements.progressFill.style.width = `${percent}%`;
  elements.progressText.textContent = text || `Processing... ${percent}%`;
}

// Hide progress
function hideProgress() {
  elements.progressContainer.classList.remove('active');
}

// Set status message
function setStatus(message, type = '') {
  elements.statusBar.textContent = message;
  elements.statusBar.className = `status-bar ${type}`;
}

// Handle OCR complete
function handleOCRComplete(results) {
  hideProgress();

  if (!results || results.length === 0) {
    setStatus('No text found in image', 'error');
    return;
  }

  // Add new results
  results.forEach(result => {
    ocrResults.push({
      text: result.text,
      confidence: result.confidence || 0,
      timestamp: Date.now()
    });
  });

  renderResults();
  setStatus(`Found ${results.length} text block(s)`, 'success');
}

// Handle OCR error
function handleOCRError(error) {
  hideProgress();
  setStatus(`Error: ${error}`, 'error');
  console.error('OCR error:', error);
}

// Render results
function renderResults() {
  if (ocrResults.length === 0) {
    elements.resultsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📚</div>
        <div class="empty-text">No OCR results yet</div>
        <div class="empty-hint">Right-click an image or capture a region to extract text</div>
      </div>
    `;
    return;
  }

  elements.resultsContainer.innerHTML = ocrResults.map((result, index) => {
    const confidenceClass =
      result.confidence >= 80 ? 'confidence-high' :
      result.confidence >= 60 ? 'confidence-medium' : 'confidence-low';

    return `
      <div class="result-item" data-index="${index}">
        <div class="result-header">
          <span class="result-index">#${index + 1}</span>
          <div class="result-actions">
            <button class="icon-btn" onclick="copyResult(${index})" title="Copy">📋</button>
            <button class="icon-btn" onclick="searchResult(${index})" title="Search">🔍</button>
            <button class="icon-btn" onclick="deleteResult(${index})" title="Delete">🗑️</button>
          </div>
        </div>
        <div class="result-text">${escapeHtml(result.text)}</div>
        ${settings.showConfidence ? `
          <div class="result-confidence ${confidenceClass}">
            Confidence: ${result.confidence.toFixed(1)}%
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// Copy single result
window.copyResult = function(index) {
  const result = ocrResults[index];
  if (!result) return;

  copyToClipboard(result.text);
  setStatus('Copied to clipboard', 'success');
};

// Search result
window.searchResult = function(index) {
  const result = ocrResults[index];
  if (!result) return;

  const query = encodeURIComponent(result.text);
  const url = settings.language === 'jpn'
    ? `https://www.deepl.com/translator#ja/en/${query}`
    : `https://www.google.com/search?q=${query}`;

  window.parent.postMessage({
    type: 'openUrl',
    url: url
  }, '*');
};

// Delete result
window.deleteResult = function(index) {
  ocrResults.splice(index, 1);
  renderResults();
  setStatus('Result deleted', 'success');
};

// Copy to clipboard
function copyToClipboard(text) {
  // Use the parent window's clipboard API
  window.parent.postMessage({
    type: 'copyToClipboard',
    text: text
  }, '*');
}

// Handle close sidebar
function handleCloseSidebar() {
  window.parent.postMessage({
    type: 'closeSidebar'
  }, '*');
}

// Handle capture region
function handleCaptureRegion() {
  window.parent.postMessage({
    type: 'captureRegion'
  }, '*');
}

// Handle capture image
function handleCaptureImage() {
  window.parent.postMessage({
    type: 'captureImage'
  }, '*');
}

// Handle copy all
function handleCopyAll() {
  if (ocrResults.length === 0) {
    setStatus('No results to copy', 'error');
    return;
  }

  const allText = ocrResults.map((r, i) => `${i + 1}. ${r.text}`).join('\n');
  copyToClipboard(allText);
  setStatus(`Copied ${ocrResults.length} results`, 'success');
}

// Handle export TXT
function handleExportTxt() {
  if (ocrResults.length === 0) {
    setStatus('No results to export', 'error');
    return;
  }

  const text = ocrResults.map((r, i) => `${i + 1}. ${r.text}`).join('\n');
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  window.parent.postMessage({
    type: 'downloadFile',
    url: url,
    filename: `manga-ocr-${Date.now()}.txt`
  }, '*');

  setStatus('Exporting results...', 'success');
}

// Handle clear results
function handleClearResults() {
  if (ocrResults.length === 0) return;

  if (confirm(`Clear all ${ocrResults.length} results?`)) {
    ocrResults = [];
    renderResults();
    setStatus('Results cleared', 'success');
  }
}

// Handle language change
function handleLanguageChange() {
  settings.language = elements.languageSelect.value;

  window.parent.postMessage({
    type: 'saveSettings',
    settings: { language: settings.language }
  }, '*');

  setStatus(`Language set to: ${elements.languageSelect.value}`, 'success');
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
