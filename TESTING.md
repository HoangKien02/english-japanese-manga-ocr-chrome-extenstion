# 🧪 Testing Guide - Manga OCR Extension

This guide will help you test the Manga OCR extension after installation.

## Prerequisites

1. Chrome browser (version 88 or higher)
2. Extension installed in Developer Mode
3. Internet connection (for loading Tesseract.js from CDN)

## Quick Test Checklist

### 1. Installation Test
- [ ] Extension appears in `chrome://extensions/`
- [ ] Extension icon visible in Chrome toolbar
- [ ] No errors in the extension's error console

### 2. Popup UI Test
- [ ] Click extension icon - popup opens
- [ ] All buttons are visible and styled correctly
- [ ] Language selector shows all options
- [ ] Checkboxes toggle correctly

### 3. Sidebar Test
- [ ] Click "Toggle Sidebar" - right-side panel appears
- [ ] Sidebar has gradient header with close button
- [ ] Empty state shows placeholder text
- [ ] Sidebar can be hidden/shown

### 4. OCR Functionality Test

#### Test with English Text
1. Open a webpage with English text images (e.g., meme, comic)
2. Click "Capture Region" button
3. Select area with English text
4. Verify:
   - [ ] Selection overlay appears
   - [ ] Progress bar shows during OCR
   - [ ] Results appear in sidebar
   - [ ] Text is readable and accurate

#### Test with Japanese Text
1. Find a manga page or Japanese text image
2. Right-click the image
3. Select "Run Manga OCR on Image"
4. Verify:
   - [ ] OCR processes the image
   - [ ] Japanese characters are recognized
   - [ ] Results display correctly

### 5. Region Selection Test
- [ ] Click "Capture Region" or press `Ctrl+Shift+C`
- [ ] Crosshair cursor appears
- [ ] Can draw selection box
- [ ] Selection box is highlighted
- [ ] ESC cancels selection
- [ ] Flash effect appears on capture

### 6. Results Management Test
- [ ] Each result has index number
- [ ] Copy button copies text to clipboard
- [ ] Search button opens Google/DeepL
- [ ] Delete button removes individual result
- [ ] "Copy All" copies all results
- [ ] "Clear" button clears all results
- [ ] Confidence scores display (if enabled)

### 7. Export Test
- [ ] Click "Export TXT" button
- [ ] File downloads with correct name format
- [ ] File contains all OCR results
- [ ] Text formatting is preserved

### 8. Settings Test
- [ ] Open extension options (right-click icon → Options)
- [ ] All settings load correctly
- [ ] Language selector updates
- [ ] OCR mode switches between local/remote
- [ ] Checkboxes save state
- [ ] "Save Settings" shows success message
- [ ] "Reset to Defaults" works

### 9. Context Menu Test
- [ ] Right-click any image on a webpage
- [ ] "Run Manga OCR on Image" appears
- [ ] "Run Manga OCR on Page" appears in page context
- [ ] Both menu items trigger OCR

### 10. Keyboard Shortcuts Test
- [ ] `Ctrl+Shift+O` (Cmd+Shift+O on Mac) toggles sidebar
- [ ] `Ctrl+Shift+C` (Cmd+Shift+C on Mac) starts region capture

## Test Pages

### Recommended Test Sites

1. **English Comics/Memes**:
   - https://xkcd.com/ (webcomic with text)
   - Any image-based meme site

2. **Japanese Manga** (Online Readers):
   - https://mangadex.org/ (has Japanese manga)
   - Any manga reader site with Japanese text

3. **Mixed Content**:
   - Twitter/X images with text
   - Instagram posts with captions
   - News articles with image captions

## Expected Results

### Good OCR Results
- **English**: 90%+ accuracy on clean, printed text
- **Japanese**: 80%+ accuracy on clear manga text
- **Mixed**: Should detect both languages in auto mode

### Poor Results (Expected)
- Very low-resolution images
- Handwritten text
- Stylized/decorative fonts
- Text at extreme angles
- Very small text (< 12px equivalent)

## Performance Benchmarks

| Image Size | Expected OCR Time |
|------------|------------------|
| Small (< 500px) | 2-5 seconds |
| Medium (500-1000px) | 5-10 seconds |
| Large (> 1000px) | 10-20 seconds |

## Common Issues & Solutions

### OCR Not Starting
**Issue**: Button clicks but nothing happens
**Solution**:
1. Check browser console for errors (F12)
2. Ensure internet connection (Tesseract.js loads from CDN)
3. Reload the page

### Poor OCR Accuracy
**Issue**: Text recognition is gibberish
**Solution**:
1. Try selecting smaller, clearer regions
2. Check language setting matches image
3. Use higher quality images

### Sidebar Not Appearing
**Issue**: Sidebar toggle doesn't work
**Solution**:
1. Check if page has strict CSP (Content Security Policy)
2. Reload page after installing extension
3. Check extension is enabled

### Extension Error on Load
**Issue**: Extension shows error in `chrome://extensions/`
**Solution**:
1. Ensure all files are present
2. Check manifest.json is valid JSON
3. Reload extension

## Debug Mode

### Enable Console Logging
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for messages starting with:
   - `Manga OCR Extension installed`
   - `Manga OCR content script loaded`
   - `Sidebar initialized`

### Common Log Messages
```
✅ Good:
- "Manga OCR Extension installed: install"
- "Manga OCR content script loaded"
- "Sidebar injected"
- "OCR complete"

❌ Problems:
- "Error loading settings"
- "OCR error: ..."
- "Failed to inject sidebar"
```

## Reporting Issues

If you find bugs during testing, please report with:

1. **Environment**:
   - Chrome version
   - Operating system
   - Extension version

2. **Steps to reproduce**:
   - What you clicked
   - What image/page you tested
   - What you expected vs what happened

3. **Screenshots/Logs**:
   - Browser console errors
   - Screenshot of the issue
   - Extension error logs

## Advanced Testing

### Performance Testing
1. Open Chrome DevTools → Performance
2. Start recording
3. Run OCR on various image sizes
4. Check for memory leaks
5. Verify no excessive re-renders

### Cross-Site Testing
Test on various websites to ensure compatibility:
- [ ] Static HTML pages
- [ ] React/Vue/Angular sites
- [ ] Sites with strict CSP
- [ ] Manga reader sites
- [ ] Social media platforms

### Edge Cases
- [ ] Very large images (> 5000px)
- [ ] Very small images (< 100px)
- [ ] Transparent images
- [ ] Animated GIFs (should use first frame)
- [ ] SVG images
- [ ] Multiple overlapping text blocks

## Test Coverage Checklist

### Core Features
- [x] Extension installation
- [x] Sidebar injection
- [x] Image capture (region/page/image)
- [x] OCR processing (English/Japanese)
- [x] Results display
- [x] Copy functionality
- [x] Export functionality
- [x] Settings persistence
- [x] Context menus
- [x] Keyboard shortcuts

### UI/UX
- [x] Responsive design
- [x] Loading states
- [x] Error states
- [x] Success feedback
- [x] Accessibility

### Edge Cases
- [x] No text found
- [x] Very long text
- [x] Special characters
- [x] Empty images
- [x] Network errors

---

**Happy Testing!** 🎉

If you complete all tests successfully, the extension is ready for use!
