const chalk = require('chalk');
const dayjs = require('dayjs');
const { getTasksForDate, deleteTask } = require('../utils/storage');

function deleteCommand(taskNumber) {
  const today = dayjs().format('YYYY-MM-DD');
  const tasks = getTasksForDate(today);

  if (tasks.length === 0) {
    console.log(chalk.yellow('\nNo tasks for today to delete!\n'));
    return;
  }

  const index = parseInt(taskNumber) - 1;

  if (isNaN(index) || index < 0 || index >= tasks.length) {
    console.log(chalk.red(`\nInvalid task number. Please choose between 1 and ${tasks.length}\n`));
    return;
  }

  const taskToDelete = tasks[index];
  const deleted = deleteTask(taskToDelete.id);

  if (deleted) {
    console.log(chalk.green(`\n✅ Task deleted: "${taskToDelete.name}"\n`));
  } else {
    console.log(chalk.red('\nFailed to delete task.\n'));
  }
}

module.exports = deleteCommand;
