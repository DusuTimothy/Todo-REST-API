const { z } = require("zod");

const createTodoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),
  description: z
    .string()
    .trim()
    .max(1000, "Description must be at most 1000 characters")
    .optional()
    .default(""),
  completed: z.boolean().optional().default(false),
});

const updateTodoSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title cannot be empty")
      .max(200, "Title must be at most 200 characters")
      .optional(),
    description: z
      .string()
      .trim()
      .max(1000, "Description must be at most 1000 characters")
      .optional(),
    completed: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.completed !== undefined,
    { message: "At least one field must be provided for update" }
  );

const todoQuerySchema = z.object({
  search: z.string().trim().optional(),
  completed: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => (val === undefined ? undefined : val === "true")),
});

const todoIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "Todo id must be a positive integer")
    .transform((val) => Number(val)),
});

module.exports = {
  createTodoSchema,
  updateTodoSchema,
  todoQuerySchema,
  todoIdSchema,
};
