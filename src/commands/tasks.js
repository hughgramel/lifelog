const chalk = require('chalk');
const dayjs = require('dayjs');
const inquirer = require('inquirer');
const { getTasksForDate, completeTask } = require('../utils/storage');

async function tasksCommand() {
  const today = dayjs().format('YYYY-MM-DD');
  const tasks = getTasksForDate(today);

  if (tasks.length === 0) {
    console.log(chalk.yellow('\n📋 No tasks for today yet!'));
    console.log(chalk.gray('Create a task with: ll create "task name"\n'));
    return;
  }

  console.log(chalk.blue.bold(`\n📋 Tasks for ${dayjs(today).format('MMM D, YYYY')}\n`));

  tasks.forEach((task, index) => {
    const status = task.completed ? chalk.green('✅') : chalk.gray('⬜');
    const taskName = task.completed ? chalk.gray.strikethrough(task.name) : chalk.white(task.name);
    console.log(`${status} ${index + 1}. ${taskName}`);
  });

  const completedCount = tasks.filter(t => t.completed).length;
  console.log(chalk.cyan(`\nCompleted: ${completedCount}/${tasks.length}`));

  // Ask if user wants to mark any as complete
  const incompleteTasks = tasks.filter(t => !t.completed);
  if (incompleteTasks.length > 0) {
    const { action } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'action',
        message: 'Would you like to mark a task as complete?',
        default: false
      }
    ]);

    if (action) {
      const { taskId } = await inquirer.prompt([
        {
          type: 'list',
          name: 'taskId',
          message: 'Select a task to mark as complete:',
          choices: incompleteTasks.map(t => ({
            name: t.name,
            value: t.id
          }))
        }
      ]);

      completeTask(taskId);
      console.log(chalk.green('\n✅ Task marked as complete!\n'));
    }
  }
  console.log();
}

module.exports = tasksCommand;
