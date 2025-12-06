// Statistics tracking
let stats = {
    total: 0,
    success: 0,
    failed: 0,
    consoleCount: 0,
    errorCount: 0
};

// Update statistics display
function updateStats() {
    document.getElementById('totalRequests').textContent = stats.total;
    document.getElementById('successRequests').textContent = stats.success;
    document.getElementById('failedRequests').textContent = stats.failed;
    document.getElementById('consoleCount').textContent = stats.consoleCount;
    document.getElementById('errorCount').textContent = stats.errorCount;
}

// Display output in a section
function displayOutput(elementId, message, type = 'info') {
    const output = document.getElementById(elementId);
    const log = document.createElement('div');
    log.className = `log log-${type}`;
    log.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    output.appendChild(log);
    output.scrollTop = output.scrollHeight;
}

// API Request Tests
async function testGetRequest() {
    stats.total++;
    displayOutput('apiOutput', 'Making GET request...', 'info');
    
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
        const data = await response.json();
        stats.success++;
        displayOutput('apiOutput', `Success! Received: ${JSON.stringify(data).substring(0, 100)}...`, 'success');
    } catch (error) {
        stats.failed++;
        displayOutput('apiOutput', `Error: ${error.message}`, 'error');
    }
    
    updateStats();
}

async function testPostRequest() {
    stats.total++;
    displayOutput('apiOutput', 'Making POST request...', 'info');
    
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: 'Test Post from ApiTinker',
                body: 'This is a test post',
                userId: 1
            })
        });
        const data = await response.json();
        stats.success++;
        displayOutput('apiOutput', `Success! Created post with ID: ${data.id}`, 'success');
    } catch (error) {
        stats.failed++;
        displayOutput('apiOutput', `Error: ${error.message}`, 'error');
    }
    
    updateStats();
}

async function testPutRequest() {
    stats.total++;
    displayOutput('apiOutput', 'Making PUT request...', 'info');
    
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts/1', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: 1,
                title: 'Updated Post',
                body: 'This post has been updated',
                userId: 1
            })
        });
        const data = await response.json();
        stats.success++;
        displayOutput('apiOutput', `Success! Updated post: ${data.title}`, 'success');
    } catch (error) {
        stats.failed++;
        displayOutput('apiOutput', `Error: ${error.message}`, 'error');
    }
    
    updateStats();
}

async function testDeleteRequest() {
    stats.total++;
    displayOutput('apiOutput', 'Making DELETE request...', 'info');
    
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts/1', {
            method: 'DELETE'
        });
        stats.success++;
        displayOutput('apiOutput', `Success! Deleted post (Status: ${response.status})`, 'success');
    } catch (error) {
        stats.failed++;
        displayOutput('apiOutput', `Error: ${error.message}`, 'error');
    }
    
    updateStats();
}

async function testErrorRequest() {
    stats.total++;
    displayOutput('apiOutput', 'Making request to non-existent endpoint...', 'warning');
    
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/nonexistent');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        stats.failed++;
        displayOutput('apiOutput', `Expected Error: ${error.message}`, 'error');
    }
    
    updateStats();
}

async function testSlowRequest() {
    stats.total++;
    displayOutput('apiOutput', 'Making slow request (will take 3 seconds)...', 'info');
    
    try {
        // Using a delay endpoint
        const response = await fetch('https://httpbin.org/delay/3');
        const data = await response.json();
        stats.success++;
        displayOutput('apiOutput', 'Success! Slow request completed', 'success');
    } catch (error) {
        stats.failed++;
        displayOutput('apiOutput', `Error: ${error.message}`, 'error');
    }
    
    updateStats();
}

// Console Logging Tests
function testConsoleLog() {
    const message = 'This is a console.log() message';
    console.log(message);
    console.log('Object example:', { name: 'ApiTinker', version: '1.0.0', features: ['API Client', 'Mocking', 'Bug Reports'] });
    console.log('Array example:', [1, 2, 3, 4, 5]);
    
    stats.consoleCount += 3;
    displayOutput('consoleOutput', 'Generated 3 console.log() messages (check browser console)', 'info');
    updateStats();
}

function testConsoleWarn() {
    const message = 'This is a console.warn() message';
    console.warn(message);
    console.warn('⚠️ Warning: This is a test warning message');
    
    stats.consoleCount += 2;
    displayOutput('consoleOutput', 'Generated 2 console.warn() messages (check browser console)', 'warning');
    updateStats();
}

function testConsoleError() {
    const message = 'This is a console.error() message (not a thrown error)';
    console.error(message);
    console.error('❌ Error: This is a test error message');
    
    stats.consoleCount += 2;
    displayOutput('consoleOutput', 'Generated 2 console.error() messages (check browser console)', 'error');
    updateStats();
}

function testConsoleInfo() {
    console.info('ℹ️ Info: Application loaded successfully');
    console.info('Current timestamp:', new Date().toISOString());
    console.info('User agent:', navigator.userAgent);
    
    stats.consoleCount += 3;
    displayOutput('consoleOutput', 'Generated 3 console.info() messages (check browser console)', 'info');
    updateStats();
}

function testConsoleGroup() {
    console.group('📦 Grouped Console Logs');
    console.log('First log in group');
    console.log('Second log in group');
    console.group('Nested Group');
    console.log('Nested log 1');
    console.log('Nested log 2');
    console.groupEnd();
    console.log('Back to parent group');
    console.groupEnd();
    
    stats.consoleCount += 6;
    displayOutput('consoleOutput', 'Generated grouped console logs (check browser console)', 'info');
    updateStats();
}

// Error Generation Tests
function testThrowError() {
    try {
        displayOutput('errorOutput', 'Throwing a test error...', 'warning');
        throw new Error('This is a test error thrown intentionally');
    } catch (error) {
        stats.errorCount++;
        displayOutput('errorOutput', `Caught error: ${error.message}`, 'error');
        updateStats();
    }
}

function testPromiseRejection() {
    displayOutput('errorOutput', 'Creating an unhandled promise rejection...', 'warning');
    
    Promise.reject(new Error('This is an unhandled promise rejection'))
        .then(() => {
            // This won't execute
        });
    
    stats.errorCount++;
    displayOutput('errorOutput', 'Promise rejection created (check console)', 'error');
    updateStats();
}

function testUndefinedError() {
    try {
        displayOutput('errorOutput', 'Accessing undefined variable...', 'warning');
        // This will throw a ReferenceError
        console.log(thisVariableDoesNotExist);
    } catch (error) {
        stats.errorCount++;
        displayOutput('errorOutput', `${error.name}: ${error.message}`, 'error');
        updateStats();
    }
}

function testTypeError() {
    try {
        displayOutput('errorOutput', 'Calling method on null...', 'warning');
        // This will throw a TypeError
        const obj = null;
        obj.someMethod();
    } catch (error) {
        stats.errorCount++;
        displayOutput('errorOutput', `${error.name}: ${error.message}`, 'error');
        updateStats();
    }
}

// Initialize on page load
window.addEventListener('load', () => {
    console.log('🚀 ApiTinker Test Application loaded successfully!');
    console.log('Open the ApiTinker extension to start testing features');
    
    displayOutput('apiOutput', 'Ready to make API requests!', 'success');
    displayOutput('consoleOutput', 'Ready to generate console logs!', 'success');
    displayOutput('errorOutput', 'Ready to generate errors!', 'success');
    
    updateStats();
});

// Add some periodic background activity
setInterval(() => {
    if (Math.random() > 0.95) {
        console.log('Background activity:', new Date().toISOString());
    }
}, 5000);
