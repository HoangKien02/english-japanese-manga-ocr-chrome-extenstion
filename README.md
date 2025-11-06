# 📖 Manga OCR - Chrome Extension

A powerful Chrome extension for extracting text from manga pages using Optical Character Recognition (OCR). Supports both **English** and **Japanese** text with local, privacy-first processing.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Chrome](https://img.shields.io/badge/chrome-extension-yellow)

## ✨ Features

- 🔤 **Dual Language Support**: OCR for English and Japanese (kanji, hiragana, katakana)
- 🔒 **Privacy-First**: All OCR processing happens locally in your browser by default
- 📸 **Flexible Capture**: Capture entire pages, specific images, or custom regions
- 📋 **Easy Export**: Copy individual lines or export all results to TXT files
- ⚡ **Fast & Accurate**: Powered by Tesseract.js with optimized training data
- 🎨 **Beautiful UI**: Clean, modern sidebar interface that doesn't interfere with browsing
- ⌨️ **Keyboard Shortcuts**: Quick access to all major features
- 🎯 **Context Menu Integration**: Right-click any image to run OCR

## 🚀 Installation

### Method 1: Chrome Web Store (Recommended)
_Coming soon..._

### Method 2: Manual Installation (Developer Mode)

1. **Download the extension**:
   ```bash
   git clone https://github.com/yourusername/manga-ocr-extension.git
   cd manga-ocr-extension
   ```

2. **Open Chrome Extensions**:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)

3. **Load the extension**:
   - Click "Load unpacked"
   - Select the extension folder
   - The Manga OCR icon should appear in your toolbar

## 📖 Usage

### Quick Start

1. **Open a manga page** in your browser
2. **Click the extension icon** in the toolbar
3. **Choose an action**:
   - **Toggle Sidebar**: Open/close the results sidebar
   - **Capture Region**: Select a specific area to OCR
   - **Capture Page**: OCR the entire visible page

### Capture Methods

#### 1. Capture Region (Recommended for Manga)
- Click the "Capture Region" button or press `Ctrl+Shift+C` (Mac: `Cmd+Shift+C`)
- Click and drag to select the text area (speech bubble, caption, etc.)
- Release to start OCR
- Results appear in the sidebar

#### 2. Right-Click Image
- Right-click any image on the page
- Select "Run Manga OCR on Image"
- Results appear in the sidebar

#### 3. Capture Full Page
- Click "Capture Page" in the popup
- OCR processes the entire visible area
- Useful for manga reader pages

### Working with Results

The sidebar displays all recognized text blocks with:
- **Line numbers**: Easy reference
- **Confidence scores**: OCR accuracy indicator (optional)
- **Action buttons**:
  - 📋 **Copy**: Copy text to clipboard
  - 🔍 **Search**: Search on Google or DeepL (auto-detects Japanese)
  - 🗑️ **Delete**: Remove individual result

#### Bulk Actions
- **Copy All**: Copy all results to clipboard
- **Export TXT**: Download results as a text file
- **Clear**: Remove all results

## ⚙️ Settings

Access settings via the extension popup or right-click the extension icon → Options.

### OCR Settings

| Setting | Options | Description |
|---------|---------|-------------|
| **Default Language** | Auto, English, Japanese, Eng+Jpn | Default OCR language |
| **OCR Mode** | Local, Remote | Processing location |
| **Remote Endpoint** | URL | Custom OCR API endpoint (if using remote mode) |

### Display Settings

| Setting | Default | Description |
|---------|---------|-------------|
| **Show Confidence** | ✅ On | Display OCR confidence scores |
| **Auto-clean Text** | ✅ On | Remove extra whitespace automatically |

### Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Toggle Sidebar | `Ctrl+Shift+O` | `Cmd+Shift+O` |
| Capture Region | `Ctrl+Shift+C` | `Cmd+Shift+C` |

## 🔧 Technical Details

### Architecture

```
manga-ocr-extension/
├── manifest.json          # Extension manifest (v3)
├── background.js          # Service worker
├── content.js             # Content script (injection & OCR coordination)
├── ocr-worker.js          # Page-context worker (loads Tesseract.js)
├── popup.html/js          # Extension popup UI
├── sidebar.html/js/css    # OCR results sidebar
├── options.html/js        # Settings page
└── icons/                 # Extension icons
```

### OCR Engine

- **Engine**: [Tesseract.js](https://tesseract.projectnaptha.com/) v5
- **Languages**: English (`eng`) and Japanese (`jpn`) training data
- **Processing**: Client-side WASM compilation
- **Privacy**: No data leaves your browser in local mode
- **CSP Compliance**: Tesseract.js loads in page context to avoid CSP restrictions

**How it works**: The extension injects `ocr-worker.js` into the page context where Content Security Policy restrictions are less strict. This worker script loads Tesseract.js from CDN and performs OCR operations. The content script communicates with the worker via `postMessage` API.

### Permissions

| Permission | Reason |
|------------|--------|
| `activeTab` | Capture screenshots and inject sidebar |
| `contextMenus` | Right-click OCR on images |
| `storage` | Save user preferences |
| `scripting` | Inject content scripts |
| `<all_urls>` | Work on any website |

## 🔐 Privacy & Security

### Default (Local Mode)
✅ **All processing happens in your browser**
✅ **No images sent to external servers**
✅ **No tracking or analytics**
✅ **Settings stored locally only**

### Optional Remote Mode
⚠️ When enabled, images are sent to your configured OCR endpoint
⚠️ Only use trusted endpoints
⚠️ Disabled by default

## 🐛 Troubleshooting

### Extension not working on a page?
1. **Reload the page** after installing the extension
2. Check if the site has a strict Content Security Policy (CSP)
3. Try the extension popup instead of keyboard shortcuts

### OCR results are poor?
1. **Check image quality**: Low-resolution or blurry images produce poor results
2. **Try different language settings**: Switch between Auto/English/Japanese
3. **Use region capture**: Select smaller, clearer areas
4. **Improve contrast**: Some manga have low contrast text

### Sidebar won't open?
1. Check browser console for errors (F12)
2. Verify the extension is enabled (`chrome://extensions/`)
3. Try reloading the extension

### Performance issues?
1. **Reduce capture area**: OCR large images takes time
2. **Use region selection**: Faster than full-page OCR
3. **Clear old results**: Large result sets can slow the sidebar

## 🗺️ Roadmap

### v1.1 (Planned)
- [ ] Improved vertical text detection (Japanese manga)
- [ ] Speech bubble auto-detection
- [ ] Result history & favorites
- [ ] Export to CSV with metadata

### v2.0 (Future)
- [ ] Translation integration (DeepL, Google Translate)
- [ ] Custom training data upload
- [ ] Batch processing multiple pages
- [ ] Cloud sync for settings

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Tesseract.js](https://tesseract.projectnaptha.com/) - OCR engine
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) - Original OCR project
- All manga readers and translators who inspired this project

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/manga-ocr-extension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/manga-ocr-extension/discussions)

## ⭐ Star History

If you find this extension useful, please consider giving it a star on GitHub!

---

**Made with ❤️ for the manga community**
