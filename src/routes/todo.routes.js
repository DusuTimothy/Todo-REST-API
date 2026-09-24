const express = require("express");
const router = express.Router();

const {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
} = require("../controllers/todoController");
const { authenticate } = require("../middleware/authentication");
const { validate } = require("../middleware/validate");
const {
  createTodoSchema,
  updateTodoSchema,
  todoQuerySchema,
  todoIdSchema,
} = require("../validators/todo.validator");

router.use(authenticate);

router.post("/", validate(createTodoSchema), createTodo);
router.get("/", validate(todoQuerySchema, "query"), getTodos);
router.get("/:id", validate(todoIdSchema, "params"), getTodoById);
router.put(
  "/:id",
  validate(todoIdSchema, "params"),
  validate(updateTodoSchema),
  updateTodo
);
router.delete("/:id", validate(todoIdSchema, "params"), deleteTodo);

module.exports = router;
