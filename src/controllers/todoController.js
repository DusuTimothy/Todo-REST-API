const { Todos } = require("../../models");
const { Op } = require("sequelize");

const createTodo = async (req, res, next) => {
  try {
    const { title, description = "", completed = false } = req.body;
    const userId = req.user.id;

    const duplicate = await Todos.findOne({
      where: {
        userId,
        title: {
          [Op.iLike]: title,
        },
      },
    });

    if (duplicate) {
      return res.status(409).json({
        status: "error",
        message: "A todo with this title already exists",
      });
    }

    const todo = await Todos.create({
      title,
      description,
      completed,
      userId,
    });

    return res.status(201).json({
      status: "success",
      message: "Todo created successfully",
      data: todo,
    });
  } catch (error) {
    next(error);
  }
};

const getTodos = async (req, res, next) => {
  try {
    const { search, completed } = req.validatedQuery || {};
    const where = { userId: req.user.id };

    if (typeof completed === "boolean") where.completed = completed;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const results = await Todos.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      status: "success",
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

const findOwnedTodo = async (id, userId) => {
  const todo = await Todos.findOne({ where: { id, userId } });
  if (!todo) {
    return { error: { statusCode: 404, message: "Todo not found" } };
  }
  return { todo };
};

const getTodoById = async (req, res, next) => {
  try {
    const { id } = req.validatedParams;
    const { todo, error } = await findOwnedTodo(id, req.user.id);

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

const updateTodo = async (req, res, next) => {
  try {
    const { id } = req.validatedParams;
    const { todo, error } = await findOwnedTodo(id, req.user.id);

    if (error) {
      return res.status(error.statusCode).json({
        status: "error",
        message: error.message,
      });
    }

    await todo.update(req.body);

    return res.status(200).json({
      status: "success",
      message: "Todo updated successfully",
      data: todo,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTodo = async (req, res, next) => {
  try {
    const { id } = req.validatedParams;
    const { todo, error } = await findOwnedTodo(id, req.user.id);

    if (error) {
      return res.status(error.statusCode).json({
        status: "error",
        message: error.message,
      });
    }

    await todo.destroy();

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
