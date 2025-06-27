# Element Copy - Chrome Extension

A powerful Chrome Manifest V3 extension that provides advanced HTML element selection and copying capabilities with hotkey navigation, customizable keybinds, and intelligent auto-scrolling.

## ✨ Features

### 🎯 **Multiple Selection Methods**
- **Right-click to copy**: Traditional context menu for quick element copying
- **Hotkey selection**: Use `Ctrl+Shift+C` to instantly copy elements under cursor
- **DOM navigation**: Navigate through parent/child elements with customizable hotkeys
- **Spatial navigation**: Move between visually adjacent elements using `Ctrl+Arrow` keys

### � **Advanced Navigation**
- **Parent/Child traversal**: Move up and down the DOM tree with `Ctrl+Shift+↑/↓`
- **Visual spatial movement**: Navigate left, right, up, down based on element positioning
- **Smart auto-scrolling**: Viewport automatically follows selected elements
- **Visual feedback**: Red highlight overlay shows currently selected element
- **Element stack info**: See your position in the DOM hierarchy

### ⚙️ **Customizable Controls**
- **Rebindable hotkeys**: Customize all keybinds through the popup interface
- **Conflict detection**: Prevents duplicate keybind assignments
- **Enable/disable toggle**: Turn extension on/off without removal
- **Persistent settings**: All preferences saved across browser sessions

### 🔍 **User Experience**
- **Visual preview**: Hold `Ctrl` while hovering to preview selectable elements
- **Smart notifications**: Context-aware feedback messages
- **Element information**: Shows tag name, classes, and ID of selected elements
- **Smooth scrolling**: Automatically centers selected elements in viewport
- **Universal compatibility**: Works on any website

## 🎮 Default Hotkeys

| Action | Default Keybind | Description |
|--------|----------------|-------------|
| **Copy Element** | `Ctrl+Shift+C` | Copy element under cursor |
| **Select Parent** | `Ctrl+Shift+↑` | Navigate to parent element |
| **Select Child** | `Ctrl+Shift+↓` | Navigate to child element |
| **Copy Selected** | `Ctrl+Shift+Enter` | Copy currently selected element |
| **Cancel Selection** | `Escape` | Clear current selection |
| **Spatial Navigation** | `Ctrl+Arrow Keys` | Move to adjacent elements |

*All keybinds can be customized through the extension popup!*

## 📥 Installation

### From Source (Developer Mode)

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension will be installed and ready to use

## 🎯 Usage Guide

### Quick Copy (Traditional)
1. Navigate to any webpage
2. Right-click on any HTML element
3. Select "Copy Element" from context menu
4. Element HTML is copied to clipboard

### Advanced Navigation (Hotkeys)
1. **Start selection**: Press `Ctrl+Shift+C` on any element
2. **Navigate DOM**: Use `Ctrl+Shift+↑/↓` to move through parent/child elements
3. **Spatial movement**: Use `Ctrl+Arrow Keys` to move to visually adjacent elements
4. **Copy selection**: Press `Ctrl+Shift+Enter` to copy the selected element
5. **Cancel**: Press `Escape` to clear selection

### Customize Keybinds
1. Click the extension icon in the toolbar
2. Click the edit button (✏️) next to any keybind
3. Press your desired key combination
4. Save changes (automatically prevents conflicts)

### Enable/Disable
- Use the toggle switch in the popup to enable/disable the extension
- When disabled, all hotkeys and visual feedback are turned off

## 📋 Example Output

When you select an element like this:

```html
<span class="payment-summary__price-column-total h2" data-v-0ce13794="">
  $9.49
</span>
```

The complete HTML will be copied to your clipboard, including all classes, attributes, and content.

## 🛠️ Pro Tips

- **Quick navigation**: After selecting an element with `Ctrl+Shift+C`, immediately use arrow keys to explore the DOM
- **Spatial precision**: Use `Ctrl+Arrow` keys to jump between visually related elements (like menu items or grid cells)
- **Visual feedback**: Watch the red highlight overlay to see exactly what you're selecting
- **Auto-scrolling**: Selected elements automatically scroll into view, so you never lose track
- **Keybind conflicts**: The extension prevents duplicate keybinds and shows warnings for conflicts

## 🔐 Permissions

This extension requires the following permissions:

- `contextMenus`: To add the "Copy Element" option to the right-click menu
- `activeTab`: To access the current tab and copy elements
- `scripting`: To inject the copy functionality into web pages
- `storage`: To save your custom keybinds and preferences

## 📁 Files Structure

```
Element-Copy/
├── manifest.json          # Extension manifest (V3)
├── background.js          # Service worker for context menu and messaging
├── content.js            # Content script for element interaction and navigation
├── popup.html            # Extension popup interface with settings
├── popup.js              # Popup logic for keybind customization
├── icons/                # Extension icons (16px, 32px, 48px, 128px)
└── README.md             # Documentation
```

## ⚡ Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Service Worker**: Handles context menu creation, clicks, and cross-tab messaging
- **Content Script**: Advanced DOM navigation, spatial algorithms, and clipboard operations
- **Modern APIs**: Uses `navigator.clipboard` with comprehensive fallback support
- **Smart Algorithms**: Spatial navigation uses distance-based scoring for optimal element selection
- **Auto-scrolling**: Intelligent viewport management with edge detection and smooth centering

## 🌐 Browser Compatibility

- Chrome 88+ (Manifest V3 requirement)
- Edge 88+ (Chromium-based)
- All modern Chromium-based browsers

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements. Contributions are welcome for:

- New navigation features
- UI/UX improvements  
- Cross-browser compatibility
- Performance optimizations
- Bug fixes and testing

## 💬 Support

If you encounter any issues or have suggestions, please create an issue in the repository.