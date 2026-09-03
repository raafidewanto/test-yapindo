const { z } = require('zod');

const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(255),

  description: z
    .string()
    .optional()
    .nullable(),
});

const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name cannot be empty')
    .max(255)
    .optional(),

  description: z
    .string()
    .optional()
    .nullable(),
});

module.exports = {
  createProjectSchema,
  updateProjectSchema,
};