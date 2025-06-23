# Element Copy - Chrome Extension

A simple Chrome Manifest V3 extension that allows you to right-click on any HTML element and copy its complete HTML code to your clipboard.

## Features

- 🎯 **Right-click to copy**: Simply right-click on any element and select "Copy Element"
- 📋 **Complete HTML**: Copies the entire element with all attributes and content
- 🔍 **Visual preview**: Hold Ctrl while hovering to see which element will be copied
- ✅ **Visual feedback**: Shows a notification when the element is successfully copied
- 🌐 **Universal compatibility**: Works on any website
- 🔧 **Fallback support**: Works even on older browsers

## Installation

### From Source (Developer Mode)

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension will be installed and ready to use

### Usage

1. Navigate to any webpage
2. Right-click on any HTML element you want to copy
3. Select "Copy Element" from the context menu
4. The element's HTML will be copied to your clipboard
5. Paste it wherever you need it

### Example Output

When you right-click on an element like this:

```html
<span class="payment-summary__price-column-total h2" data-v-0ce13794="">
  $9.49
</span>
```

The complete HTML will be copied to your clipboard, including all classes, attributes, and content.

## Permissions

This extension requires the following permissions:

- `contextMenus`: To add the "Copy Element" option to the right-click menu
- `activeTab`: To access the current tab and copy elements
- `scripting`: To inject the copy functionality into web pages

## Files Structure

```
Element-Copy/
├── manifest.json          # Extension manifest (V3)
├── background.js          # Service worker for context menu
├── content.js            # Content script for element interaction
├── popup.html            # Extension popup interface
├── icons/                # Extension icons
└── README.md             # This file
```

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Service Worker**: Handles context menu creation and clicks
- **Content Script**: Manages element selection and clipboard operations
- **Modern APIs**: Uses `navigator.clipboard` with fallback support

## Browser Compatibility

- Chrome 88+ (Manifest V3 requirement)
- Edge 88+ (Chromium-based)

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## Support

If you encounter any issues or have suggestions, please create an issue in the repository.
