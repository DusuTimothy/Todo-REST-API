const { todos, getNextTodoId } = require("../database");

const createTodo = (req, res, next) => {
  try {
    const { title, description = "" } = req.body;
    const userId = req.user.id;

    const duplicate = todos.find(
      (todo) =>
        todo.userId === userId &&
        todo.title.toLowerCase() === title.toLowerCase()
    );

    if (duplicate) {
      return res.status(409).json({
        status: "error",
        message: "A todo with this title already exists",
      });
    }

    const now = new Date().toISOString();

    const todo = {
      id: getNextTodoId(),
      title,
      description,
      completed: false,
      userId,
      createdAt: now,
      updatedAt: now,
    };

    todos.push(todo);

    return res.status(201).json({
      status: "success",
      message: "Todo created successfully",
      data: todo,
    });
  } catch (error) {
    next(error);
  }
};

const getTodos = (req, res, next) => {
  try {
    const { search, completed } = req.validatedQuery || {};

    let results = todos.filter((todo) => todo.userId === req.user.id);

    if (typeof completed === "boolean") {
      results = results.filter((todo) => todo.completed === completed);
    }

    if (search) {
      const term = search.toLowerCase();
      results = results.filter(
        (todo) =>
          todo.title.toLowerCase().includes(term) ||
          (todo.description && todo.description.toLowerCase().includes(term))
      );
    }

    return res.status(200).json({
      status: "success",
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

const findOwnedTodo = (id, userId) => {
  const todo = todos.find((t) => t.id === id);
  if (!todo) {
    return { error: { statusCode: 404, message: "Todo not found" } };
  }
  if (todo.userId !== userId) {
    return {
      error: { statusCode: 403, message: "You do not have access to this todo" },
    };
  }
  return { todo };
};

const getTodoById = (req, res, next) => {
  try {
    const { id } = req.validatedParams;
    const { todo, error } = findOwnedTodo(id, req.user.id);

    if (error) {
      return res.status(error.statusCode).json({
        status: "error",
        message: error.message,
      });
    }

    return res.status(200).json({
      status: "success",
      data: todo,
    });
  } catch (error) {
    next(error);
  }
};

const updateTodo = (req, res, next) => {
  try {
    const { id } = req.validatedParams;
    const { todo, error } = findOwnedTodo(id, req.user.id);

    if (error) {
      return res.status(error.statusCode).json({
        status: "error",
        message: error.message,
      });
    }

    const { title, description, completed } = req.body;

    if (title !== undefined) todo.title = title;
    if (description !== undefined) todo.description = description;
    if (completed !== undefined) todo.completed = completed;
    todo.updatedAt = new Date().toISOString();

    return res.status(200).json({
      status: "success",
      message: "Todo updated successfully",
      data: todo,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTodo = (req, res, next) => {
  try {
    const { id } = req.validatedParams;
    const { todo, error } = findOwnedTodo(id, req.user.id);

    if (error) {
      return res.status(error.statusCode).json({
        status: "error",
        message: error.message,
      });
    }

    const index = todos.findIndex((t) => t.id === todo.id);
    todos.splice(index, 1);

    return res.status(200).json({
      status: "success",
      message: "Todo deleted successfully",
      data: todo,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
};
