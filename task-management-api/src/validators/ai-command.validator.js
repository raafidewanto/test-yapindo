const { z } = require('zod');

const createTaskCommandSchema = z.object({
    action: z.literal('create_task'),

    data: z.object({
        projectId: z.number().int().positive(),
        title: z.string().min(1).max(255),
        description: z.string().nullable().optional(),
        status: z
            .enum(['todo', 'in_progress', 'done'])
            .default('todo'),
        priority: z
            .enum(['low', 'medium', 'high'])
            .default('medium'),
        assigneeId: z.number().int().positive(),
    }),
});

const updateTaskCommandSchema = z.object({
    action: z.literal('update_task'),

    taskId: z.number().int().positive(),

    data: z.object({
        title: z.string().min(1).max(255).optional(),
        description: z.string().nullable().optional(),
        status: z
            .enum(['todo', 'in_progress', 'done'])
            .optional(),
        priority: z
            .enum(['low', 'medium', 'high'])
            .optional(),
        assigneeId: z.number().int().positive().optional(),
    }),
});

const deleteTaskCommandSchema = z.object({
    action: z.literal('delete_task'),

    taskId: z.number().int().positive(),
});

const aiCommandSchema = z.object({
    commands: z.array(
        z.discriminatedUnion('action', [
            createTaskCommandSchema,
            updateTaskCommandSchema,
            deleteTaskCommandSchema,
        ])
    ),
});

module.exports = {
    aiCommandSchema,
};