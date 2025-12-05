// Background Service Worker
console.log('ApiTinker background service worker loaded');

// Storage for API logs and intercepted requests
const requestLogs = [];
const mockRules = [];
const responseModifiers = new Map(); // Store response modification rules

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'GET_LOGS':
      sendResponse({ logs: requestLogs });
      break;
    
    case 'CLEAR_LOGS':
      requestLogs.length = 0;
      sendResponse({ success: true });
      break;
    
    case 'GET_MOCK_RULES':
      sendResponse({ rules: mockRules });
      break;
    
    case 'UPDATE_MOCK_RULES':
      mockRules.length = 0;
      mockRules.push(...message.rules);
      updateDeclarativeRules(message.rules);
      updateResponseModifiers(message.rules);
      sendResponse({ success: true });
      break;
    
    case 'MAKE_REQUEST':
      makeApiRequest(message.request)
        .then(response => sendResponse({ success: true, response }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Keep channel open for async response
    
    case 'INTERCEPT_REQUEST':
      // Handle request interception from content script
      interceptRequest(message.requestId, message.url)
        .then(modifiedResponse => sendResponse({ success: true, response: modifiedResponse }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
    
    default:
      sendResponse({ error: 'Unknown message type' });
  }
});

// Log network requests for debugging
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (details.type === 'xmlhttprequest' || details.type === 'fetch') {
      requestLogs.push({
        id: details.requestId,
        url: details.url,
        method: details.method,
        timestamp: new Date().toISOString(),
        type: details.type,
        tabId: details.tabId
      });
      
      // Keep only last 100 logs
      if (requestLogs.length > 100) {
        requestLogs.shift();
      }
    }
  },
  { urls: ['<all_urls>'] }
);

// Make API request from background script (to bypass CORS)
async function makeApiRequest(request) {
  const { url, method, headers, body } = request;
  
  const options = {
    method: method || 'GET',
    headers: headers || {}
  };
  
  if (body && method !== 'GET' && method !== 'HEAD') {
    options.body = body;
  }
  
  const startTime = performance.now();
  
  try {
    const response = await fetch(url, options);
    const endTime = performance.now();
    
    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    
    let responseBody;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }
    
    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseBody,
      timing: Math.round(endTime - startTime)
    };
  } catch (error) {
    throw new Error(`Request failed: ${error.message}`);
  }
}

// Update declarative net request rules for mocking
async function updateDeclarativeRules(rules) {
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const ruleIds = existingRules.map(rule => rule.id);
  
  if (ruleIds.length > 0) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: ruleIds
    });
  }
  
  const dynamicRules = rules
    .filter(rule => rule.enabled)
    .map((rule, index) => ({
      id: index + 1,
      priority: rule.priority || 1,
      action: createRuleAction(rule),
      condition: createRuleCondition(rule)
    }));
  
  if (dynamicRules.length > 0) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: dynamicRules
    });
  }
}

function createRuleAction(rule) {
  if (rule.action === 'block') {
    return { type: 'block' };
  }
  
  if (rule.action === 'redirect' && rule.redirectUrl) {
    return {
      type: 'redirect',
      redirect: { url: rule.redirectUrl }
    };
  }
  
  // Handle response modification by redirecting to data URL with mock response
  if (rule.action === 'modifyResponse' && rule.responseModifications) {
    const mockResponse = generateMockResponse(rule);
    const dataUrl = createDataUrl(mockResponse);
    
    return {
      type: 'redirect',
      redirect: { url: dataUrl }
    };
  }
  
  if (rule.action === 'modifyHeaders') {
    const requestHeaders = [];
    const responseHeaders = [];
    
    if (rule.modifyRequestHeaders) {
      rule.modifyRequestHeaders.forEach(header => {
        requestHeaders.push({
          operation: header.operation || 'set',
          header: header.name,
          value: header.value
        });
      });
    }
    
    if (rule.modifyResponseHeaders) {
      rule.modifyResponseHeaders.forEach(header => {
        responseHeaders.push({
          operation: header.operation || 'set',
          header: header.name,
          value: header.value
        });
      });
    }
    
    return {
      type: 'modifyHeaders',
      requestHeaders,
      responseHeaders
    };
  }
  
  return { type: 'allow' };
}

// Generate mock response from rule
function generateMockResponse(rule) {
  if (!rule.responseModifications || rule.responseModifications.length === 0) {
    return {};
  }
  
  const modification = rule.responseModifications[0];
  
  // For 'replace' type, use the value directly
  if (modification.type === 'replace') {
    return modification.value || {};
  }
  
  // For 'merge' type, use the value directly
  if (modification.type === 'merge') {
    return modification.value || {};
  }
  
  // For 'set' type, create object with the property
  if (modification.type === 'set' && modification.path) {
    const result = {};
    setNestedProperty(result, modification.path, modification.value);
    return result;
  }
  
  // For other types, return empty object
  return {};
}

// Create a data URL from mock response
function createDataUrl(responseData) {
  const jsonString = JSON.stringify(responseData);
  const base64 = btoa(jsonString);
  return `data:application/json;base64,${base64}`;
}

function createRuleCondition(rule) {
  const condition = {};
  
  if (rule.urlPattern) {
    condition.urlFilter = rule.urlPattern;
  }
  
  if (rule.resourceTypes && rule.resourceTypes.length > 0) {
    condition.resourceTypes = rule.resourceTypes;
  } else {
    condition.resourceTypes = ['xmlhttprequest'];
  }
  
  return condition;
}

// Update response modifiers map
function updateResponseModifiers(rules) {
  responseModifiers.clear();
  
  rules
    .filter(rule => rule.enabled && rule.action === 'modifyResponse')
    .forEach(rule => {
      responseModifiers.set(rule.id, rule);
    });
}

// Check if a URL matches any response modification rules
function findMatchingResponseRule(url) {
  for (const [id, rule] of responseModifiers.entries()) {
    if (matchesUrlPattern(url, rule.urlPattern)) {
      return rule;
    }
  }
  return null;
}

// Simple URL pattern matching
function matchesUrlPattern(url, pattern) {
  if (!pattern) return false;
  
  // Convert pattern to regex
  const regexPattern = pattern
    .replace(/\*/g, '.*')
    .replace(/\?/g, '\\?');
  
  try {
    const regex = new RegExp('^' + regexPattern + '$');
    return regex.test(url);
  } catch (e) {
    return false;
  }
}

// Intercept and modify response
async function interceptRequest(requestId, url) {
  const rule = findMatchingResponseRule(url);
  
  if (!rule) {
    return null;
  }
  
  // Fetch the original response
  const response = await fetch(url);
  const contentType = response.headers.get('content-type');
  
  let body;
  if (contentType && contentType.includes('application/json')) {
    body = await response.json();
  } else {
    body = await response.text();
  }
  
  // Apply modifications
  const modifiedBody = applyResponseModifications(body, rule);
  
  return {
    status: rule.responseStatus || response.status,
    statusText: rule.responseStatusText || response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    body: modifiedBody,
    modified: true
  };
}

// Apply response modifications based on rule
function applyResponseModifications(originalBody, rule) {
  if (!rule.responseModifications) {
    return originalBody;
  }
  
  let modifiedBody = typeof originalBody === 'string' 
    ? JSON.parse(originalBody) 
    : JSON.parse(JSON.stringify(originalBody));
  
  for (const modification of rule.responseModifications) {
    try {
      switch (modification.type) {
        case 'replace':
          // Replace entire response
          modifiedBody = modification.value;
          break;
        
        case 'set':
          // Set a specific property
          setNestedProperty(modifiedBody, modification.path, modification.value);
          break;
        
        case 'delete':
          // Delete a specific property
          deleteNestedProperty(modifiedBody, modification.path);
          break;
        
        case 'merge':
          // Merge with existing response
          modifiedBody = deepMerge(modifiedBody, modification.value);
          break;
        
        case 'delay':
          // Delay is handled separately
          break;
      }
    } catch (error) {
      console.error('Error applying modification:', error);
    }
  }
  
  return modifiedBody;
}

// Helper to set nested property by path
function setNestedProperty(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current)) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  
  current[keys[keys.length - 1]] = value;
}

// Helper to delete nested property by path
function deleteNestedProperty(obj, path) {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current)) {
      return;
    }
    current = current[keys[i]];
  }
  
  delete current[keys[keys.length - 1]];
}

// Deep merge objects
function deepMerge(target, source) {
  const output = Object.assign({}, target);
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('ApiTinker installed');
});
