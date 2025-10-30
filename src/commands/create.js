const chalk = require('chalk');
const { addTask } = require('../utils/storage');

function createCommand(taskName) {
  if (!taskName || taskName.trim() === '') {
    console.log(chalk.red('\n❌ Please provide a task name!'));
    console.log(chalk.gray('Usage: log create "task name"\n'));
    return;
  }

  const task = addTask(taskName.trim());
  console.log(chalk.green('\n✅ Task created successfully!'));
  console.log(chalk.cyan(`📝 ${task.name}\n`));
}

module.exports = createCommand;
