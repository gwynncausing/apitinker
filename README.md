# ApiTinker

A Chrome extension for API Mocking, Testing, and Debugging.

## 🎉 NEW: Response Modification Feature!

ApiTinker now supports **real-time API response modification**! Test features, simulate errors, and modify responses without backend changes.

[→ Quick Start Guide](QUICKSTART_MODIFY_RESPONSE.md) | [→ Full Documentation](RESPONSE_MODIFICATION.md)

## Features

- **API Client**: Send API requests with full control over headers, body, and methods
- **🆕 Modify Responses**: Intercept and modify API responses in real-time with 4 modification types
- **Mock & Override APIs**: Create rules to mock API responses, modify headers, and simulate delays
- **Bug Report Recorder**: Capture console logs, errors, and API calls for debugging
- **Collaboration**: Export/import configurations and share with your team

### Response Modification Features

- ✅ **Replace**: Completely replace API responses
- ✅ **Merge**: Merge new data with existing responses
- ✅ **Set Property**: Change specific fields (supports nested paths)
- ✅ **Delete Property**: Remove fields from responses
- ✅ **Add Delays**: Simulate slow networks
- ✅ **Change Status**: Test error handling with custom status codes

## Installation

### Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd apitinker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### Production

Install from the Chrome Web Store (coming soon)

## Development

```bash
# Install dependencies
npm install

# Build for development
npm run build

# Run tests
npm test

# Run E2E tests
npm run test:e2e
```

## Usage

### API Client

1. Click the extension icon to open the popup
2. Select HTTP method and enter URL
3. Add headers and body as needed
4. Click "Send" to make the request
5. View response in the Response section

### Mock Rules

1. Navigate to the "Mocks" tab
2. Click "+ Add Rule" to create a new mock rule
3. Configure URL pattern, action, and response modifications
4. Toggle rules on/off as needed
5. Export/import rules for sharing

### Bug Reports

1. Navigate to the "Bugs" tab
2. Click "+ New Report" to create a bug report
3. The extension automatically captures:
   - Console logs
   - Runtime errors
   - API requests
4. Export as JSON or Markdown

## Tech Stack

- Vue 3 + Vite
- Pinia (state management)
- TailwindCSS (styling)
- Chrome Extension Manifest V3
- Chrome Storage API (local storage)

## Project Structure

```
apitinker/
├── src/
│   ├── background/         # Background service worker
│   ├── content/           # Content scripts
│   ├── pages/             # Extension pages (popup, options)
│   ├── components/        # Vue components
│   ├── store/            # Pinia stores
│   └── style.css         # Global styles
├── public/               # Static assets
├── manifest.json         # Extension manifest
└── package.json          # Dependencies
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Roadmap

- [ ] Cloud sync workspace
- [ ] Built-in API mock server
- [ ] Multi-team collaboration
