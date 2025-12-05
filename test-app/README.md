# ApiTinker Test Application

A simple test application to demonstrate and test all features of the ApiTinker Chrome extension.

## Features

This test application includes:

### 1. API Request Tests
- **GET Request** - Fetch data from JSONPlaceholder API
- **POST Request** - Create a new post
- **PUT Request** - Update existing data
- **DELETE Request** - Delete data
- **Error Request** - Test 404 error handling
- **Slow Request** - Test timeout and loading states (3 second delay)

### 2. Console Logging Tests
- **console.log()** - Test basic logging
- **console.warn()** - Test warning messages
- **console.error()** - Test error messages
- **console.info()** - Test info messages
- **Grouped Logs** - Test nested console groups

### 3. Error Generation Tests
- **Throw Error** - Test caught errors
- **Promise Rejection** - Test unhandled promise rejections
- **Undefined Error** - Test reference errors
- **Type Error** - Test type errors

### 4. Real-time Statistics
- Total API requests made
- Successful requests
- Failed requests
- Console log count
- Error count

## How to Use

1. **Start the test application:**
   ```bash
   cd test-app
   open index.html
   ```
   Or use a local server:
   ```bash
   python3 -m http.server 8080
   # Then visit http://localhost:8080
   ```

2. **Load the ApiTinker extension:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder from the main project

3. **Test the features:**

   **API Client:**
   - Click the API request buttons in the test app
   - Open ApiTinker extension
   - See the requests in the History tab
   - Try sending your own requests using the API Client

   **Mock Rules:**
   - Go to the Mocks tab in ApiTinker
   - Create a mock rule for `*://jsonplaceholder.typicode.com/*`
   - Modify headers or redirect to a different URL
   - Click API request buttons again to see mocked responses

   **Contracts:**
   - Go to the Contracts tab in ApiTinker
   - Create a new OpenAPI or JSON Schema contract
   - Define the expected API structure
   - Validate your API requests against the contract

   **Bug Reporter:**
   - Click the console logging buttons in the test app
   - Click the error generation buttons
   - Open ApiTinker and go to the Bugs tab
   - Create a new bug report
   - See all captured logs, errors, and API calls
   - Export the report as JSON or Markdown

   **Settings:**
   - Go to the Settings tab in ApiTinker
   - Toggle dark/light mode
   - Adjust auto-save and timeout settings
   - See settings persist across browser restarts

## API Endpoints Used

This test app uses the following free public APIs:

- **JSONPlaceholder** (https://jsonplaceholder.typicode.com)
  - Fake REST API for testing
  - Used for GET, POST, PUT, DELETE requests

- **HTTPBin** (https://httpbin.org)
  - HTTP request & response service
  - Used for slow request testing

## Tips for Testing

1. **Open Browser DevTools** - Keep the console open to see all logs and errors in real-time

2. **Create Mock Rules** - Try creating rules to:
   - Block certain requests
   - Add custom headers
   - Redirect to different endpoints
   - Simulate API delays

3. **Test Error Handling** - Generate errors and see how ApiTinker captures them:
   - Stack traces
   - Timestamps
   - Error types

4. **Export/Import** - Test the collaboration features:
   - Export mock rules and share them
   - Import configurations
   - Export bug reports

5. **Performance Testing** - Use the slow request button to test:
   - Loading states
   - Timeout handling
   - Response time tracking

## Troubleshooting

### CORS Errors
If you see CORS errors, ApiTinker's background script should handle them. If not:
- Check that the extension has proper permissions
- Verify the extension is loaded correctly

### Extension Not Capturing Logs
If logs aren't being captured:
- Refresh the test page after loading the extension
- Check that content scripts are injected (inspect the page)
- Verify the extension has `<all_urls>` permission

### Mock Rules Not Working
If mock rules don't apply:
- Verify the rule is enabled
- Check the URL pattern matches exactly
- Ensure the correct environment is selected
- Refresh the page after creating/updating rules

## Next Steps

After testing with this simple app, try:
1. Testing on real production websites
2. Creating complex mock scenarios
3. Building API contracts for your own APIs
4. Sharing configurations with your team
5. Generating bug reports for actual issues

## License

MIT License - Free to use for testing ApiTinker
