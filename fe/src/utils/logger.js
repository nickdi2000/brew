// src/utils/logger.js
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;

// Get environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; // Fallback URL
const ENV = import.meta.env.VITE_ENV;
const ENABLE_LOGS = import.meta.env.VITE_ENABLE_LOGS === 'true'; // Default to false if not set

// Batch logging configuration
const BATCH_TIMEOUT = 2000; // 2 seconds
let logQueue = [];
let batchTimeout = null;

const processLogQueue = async () => {
  if (logQueue.length === 0) return;

  const currentQueue = [...logQueue];
  logQueue = []; // Clear the queue

  try {
    const response = await fetch(`${API_BASE_URL}/log/batch`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        // Add any auth headers if needed
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ logs: currentQueue }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (err) {
    // Use original console to avoid infinite loop
    originalConsoleError('Error sending batch logs to server:', err);
    
    // If batch fails, don't lose the logs - add them back to queue
    logQueue = [...currentQueue, ...logQueue];
  }
};

const scheduleBatchProcess = () => {
  if (batchTimeout) {
    clearTimeout(batchTimeout);
  }
  batchTimeout = setTimeout(processLogQueue, BATCH_TIMEOUT);
};

const sendLogToServer = (level, args) => {
  // Only send logs to server if ENABLE_LOGS is true and in local environment
  if (!ENABLE_LOGS || ENV !== 'local') {
    return;
  }

  try {
    const message = args.map(item => {
      try {
        return typeof item === 'object' ? JSON.stringify(item) : String(item);
      } catch (e) {
        return '[Circular or Non-Serializable Object]';
      }
    }).join(' ');

    const logData = {
      level,
      message,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      route: window.location.pathname,
      component: 'Unknown'
    };

    logQueue.push(logData);
    scheduleBatchProcess();
  } catch (err) {
    // Use original console to avoid infinite loop
    originalConsoleError('Error preparing log for batch:', err);
  }
};

// Override console methods
console.log = (...args) => {
  originalConsoleLog.apply(console, args);
  sendLogToServer('info', args);
};

console.error = (...args) => {
  originalConsoleError.apply(console, args);
  sendLogToServer('error', args);
};

console.warn = (...args) => {
  originalConsoleWarn.apply(console, args);
  sendLogToServer('warn', args);
};

console.info = (...args) => {
  originalConsoleInfo.apply(console, args);
  sendLogToServer('info', args);
};

// Clean up queued logs before page unload
window.addEventListener('beforeunload', () => {
  if (logQueue.length > 0) {
    processLogQueue();
  }
});

export default console;