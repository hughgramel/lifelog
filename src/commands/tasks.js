const chalk = require('chalk');
const dayjs = require('dayjs');
const { getTasksForDate } = require('../utils/storage');

function tasksCommand() {
  const today = dayjs().format('YYYY-MM-DD');
  const tasks = getTasksForDate(today);

  if (tasks.length === 0) {
    console.log(chalk.yellow('\n📋 No tasks for today yet!'));
    console.log(chalk.gray('Create a task with: log create "task name"\n'));
    return;
  }

  console.log(chalk.blue.bold(`\n📋 Tasks for ${dayjs(today).format('MMM D, YYYY')}\n`));

  tasks.forEach((task, index) => {
    const status = task.completed ? chalk.green('✅') : chalk.gray('⬜');
    const taskName = task.completed ? chalk.gray.strikethrough(task.name) : chalk.white(task.name);
    console.log(`${status} ${index + 1}. ${taskName}`);
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const remainingCount = tasks.length - completedCount;

  console.log(chalk.cyan(`\n✅ Completed: ${completedCount}/${tasks.length}`));

  if (remainingCount > 0) {
    console.log(chalk.gray(`\nTo complete a task: log complete <number>`));
    console.log(chalk.gray(`Example: log complete 1\n`));
  } else {
    console.log(chalk.green.bold('\n🎉 All tasks completed!\n'));
  }
}

module.exports = tasksCommand;
