const users = [];
const todos = [];

let nextUserId = 1;
let nextTodoId = 1;

const getNextUserId = () => nextUserId++;
const getNextTodoId = () => nextTodoId++;

module.exports = {
  users,
  todos,
  getNextUserId,
  getNextTodoId,
};
