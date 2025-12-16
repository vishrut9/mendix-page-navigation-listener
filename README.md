# Page Navigation Listener Widget

A Mendix pluggable widget that detects page navigation and triggers configured actions (nanoflows/microflows).

## Features

- ✅ **Automatic Navigation Detection** - Detects when users navigate between pages in Mendix apps
- ✅ **Works with Mendix 10.x** - Tested and optimized for modern Mendix versions
- ✅ **Cloud Deployment Ready** - Tested and working in Mendix Cloud environments
- ✅ **Intelligent Page Tracking** - Prevents duplicate executions on the same page
- ✅ **Configurable Actions** - Trigger any nanoflow or microflow on navigation
- ✅ **Infinite Loop Protection** - Built-in safeguards prevent endless execution cycles
- ✅ **Zero UI Footprint** - Completely invisible widget that works in the background
- ✅ **DOM-based Detection** - Reliable page change detection via MutationObserver
- ✅ **No Duplicate Logging** - Each page navigation triggers action exactly once

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
    subtree: true      // Watch nested changes to catch all page loads
});
```

### Page Tracking (Prevents Duplicates)

The widget intelligently tracks the current page to prevent duplicate executions:

```typescript
// Extract stable page identifier from DOM
const getCurrentPageId = (): string | null => {
    const pageElement = placeholder.querySelector('[class*="mx-name-"]');
    if (pageElement) {
        const match = pageElement.className.match(/mx-name-\w+/);
        return match ? match[0] : null;  // e.g., "mx-name-layoutGrid1"
    }
    return null;
};

// Only execute if page actually changed
if (currentPage === currentPageRef.current) {
    return; // Skip - still on same page
}
currentPageRef.current = currentPage;  // Update tracked page
onNavigate.execute();  // Execute action for new page
```

This prevents multiple executions that can occur in cloud deployments due to:
- Progressive rendering and chunked asset loading
- Loading states and skeleton screens
- DOM reordering during page transitions

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

### Version 2.1.0 (Current)
- **Intelligent page tracking** - Prevents duplicate executions on same page
- **Cloud deployment ready** - Tested and working in Mendix Cloud environments
- **Stable page identification** - Uses mx-name-* class extraction with regex
- **Handles progressive rendering** - Works with cloud CDN and chunked loading
- **Subtree observation** - Changed to subtree: true for better page detection
- **Console logging** - Added debugging output for page transitions
- **Fixes duplicate logging** - Resolves multiple executions per navigation in cloud
- **Production tested** - Verified working in both local and cloud deployments

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

### Action executing multiple times (Fixed in v2.1.0)

**Solution**: Version 2.1.0+ includes intelligent page tracking that prevents duplicate executions. If you still experience this:
1. Ensure you're using version 2.1.0 or later
2. Check browser console for `[PageNavigationListener]` messages
3. Verify only one instance of the widget exists in your app
4. For cloud deployments, the page tracking feature automatically handles progressive rendering

### Widget not found in Studio Pro

**Solution**: After importing the `.mpk`, you may need to:
1. Restart Studio Pro
2. Synchronize project directory (F4)
3. Check if the widget appears under "Add-on widgets"

### Memory concerns

**Solution**: The widget automatically cleans up its MutationObserver when unmounted, preventing memory leaks. This is handled by React's cleanup function in the useEffect hook.

## Design Rationale

### Why DOM-based Page Detection is Used

Mendix applications built with the React client are single-page applications (SPAs). In this model:

- Page navigation does not trigger a full browser reload
- The browser URL often remains unchanged (unless Page URLs are enabled)
- Layouts may persist across page navigations
- React widgets placed in layouts do not remount on page changes

At the same time, Mendix currently does not expose:

- A page lifecycle API
- A page navigation event

Because of these constraints, a widget cannot reliably detect page navigation through:

- URL changes
- React lifecycle alone
- Mendix Client APIs

### Chosen Approach

This widget detects page navigation by:

1. **Observing** the layout's `.mx-placeholder`, which is the container where Mendix renders page content
2. **Inferring** the active page from the first widget instance rendered inside that placeholder
3. **Using** the widget's `mx-name-*` class as a stable page identifier
4. **Executing** the configured Mendix action only when that identifier changes

This approach aligns with how Mendix actually renders pages at runtime and has been validated against:

- Local development runtime
- Mendix Cloud deployments
- Atlas-based layouts
- Multiple page and layout combinations

While this technique relies on DOM observation, it provides the best available signal for page navigation in Mendix SPAs where Page URLs are disabled.

## Known Limitations

### 1. Dependency on Mendix Internals
**Impact**: Widget relies on Mendix DOM structure (`.mx-placeholder`) and naming conventions (`mx-name-*` pattern)  
**Risk**: Breaking changes in future Mendix versions could require widget updates  
**Likelihood**: Low (conventions stable for 10+ years)

### 2. Heuristic vs. Semantic Detection
**Nature**: Widget detects navigation through DOM changes and widget IDs, not semantic "page" concepts  
**Implication**: Relies on Mendix rendering behavior; unusual page structures may behave unexpectedly  
**Trade-off**: Accepted due to absence of native navigation API

### 3. Conditional Visibility Edge Cases
**Scenario**: Pages with conditional visibility on first widget may appear as different "pages" to different users  
**Example**: Admin sees `mx-name-adminGrid`, User sees `mx-name-userGrid` on same page  
**Impact**: Potential discrepancies in navigation tracking

### 4. Layout Requirement
**Critical**: Widget must be placed in a layout, not on individual pages  
**Reason**: Page-level placement causes widget destruction on navigation  
**Result**: Complete detection failure if incorrectly placed

### 5. Execution Guard Timeout
**Design**: 100ms timeout prevents duplicate executions during rapid DOM changes  
**Edge Case**: Very slow actions (>100ms) combined with rapid navigation may overlap  
**Justification**: Balances duplicate prevention with responsiveness

### 6. Modal Navigation
**Behavior**: Navigation within modals may or may not trigger detection depending on modal DOM structure  
**Rationale**: Modals often represent contextual overlays rather than distinct page navigations  
**By Design**: Intentional to avoid treating modal interactions as page views

### 7. Single Placeholder Assumption
**Assumption**: Each layout contains one `.mx-placeholder` element  
**Validity**: True for all standard Mendix layouts and Atlas templates  
**Impact**: None for conventional Mendix applications

## Best Practices

- ✅ Place widget in layouts only (e.g., `Atlas_Default`)
- ✅ Use single widget instance per application
- ✅ Avoid conditional visibility on page's first widget
- ✅ Test in cloud environment before production deployment
- ✅ Monitor console logs during development

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
