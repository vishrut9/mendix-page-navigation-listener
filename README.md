# Page Navigation Listener Widget

A Mendix pluggable widget that detects page navigation and triggers configured actions (nanoflows/microflows).

## Features

- ✅ **Automatic Navigation Detection** - Detects when users navigate between pages in Mendix apps
- ✅ **Works with Mendix 10.x** - Tested and optimized for modern Mendix versions
- ✅ **Configurable Actions** - Trigger any nanoflow or microflow on navigation
- ✅ **Infinite Loop Protection** - Built-in safeguards prevent endless execution cycles
- ✅ **Zero UI Footprint** - Completely invisible widget that works in the background
- ✅ **DOM-based Detection** - Reliable page change detection via MutationObserver

## How It Works

The widget watches for changes in Mendix's `.mx-placeholder` element, which contains the current page content. When navigation occurs and new page content is loaded, the configured action is triggered automatically.

## Installation

1. Download the latest `.mpk` file from the [Releases](../../releases) page
2. Import the widget into your Mendix project
3. Place the widget in your application's layout (recommended: place in Atlas_Default layout)
4. Configure the `onNavigate` property with your desired nanoflow/microflow

## Configuration

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `onNavigate` | Action | No | Nanoflow or microflow to execute when navigation is detected |

### Usage Example

1. Add the **PageNavigationListener** widget to your main layout
2. Configure the `onNavigate` property:
   - Select a nanoflow (e.g., `ACT_LogPageNavigation`)
   - Or select a microflow (e.g., `ACT_TrackUserNavigation`)
3. The action will execute:
   - On initial page load
   - Every time the user navigates to a different page

### Use Cases

- **Analytics & Tracking** - Log user navigation patterns
- **Session Management** - Update session data on page changes
- **Breadcrumb Updates** - Maintain navigation history
- **Page-specific Logic** - Trigger actions based on current page
- **User Activity Monitoring** - Track user engagement

## Technical Details

### How Navigation is Detected

The widget uses a **MutationObserver** to watch for changes in the DOM:

```typescript
// Watches .mx-placeholder for child element changes
const placeholder = document.querySelector(".mx-placeholder");
observerRef.current.observe(placeholder, {
    childList: true,   // Detect when children are added/removed
    subtree: false     // Only watch direct children (not nested changes)
});
```

### Infinite Loop Prevention

The widget includes protection against infinite loops that could occur if the triggered action causes DOM changes:

```typescript
// Execution guard prevents re-triggering during action execution
if (isExecutingRef.current) {
    return; // Skip execution if already running
}

// Set guard, execute action, reset after 100ms
isExecutingRef.current = true;
onNavigate.execute();
setTimeout(() => { isExecutingRef.current = false; }, 100);
```

### Memory Management

The widget properly cleans up resources when unmounted:

```typescript
// Cleanup function runs when widget is removed
return () => {
    if (observerRef.current) {
        observerRef.current.disconnect();  // Stop observing
        observerRef.current = null;        // Clear reference
    }
};
```

This prevents:
- Memory leaks from orphaned observers
- Multiple observers running simultaneously
- Stale action references

## Version History

### Version 2.0.0
- Clean, optimized implementation for Mendix 10.x
- Removed experimental mx.ui.getContentForm() approach
- Reliable DOM-based navigation detection
- Improved infinite loop protection
- Enhanced cleanup and memory management

### Version 1.0.0
- Initial release
- Basic DOM observer implementation
- Navigation detection via .mx-placeholder monitoring

## Browser Compatibility

Works in all modern browsers:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari

## Mendix Compatibility

- ✅ Mendix 10.x (tested on 10.24)
- ⚠️ Mendix 9.x (should work, not extensively tested)

## Development and Contribution

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Building the Widget

```bash
# Install dependencies
npm install

# Development build (with watch mode)
npm start

# Production build
npm run build

# Create release package (.mpk file)
npm run release
```

### Project Structure

```
pageNavigationListener/
├── src/
│   ├── PageNavigationListener.tsx        # Main widget component
│   ├── PageNavigationListener.xml        # Widget configuration
│   ├── PageNavigationListener.editorPreview.tsx
│   ├── PageNavigationListener.editorConfig.ts
│   ├── package.xml                       # Widget metadata
│   ├── components/                       # React components
│   └── ui/                               # CSS styles
├── typings/
│   └── PageNavigationListenerProps.d.ts  # TypeScript definitions
├── dist/                                 # Build output (.mpk files)
├── package.json                          # npm configuration
├── tsconfig.json                         # TypeScript config
└── README.md                             # This file
```

### Development Workflow

1. Install NPM package dependencies by using: `npm install`. If you use NPM v7.x.x, which can be checked by executing `npm -v`, execute: `npm install --legacy-peer-deps`.
2. Run `npm start` to watch for code changes. On every change:
    - the widget will be bundled;
    - the bundle will be included in a `dist` folder in the root directory of the project;
    - the bundle will be included in the `deployment` and `widgets` folder of the Mendix test project.

### Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

#### Development Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly in a Mendix project
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Troubleshooting

### Widget not triggering on navigation

**Solution**: Make sure the widget is placed in a **layout**, not just a page. Layouts are persistent across page navigation.

### Action executing multiple times

**Solution**: This should be prevented by the built-in guard. If you still experience this, ensure only one instance of the widget exists in your app.

### Widget not found in Studio Pro

**Solution**: After importing the `.mpk`, you may need to:
1. Restart Studio Pro
2. Synchronize project directory (F4)
3. Check if the widget appears under "Add-on widgets"

### Memory concerns

**Solution**: The widget automatically cleans up its MutationObserver when unmounted, preventing memory leaks. This is handled by React's cleanup function in the useEffect hook.

## Issues, Suggestions and Feature Requests

Please open an issue on GitHub for any bugs, feature requests, or suggestions.

## License

MIT License - feel free to use in both personal and commercial projects.

## Author

Created for Mendix development workflows.

## Acknowledgments

- Built with [Mendix Pluggable Widgets Tools](https://www.npmjs.com/package/@mendix/pluggable-widgets-tools)
- Uses React 18.2.0
- Leverages the browser's MutationObserver API
