/**
 * OCR Worker Script
 * This script is injected into the page context to load Tesseract.js
 * and perform OCR operations, avoiding CSP restrictions
 */

(function() {
  'use strict';

  // Check if already loaded
  if (window.mangaOCRWorker) {
    return;
  }

  // OCR Worker
  window.mangaOCRWorker = {
    tesseractLoaded: false,
    worker: null,

    // Load Tesseract.js
    async loadTesseract() {
      if (this.tesseractLoaded) {
        return true;
      }

      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
        script.onload = () => {
          this.tesseractLoaded = true;
          console.log('Tesseract.js loaded successfully');
          resolve(true);
        };
        script.onerror = (error) => {
          console.error('Failed to load Tesseract.js:', error);
          reject(new Error('Failed to load Tesseract.js'));
        };
        document.head.appendChild(script);
      });
    },

    // Perform OCR
    async performOCR(imageDataUrl, language, onProgress) {
      try {
        // Load Tesseract if not already loaded
        if (!this.tesseractLoaded) {
          await this.loadTesseract();
        }

        // Send progress update
        if (onProgress) {
          onProgress(10, 'Initializing OCR worker...');
        }

        const { createWorker } = window.Tesseract;

        // Create worker
        const worker = await createWorker(language, 1, {
          logger: (m) => {
            if (m.status === 'recognizing text' && onProgress) {
              const progress = 20 + (m.progress * 70);
              onProgress(progress, `Recognizing text... ${Math.round(m.progress * 100)}%`);
            }
          }
        });

        if (onProgress) {
          onProgress(25, 'Processing image...');
        }

        // Perform recognition
        const { data } = await worker.recognize(imageDataUrl);

        // Terminate worker
        await worker.terminate();

        if (onProgress) {
          onProgress(95, 'Processing results...');
        }

        // Process results
        const results = this.processResults(data);

        return {
          success: true,
          results: results
        };

      } catch (error) {
        console.error('OCR error:', error);
        return {
          success: false,
          error: error.message || 'OCR processing failed'
        };
      }
    },

    // Process OCR results
    processResults(data) {
      const results = [];

      if (data.lines && data.lines.length > 0) {
        data.lines.forEach(line => {
          const text = line.text.trim();
          if (text.length > 0) {
            results.push({
              text: text,
              confidence: line.confidence || 0
            });
          }
        });
      } else if (data.text) {
        const text = data.text.trim();
        if (text.length > 0) {
          results.push({
            text: text,
            confidence: data.confidence || 0
          });
        }
      }

      return results;
    }
  };

  // Listen for OCR requests from content script
  window.addEventListener('message', async (event) => {
    if (event.source !== window) return;

    const message = event.data;
    if (!message.type || message.type !== 'mangaOCR_performOCR') return;

    const { imageDataUrl, language, requestId } = message;

    // Progress callback
    const onProgress = (progress, status) => {
      window.postMessage({
        type: 'mangaOCR_progress',
        requestId: requestId,
        progress: progress,
        status: status
      }, '*');
    };

    // Perform OCR
    const result = await window.mangaOCRWorker.performOCR(
      imageDataUrl,
      language,
      onProgress
    );

    // Send result back
    window.postMessage({
      type: 'mangaOCR_result',
      requestId: requestId,
      result: result
    }, '*');
  });

  console.log('Manga OCR Worker initialized');
})();
