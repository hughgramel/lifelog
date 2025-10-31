const inquirer = require('inquirer');
const chalk = require('chalk');
const dayjs = require('dayjs');
const { getTasksForDate, bulkDeleteTasks } = require('../utils/storage');

async function bulkDeleteCommand() {
  const today = dayjs().format('YYYY-MM-DD');
  const tasks = getTasksForDate(today);

  if (tasks.length === 0) {
    console.log(chalk.yellow('\nNo tasks for today to delete!\n'));
    return;
  }

  console.log(chalk.blue.bold('\n📋 Select tasks to delete\n'));

  // Display all tasks
  tasks.forEach((task, index) => {
    const status = task.completed ? chalk.green('✅') : chalk.gray('⬜');
    const taskName = task.completed ? chalk.gray.strikethrough(task.name) : chalk.white(task.name);
    console.log(`${status} ${index + 1}. ${taskName}`);
  });
  console.log();

  const { deleteAll } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'deleteAll',
      message: 'Do you want to delete ALL tasks?',
      default: false
    }
  ]);

  if (deleteAll) {
    const taskIds = tasks.map(t => t.id);
    const deletedCount = bulkDeleteTasks(taskIds);
    console.log(chalk.green(`\n✅ Deleted ${deletedCount} tasks\n`));
    return;
  }

  const { selectedIndices } = await inquirer.prompt([
    {
      type: 'input',
      name: 'selectedIndices',
      message: 'Enter task numbers to delete (comma-separated, e.g., 1,3,5):',
      validate: (input) => {
        if (!input || input.trim() === '') {
          return 'Please enter at least one task number';
        }
        const indices = input.split(',').map(s => s.trim());
        const invalid = indices.some(idx => {
          const num = parseInt(idx);
          return isNaN(num) || num < 1 || num > tasks.length;
        });
        if (invalid) {
          return `Please enter valid task numbers between 1 and ${tasks.length}`;
        }
        return true;
      }
    }
  ]);

  const indices = selectedIndices.split(',').map(s => parseInt(s.trim()) - 1);
  const taskIdsToDelete = indices.map(idx => tasks[idx].id);

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Delete ${taskIdsToDelete.length} task(s)?`,
      default: false
    }
  ]);

  if (confirm) {
    const deletedCount = bulkDeleteTasks(taskIdsToDelete);
    console.log(chalk.green(`\n✅ Deleted ${deletedCount} tasks\n`));

    // Show remaining tasks
    const remainingTasks = getTasksForDate(today);
    if (remainingTasks.length > 0) {
      console.log(chalk.cyan('Remaining tasks:'));
      remainingTasks.forEach((task, index) => {
        const status = task.completed ? chalk.green('✅') : chalk.gray('⬜');
        const taskName = task.completed ? chalk.gray.strikethrough(task.name) : chalk.white(task.name);
        console.log(`${status} ${index + 1}. ${taskName}`);
      });
      console.log();
    } else {
      console.log(chalk.gray('No tasks remaining.\n'));
    }
  } else {
    console.log(chalk.yellow('\nDeletion cancelled.\n'));
  }
}

module.exports = bulkDeleteCommand;
