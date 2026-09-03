const sequelize = require('../config/database');

const { generateCommands } = require('./gemini.service');
const { aiCommandSchema } = require('../validators/ai-command.validator');

const {
    createTask,
    updateTask,
    deleteTask,
} = require('./task.service');

const { createAuditLog } = require('./audit-log.service');

const executeCommand = async (userCommand, userId) => {
    let validatedCommands;

    try {
        // Generate command dari Gemini
        const rawResponse = await generateCommands(userCommand);

        // Parse JSON
        let parsedResponse;

        try {
            parsedResponse = JSON.parse(rawResponse);
        } catch (error) {
            throw Object.assign(
                new Error('AI returned invalid JSON'),
                { status: 400 }
            );
        }

        // Validasi hasil Gemini
        validatedCommands = aiCommandSchema.parse(
            parsedResponse
        );

        // Tidak ada command
        if (validatedCommands.commands.length === 0) {
            throw Object.assign(
                new Error(
                    'AI could not understand the task management command'
                ),
                { status: 400 }
            );
        }
    } catch (error) {
        // AI gagal sebelum transaction database
        await createAuditLog({
            userId,
            action: 'AI_COMMAND',
            requestPayload: {
                command: userCommand,
            },
            responsePayload: null,
            status: 'failed',
            failedReason: error.message,
        });

        throw error;
    }

    const transaction = await sequelize.transaction();

    try {
        const results = [];

        for (const command of validatedCommands.commands) {
            let result;

            switch (command.action) {
                case 'create_task':
                    result = await createTask(
                        command.data,
                        transaction
                    );
                    break;

                case 'update_task':
                    result = await updateTask(
                        command.taskId,
                        command.data,
                        transaction
                    );
                    break;

                case 'delete_task':
                    result = await deleteTask(
                        command.taskId,
                        transaction
                    );
                    break;

                default:
                    throw new Error(
                        `Unsupported action: ${command.action}`
                    );
            }

            results.push({
                action: command.action,
                data: result,
            });
        }

        // Semua command berhasil
        await transaction.commit();

        const responsePayload = {
            commands: results,
        };

        // AuditLog dibuat setelah transaction berhasil
        await createAuditLog({
            userId,
            action: 'AI_COMMAND',
            requestPayload: {
                command: userCommand,
            },
            responsePayload,
            status: 'success',
        });

        return responsePayload;
    } catch (error) {
        // Salah satu command gagal
        if (!transaction.finished) {
            await transaction.rollback();
        }

        // AuditLog tetap dibuat meskipun transaction rollback
        await createAuditLog({
            userId,
            action: 'AI_COMMAND',
            requestPayload: {
                command: userCommand,
            },
            responsePayload: null,
            status: 'failed',
            failedReason: error.message,
        });

        throw error;
    }
};
module.exports = {
    executeCommand,
};