const fs = require('fs');
const path = require('path');
const util = require('util');

class Logger {
  constructor() {
    this.logDirectory = path.join(process.cwd(), '..', 'logs');
    this.ensureLogDirectoryExists();
    this.setupLogFile();
    this.overrideConsole();
  }

  ensureLogDirectoryExists() {
    if (!fs.existsSync(this.logDirectory)) {
      fs.mkdirSync(this.logDirectory, { recursive: true });
    }
  }

  setupLogFile() {
    const date = new Date().toISOString().split('T')[0];
    const logFileName = `backend-${date}.log`;
    this.logFilePath = path.join(this.logDirectory, logFileName);
    
    // Create or append to the log file
    if (!fs.existsSync(this.logFilePath)) {
      fs.writeFileSync(this.logFilePath, '');
    }
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    let formattedMessage = message;

    // If message is an object/array, stringify it
    if (typeof message === 'object') {
      formattedMessage = util.inspect(message, {
        depth: null,
        colors: false,
        maxArrayLength: null,
        maxStringLength: null,
        breakLength: Infinity,
        compact: true
      });
    }

    // Format any additional metadata
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = ' | ' + Object.entries(meta)
        .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
        .join(' | ');
    }

    return `[${timestamp}] [${level.toUpperCase()}] ${formattedMessage}${metaStr}\n`;
  }

  writeToFile(level, message, meta = {}) {
    const logEntry = this.formatMessage(level, message, meta);
    fs.appendFileSync(this.logFilePath, logEntry);
  }

  overrideConsole() {
    const originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug
    };

    // Override console methods
    console.log = (...args) => {
      this.writeToFile('info', util.format(...args));
      originalConsole.log(...args);
    };

    console.info = (...args) => {
      this.writeToFile('info', util.format(...args));
      originalConsole.info(...args);
    };

    console.warn = (...args) => {
      this.writeToFile('warn', util.format(...args));
      originalConsole.warn(...args);
    };

    console.error = (...args) => {
      this.writeToFile('error', util.format(...args));
      originalConsole.error(...args);
    };

    console.debug = (...args) => {
      this.writeToFile('debug', util.format(...args));
      originalConsole.debug(...args);
    };
  }

  // Explicit logging methods
  info(message, meta = {}) {
    this.writeToFile('info', message, meta);
    console.info(message);
  }

  warn(message, meta = {}) {
    this.writeToFile('warn', message, meta);
    console.warn(message);
  }

  error(message, meta = {}) {
    this.writeToFile('error', message, meta);
    console.error(message);
  }

  debug(message, meta = {}) {
    this.writeToFile('debug', message, meta);
    console.debug(message);
  }

  // Request logging helper
  logRequest(req, meta = {}) {
    const requestInfo = {
      method: req.method,
      url: req.url,
      params: req.params,
      query: req.query,
      body: req.body,
      headers: {
        ...req.headers,
        // Mask sensitive headers
        authorization: req.headers.authorization ? 
          `${req.headers.authorization.substring(0, 20)}...` : undefined,
        cookie: req.headers.cookie ? '[MASKED]' : undefined
      },
      ip: req.ip,
      userId: req.user?._id
    };

    this.info(`${req.method} ${req.url}`, {
      ...requestInfo,
      ...meta
    });
  }

  // Response logging helper
  logResponse(req, res, responseBody, meta = {}) {
    const responseInfo = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: meta.responseTime,
      response: responseBody
    };

    this.info(`${req.method} ${req.url} - ${res.statusCode}`, {
      ...responseInfo,
      ...meta
    });
  }
}

// Create and export a singleton instance
const logger = new Logger();
module.exports = logger;
