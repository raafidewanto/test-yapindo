const { z } = require('zod');

const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Task title is required')
    .max(255),

  description: z
    .string()
    .optional()
    .nullable(),

  status: z
    .enum(['todo', 'in_progress', 'done'])
    .default('todo'),

  priority: z
    .enum(['low', 'medium', 'high'])
    .default('medium'),

  assigneeId: z
    .number()
    .int()
    .positive(),
});

const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1)
    .max(255)
    .optional(),

  description: z
    .string()
    .optional()
    .nullable(),

  status: z
    .enum(['todo', 'in_progress', 'done'])
    .optional(),

  priority: z
    .enum(['low', 'medium', 'high'])
    .optional(),

  assigneeId: z
    .number()
    .int()
    .positive()
    .optional(),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
};