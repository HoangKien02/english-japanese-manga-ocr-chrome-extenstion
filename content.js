/**
 * Content Script for Manga OCR Extension
 * Handles sidebar injection, image capture, region selection, and OCR processing
 */

// State
let sidebarInjected = false;
let sidebarVisible = false;
let sidebarIframe = null;
let sidebarContainer = null;
let selectionOverlay = null;
let settings = {};

// Initialize
function init() {
  console.log('Manga OCR content script loaded');
  loadSettings();
}

// Load settings
async function loadSettings() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
    settings = response || {
      language: 'auto',
      ocrMode: 'local',
      showConfidence: true,
      autoClean: true
    };
  } catch (error) {
    console.error('Error loading settings:', error);
    settings = {
      language: 'auto',
      ocrMode: 'local',
      showConfidence: true,
      autoClean: true
    };
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);

  switch (request.action) {
    case 'toggleSidebar':
      toggleSidebar();
      break;
    case 'ocrImage':
      handleOCRImage(request.imageUrl);
      break;
    case 'ocrPage':
      handleOCRPage();
      break;
    case 'selectRegion':
      startRegionSelection();
      break;
  }

  sendResponse({ success: true });
  return true;
});

// Toggle sidebar visibility
function toggleSidebar() {
  if (!sidebarInjected) {
    injectSidebar();
  } else {
    sidebarVisible = !sidebarVisible;
    sidebarContainer.classList.toggle('hidden', !sidebarVisible);
  }
}

// Inject sidebar into page
function injectSidebar() {
  if (sidebarInjected) return;

  // Create container
  sidebarContainer = document.createElement('div');
  sidebarContainer.id = 'manga-ocr-sidebar-container';

  // Create iframe
  sidebarIframe = document.createElement('iframe');
  sidebarIframe.src = chrome.runtime.getURL('sidebar.html');
  sidebarIframe.style.cssText = 'width: 100%; height: 100%; border: none;';

  sidebarContainer.appendChild(sidebarIframe);
  document.body.appendChild(sidebarContainer);

  sidebarInjected = true;
  sidebarVisible = true;

  // Listen for messages from sidebar
  window.addEventListener('message', handleSidebarMessage);

  console.log('Sidebar injected');
}

// Handle messages from sidebar
async function handleSidebarMessage(event) {
  const message = event.data;

  if (!message.type) return;

  console.log('Content script received sidebar message:', message);

  switch (message.type) {
    case 'closeSidebar':
      toggleSidebar();
      break;

    case 'captureRegion':
      startRegionSelection();
      break;

    case 'captureImage':
      captureVisiblePage();
      break;

    case 'getSettings':
      sendToSidebar('mangaOCR_settings', { settings });
      break;

    case 'saveSettings':
      Object.assign(settings, message.settings);
      await chrome.runtime.sendMessage({
        action: 'saveSettings',
        settings: message.settings
      });
      break;

    case 'copyToClipboard':
      copyToClipboard(message.text);
      break;

    case 'openUrl':
      window.open(message.url, '_blank');
      break;

    case 'downloadFile':
      downloadFile(message.url, message.filename);
      break;
  }
}

// Send message to sidebar
function sendToSidebar(type, data) {
  if (sidebarIframe && sidebarIframe.contentWindow) {
    sidebarIframe.contentWindow.postMessage({
      type,
      ...data
    }, '*');
  }
}

// Copy to clipboard
function copyToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

// Download file
function downloadFile(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Handle OCR on specific image
async function handleOCRImage(imageUrl) {
  if (!sidebarInjected) {
    injectSidebar();
  }

  sendToSidebar('mangaOCR_ocrStart', {});

  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // Convert to base64
    const base64 = await blobToBase64(blob);

    // Perform OCR
    await performOCR(base64);
  } catch (error) {
    console.error('Error in handleOCRImage:', error);
    sendToSidebar('mangaOCR_ocrError', { error: error.message });
  }
}

// Handle OCR on page
async function handleOCRPage() {
  captureVisiblePage();
}

// Capture visible page
async function captureVisiblePage() {
  if (!sidebarInjected) {
    injectSidebar();
  }

  sendToSidebar('mangaOCR_ocrStart', {});

  try {
    // Request screenshot from background
    const response = await chrome.runtime.sendMessage({
      action: 'captureVisibleTab'
    });

    if (response.dataUrl) {
      await performOCR(response.dataUrl);
    }
  } catch (error) {
    console.error('Error in captureVisiblePage:', error);
    sendToSidebar('mangaOCR_ocrError', { error: error.message });
  }
}

// Start region selection
function startRegionSelection() {
  if (selectionOverlay) return;

  // Create overlay
  selectionOverlay = document.createElement('div');
  selectionOverlay.id = 'manga-ocr-selection-overlay';

  // Create hint
  const hint = document.createElement('div');
  hint.className = 'manga-ocr-selection-hint';
  hint.textContent = 'Click and drag to select a region (ESC to cancel)';
  selectionOverlay.appendChild(hint);

  document.body.appendChild(selectionOverlay);

  // Selection state
  let isSelecting = false;
  let startX = 0;
  let startY = 0;
  let selectionBox = null;

  // Mouse down
  selectionOverlay.addEventListener('mousedown', (e) => {
    if (e.target !== selectionOverlay && e.target !== hint) return;

    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;

    // Create selection box
    selectionBox = document.createElement('div');
    selectionBox.id = 'manga-ocr-selection-box';
    selectionBox.style.left = startX + 'px';
    selectionBox.style.top = startY + 'px';
    selectionOverlay.appendChild(selectionBox);

    // Hide hint
    hint.style.display = 'none';
  });

  // Mouse move
  selectionOverlay.addEventListener('mousemove', (e) => {
    if (!isSelecting || !selectionBox) return;

    const width = Math.abs(e.clientX - startX);
    const height = Math.abs(e.clientY - startY);
    const left = Math.min(e.clientX, startX);
    const top = Math.min(e.clientY, startY);

    selectionBox.style.left = left + 'px';
    selectionBox.style.top = top + 'px';
    selectionBox.style.width = width + 'px';
    selectionBox.style.height = height + 'px';
  });

  // Mouse up
  selectionOverlay.addEventListener('mouseup', async (e) => {
    if (!isSelecting || !selectionBox) return;

    isSelecting = false;

    const width = Math.abs(e.clientX - startX);
    const height = Math.abs(e.clientY - startY);

    if (width > 20 && height > 20) {
      const left = Math.min(e.clientX, startX);
      const top = Math.min(e.clientY, startY);

      // Capture the selected region
      await captureRegion(left, top, width, height);
    }

    // Clean up
    cleanupSelection();
  });

  // ESC to cancel
  const cancelHandler = (e) => {
    if (e.key === 'Escape') {
      cleanupSelection();
      document.removeEventListener('keydown', cancelHandler);
    }
  };
  document.addEventListener('keydown', cancelHandler);

  // Cleanup function
  function cleanupSelection() {
    if (selectionOverlay) {
      selectionOverlay.remove();
      selectionOverlay = null;
    }
  }
}

// Capture region
async function captureRegion(x, y, width, height) {
  if (!sidebarInjected) {
    injectSidebar();
  }

  sendToSidebar('mangaOCR_ocrStart', {});

  try {
    // Flash effect
    const flash = document.createElement('div');
    flash.className = 'manga-ocr-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 300);

    // Capture screenshot
    const response = await chrome.runtime.sendMessage({
      action: 'captureVisibleTab'
    });

    if (response.dataUrl) {
      // Crop the image
      const croppedImage = await cropImage(response.dataUrl, x, y, width, height);

      // Perform OCR
      await performOCR(croppedImage);
    }
  } catch (error) {
    console.error('Error in captureRegion:', error);
    sendToSidebar('mangaOCR_ocrError', { error: error.message });
  }
}

// Crop image
function cropImage(dataUrl, x, y, width, height) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

// Perform OCR
async function performOCR(imageDataUrl) {
  try {
    // Dynamic import of Tesseract.js
    sendToSidebar('mangaOCR_ocrProgress', {
      progress: 10,
      status: 'Loading OCR engine...'
    });

    // Load Tesseract from CDN
    if (!window.Tesseract) {
      await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js');
    }

    const { createWorker } = window.Tesseract;

    sendToSidebar('mangaOCR_ocrProgress', {
      progress: 20,
      status: 'Initializing OCR worker...'
    });

    // Determine language
    let lang = settings.language === 'auto' ? 'eng+jpn' : settings.language;

    // Create worker
    const worker = await createWorker(lang, 1, {
      logger: (m) => {
        console.log('OCR:', m);

        if (m.status === 'recognizing text') {
          const progress = 20 + (m.progress * 70);
          sendToSidebar('mangaOCR_ocrProgress', {
            progress: progress,
            status: `Recognizing text... ${Math.round(m.progress * 100)}%`
          });
        }
      }
    });

    sendToSidebar('mangaOCR_ocrProgress', {
      progress: 25,
      status: 'Processing image...'
    });

    // Perform recognition
    const { data } = await worker.recognize(imageDataUrl);

    await worker.terminate();

    sendToSidebar('mangaOCR_ocrProgress', {
      progress: 95,
      status: 'Processing results...'
    });

    // Process results
    const results = processOCRResults(data);

    sendToSidebar('mangaOCR_ocrComplete', { results });

  } catch (error) {
    console.error('OCR error:', error);
    sendToSidebar('mangaOCR_ocrError', {
      error: error.message || 'OCR processing failed'
    });
  }
}

// Process OCR results
function processOCRResults(data) {
  const results = [];

  // Process lines
  if (data.lines && data.lines.length > 0) {
    data.lines.forEach(line => {
      const text = line.text.trim();
      if (text.length > 0) {
        results.push({
          text: settings.autoClean ? cleanText(text) : text,
          confidence: line.confidence || 0
        });
      }
    });
  } else if (data.text) {
    // Fallback to full text
    const text = data.text.trim();
    if (text.length > 0) {
      results.push({
        text: settings.autoClean ? cleanText(text) : text,
        confidence: data.confidence || 0
      });
    }
  }

  return results;
}

// Clean OCR text
function cleanText(text) {
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\S\r\n]+/g, ' ') // Remove extra spaces
    .trim();
}

// Load external script
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Convert blob to base64
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Initialize
init();
