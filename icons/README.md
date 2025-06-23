# Icons for Element Copy Extension

This folder should contain the following icon files:

- `icon16.png` - 16x16 pixels (toolbar icon)
- `icon32.png` - 32x32 pixels (Windows computers often use this size)
- `icon48.png` - 48x48 pixels (extension management page)
- `icon128.png` - 128x128 pixels (Chrome Web Store and installation)

## Creating Icons

You can create icons using any image editor. Here's a simple design suggestion:

### Design Concept
- Background: Blue gradient (#007acc to #005a9e)
- Icon: White HTML tag symbol `</>` or copy symbol
- Style: Modern, flat design with rounded corners

### Quick Icon Generation
You can use online tools like:
- [Favicon.io](https://favicon.io/) 
- [Canva](https://canva.com/)
- [GIMP](https://www.gimp.org/) (free)
- [Photoshop](https://www.adobe.com/products/photoshop.html)

### SVG Template
Here's a simple SVG you can convert to PNG:

```svg
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#007acc"/>
      <stop offset="100%" style="stop-color:#005a9e"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="20" fill="url(#bg)"/>
  <text x="64" y="75" font-family="monospace" font-size="36" fill="white" text-anchor="middle" font-weight="bold">&lt;/&gt;</text>
</svg>
```

## Temporary Solution

For now, the extension will work without custom icons (Chrome will use default icons). You can add proper icons later by:

1. Creating the icon files mentioned above
2. Placing them in this `icons/` folder
3. The manifest.json is already configured to use them

## Icon Requirements

- **Format**: PNG (recommended) or JPEG
- **Transparency**: PNG with transparency is preferred
- **Quality**: High resolution, crisp edges
- **Consistency**: All sizes should look good and be recognizable
