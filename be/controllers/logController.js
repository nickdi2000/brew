const fs = require('fs').promises;
const path = require('path');

const MAX_LOG_LINES = 200;

const formatLogEntry = (logData) => {
  const {
    level,
    message,
    timestamp,
    url,
    route,
    userAgent,
    component
  } = logData;

  return `[${timestamp}] [${level.toUpperCase()}] ${message} | URL: ${url} | Route: ${route} | Component: ${component} | UserAgent: ${userAgent}\n`;
};

const rotateLogFile = async (logFile, newEntries) => {
  try {
    // Read existing file if it exists
    let existingContent = '';
    try {
      existingContent = await fs.readFile(logFile, 'utf8');
    } catch (err) {
      // File doesn't exist yet, that's fine
    }

    // Split into lines and combine with new entries
    const allLines = existingContent.split('\n')
      .filter(line => line.trim()) // Remove empty lines
      .concat(newEntries.split('\n').filter(line => line.trim()));

    // Keep only the latest MAX_LOG_LINES
    const rotatedContent = allLines
      .slice(Math.max(0, allLines.length - MAX_LOG_LINES))
      .join('\n');

    // Write back to file
    await fs.writeFile(logFile, rotatedContent + '\n');
  } catch (error) {
    console.error('Error rotating log file:', error);
    throw error;
  }
};

const logController = {
  async createLog(req, res) {
    try {
      const logData = req.body;
      
      // Get log directory from environment variable
      const logDir = process.env.FE_LOG_DIR || './logs';
      
      // Create log directory if it doesn't exist
      await fs.mkdir(logDir, { recursive: true });
      
      // Create log file name based on current date
      const date = new Date().toISOString().split('T')[0];
      const logFile = path.join(logDir, `frontend-${date}.log`);
      
      // Format log entry
      const logEntry = formatLogEntry(logData);

      // Rotate and write log
      await rotateLogFile(logFile, logEntry);
      
      res.status(200).json({
        success: true,
        message: 'Log entry created successfully'
      });
    } catch (error) {
      console.error('Error writing log:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to write log entry'
      });
    }
  },

  async createBatchLogs(req, res) {
    try {
      const { logs } = req.body;
      
      if (!Array.isArray(logs)) {
        return res.status(400).json({
          success: false,
          message: 'Logs must be an array'
        });
      }

      // Get log directory from environment variable
      const logDir = process.env.FE_LOG_DIR || './logs';
      
      // Create log directory if it doesn't exist
      await fs.mkdir(logDir, { recursive: true });
      
      // Create log file name based on current date
      const date = new Date().toISOString().split('T')[0];
      const logFile = path.join(logDir, `frontend-${date}.log`);
      
      // Format all log entries
      const logEntries = logs.map(formatLogEntry).join('');
      
      // Rotate and write logs
      await rotateLogFile(logFile, logEntries);
      
      res.status(200).json({
        success: true,
        message: `Successfully wrote ${logs.length} log entries`
      });
    } catch (error) {
      console.error('Error writing batch logs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to write batch log entries'
      });
    }
  },

  // Utility endpoint to get the latest logs
  async getLatestLogs(req, res) {
    try {
      const logDir = process.env.FE_LOG_DIR || './logs';
      const date = new Date().toISOString().split('T')[0];
      const logFile = path.join(logDir, `frontend-${date}.log`);

      let content = '';
      try {
        content = await fs.readFile(logFile, 'utf8');
      } catch (err) {
        // File doesn't exist yet
      }

      res.status(200).json({
        success: true,
        data: content.split('\n').filter(line => line.trim())
      });
    } catch (error) {
      console.error('Error reading logs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to read logs'
      });
    }
  }
};

module.exports = logController;