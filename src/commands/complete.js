const chalk = require('chalk');
const dayjs = require('dayjs');
const { getTasksForDate, completeTask } = require('../utils/storage');

function completeCommand(taskNumber) {
  const today = dayjs().format('YYYY-MM-DD');
  const tasks = getTasksForDate(today);

  if (tasks.length === 0) {
    console.log(chalk.yellow('\n📋 No tasks for today!'));
    console.log(chalk.gray('Create a task with: log create "task name"\n'));
    return;
  }

  // Parse task number
  const num = parseInt(taskNumber);
  if (isNaN(num) || num < 1 || num > tasks.length) {
    console.log(chalk.red(`\n❌ Invalid task number. Please choose 1-${tasks.length}\n`));
    console.log(chalk.cyan('Today\'s tasks:'));
    tasks.forEach((task, index) => {
      const status = task.completed ? chalk.green('✅') : chalk.gray('⬜');
      const taskName = task.completed ? chalk.gray.strikethrough(task.name) : chalk.white(task.name);
      console.log(`${status} ${index + 1}. ${taskName}`);
    });
    console.log();
    return;
  }

  const task = tasks[num - 1];

  if (task.completed) {
    console.log(chalk.yellow(`\n⚠️  Task #${num} is already completed!\n`));
    return;
  }

  completeTask(task.id);
  console.log(chalk.green(`\n✅ Completed task #${num}: ${task.name}\n`));

  // Show remaining tasks
  const updatedTasks = getTasksForDate(today);
  const remaining = updatedTasks.filter(t => !t.completed).length;
  const completed = updatedTasks.filter(t => t.completed).length;

  console.log(chalk.cyan(`Progress: ${completed}/${updatedTasks.length} tasks completed`));
  if (remaining > 0) {
    console.log(chalk.gray(`${remaining} task${remaining === 1 ? '' : 's'} remaining\n`));
  } else {
    console.log(chalk.green.bold('🎉 All tasks completed! Great job!\n'));
  }
}

module.exports = completeCommand;
