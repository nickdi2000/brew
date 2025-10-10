module.exports = {
  async createLog(req, res) {
    return res.status(410).json({
      success: false,
      message: 'Frontend logging has been disabled.'
    });
  },

  async createBatchLogs(req, res) {
    return res.status(410).json({
      success: false,
      message: 'Frontend logging has been disabled.'
    });
  },

  async getLatestLogs(req, res) {
    return res.status(410).json({
      success: false,
      message: 'Frontend logging has been disabled.'
    });
  }
};