const aiCommandService = require('../services/ai-command.service');

const executeCommand = async (req, res, next) => {
  try {
    const { command } = req.body;

    if (
      typeof command !== 'string' ||
      command.trim().length === 0
    ) {
      const error = new Error('Command is required');
      error.status = 400;
      throw error;
    }

    const result = await aiCommandService.executeCommand(
      command,
      req.user.id
    );

    res.status(200).json({
      message: 'AI command executed successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  executeCommand,
};