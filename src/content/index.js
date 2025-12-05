// Content Script - Bug Report Recorder
console.log('ApiTinker content script loaded');

// Store console logs and errors
const consoleLogs = [];
const errorLogs = [];

// Patch console methods to capture logs
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info
};

console.log = function(...args) {
  consoleLogs.push({
    type: 'log',
    message: args.map(arg => String(arg)).join(' '),
    timestamp: new Date().toISOString()
  });
  originalConsole.log.apply(console, args);
};

console.warn = function(...args) {
  consoleLogs.push({
    type: 'warn',
    message: args.map(arg => String(arg)).join(' '),
    timestamp: new Date().toISOString()
  });
  originalConsole.warn.apply(console, args);
};

console.error = function(...args) {
  consoleLogs.push({
    type: 'error',
    message: args.map(arg => String(arg)).join(' '),
    timestamp: new Date().toISOString()
  });
  originalConsole.error.apply(console, args);
};

console.info = function(...args) {
  consoleLogs.push({
    type: 'info',
    message: args.map(arg => String(arg)).join(' '),
    timestamp: new Date().toISOString()
  });
  originalConsole.info.apply(console, args);
};

// Capture runtime errors
window.addEventListener('error', (event) => {
  errorLogs.push({
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
    timestamp: new Date().toISOString()
  });
});

// Capture unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  errorLogs.push({
    message: `Unhandled Promise Rejection: ${event.reason}`,
    timestamp: new Date().toISOString()
  });
});

// Listen for messages from extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'GET_CONSOLE_LOGS':
      sendResponse({ logs: consoleLogs });
      break;
    
    case 'GET_ERROR_LOGS':
      sendResponse({ errors: errorLogs });
      break;
    
    case 'CLEAR_LOGS':
      consoleLogs.length = 0;
      errorLogs.length = 0;
      sendResponse({ success: true });
      break;
    
    case 'CAPTURE_SCREENSHOT':
      // This will be handled by the background script
      chrome.runtime.sendMessage({ type: 'CAPTURE_SCREENSHOT' }, (response) => {
        sendResponse(response);
      });
      return true;
    
    default:
      sendResponse({ error: 'Unknown message type' });
  }
});
