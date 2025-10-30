#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const logCommand = require('./commands/log');
const startCommand = require('./commands/start');
const finishCommand = require('./commands/finish');
const createCommand = require('./commands/create');
const bulkCommand = require('./commands/bulk');
const completeCommand = require('./commands/complete');
const tasksCommand = require('./commands/tasks');
const historyCommand = require('./commands/history');
const dashboardCommand = require('./commands/dashboard');
const syncCommand = require('./commands/sync');

const program = new Command();

program
  .name('log')
  .description('A CLI tool for logging how your life is going')
  .version('1.0.0');

// Default command - show dashboard
program
  .action(() => {
    dashboardCommand();
  });

// Start command (morning)
program
  .command('start')
  .description('Start your day with morning logging (sleep, gratitude, goals)')
  .action(async () => {
    try {
      await startCommand();
    } catch (error) {
      if (error.isTtyError) {
        console.log(chalk.red('Prompt couldn\'t be rendered in the current environment'));
      } else {
        console.log(chalk.red('Error:', error.message));
      }
    }
  });

// Finish command (evening)
program
  .command('finish')
  .description('Finish your day with evening logging (rating, productivity, overview)')
  .action(async () => {
    try {
      await finishCommand();
    } catch (error) {
      if (error.isTtyError) {
        console.log(chalk.red('Prompt couldn\'t be rendered in the current environment'));
      } else {
        console.log(chalk.red('Error:', error.message));
      }
    }
  });

// Log command (legacy - kept for backwards compatibility)
program
  .command('log')
  .description('Quick log your day (use "start" and "finish" for full experience)')
  .action(async () => {
    try {
      await logCommand();
    } catch (error) {
      if (error.isTtyError) {
        console.log(chalk.red('Prompt couldn\'t be rendered in the current environment'));
      } else {
        console.log(chalk.red('Error:', error.message));
      }
    }
  });

// Create task command
program
  .command('create <taskName...>')
  .description('Create a new task for today')
  .action((taskNameArray) => {
    const taskName = taskNameArray.join(' ');
    createCommand(taskName);
  });

// Bulk create tasks command
program
  .command('bulk')
  .description('Create multiple tasks (enter tasks one per line, Ctrl+C to finish)')
  .action(async () => {
    await bulkCommand();
  });

// Complete task command
program
  .command('complete <taskNumber>')
  .description('Mark a task as complete by its number')
  .action((taskNumber) => {
    completeCommand(taskNumber);
  });

// Tasks command
program
  .command('tasks')
  .description('Show all tasks for today')
  .action(() => {
    tasksCommand();
  });

// History command
program
  .command('history')
  .description('View your logs by date range (today, yesterday, week, month, etc.)')
  .action(async () => {
    try {
      await historyCommand();
    } catch (error) {
      if (error.isTtyError) {
        console.log(chalk.red('Prompt couldn\'t be rendered in the current environment'));
      } else {
        console.log(chalk.red('Error:', error.message));
      }
    }
  });

// Sync command
program
  .command('sync [action]')
  .description('Manage git sync for overview file (setup, now, or status)')
  .action(async (action) => {
    try {
      await syncCommand(action);
    } catch (error) {
      if (error.isTtyError) {
        console.log(chalk.red('Prompt couldn\'t be rendered in the current environment'));
      } else {
        console.log(chalk.red('Error:', error.message));
      }
    }
  });

// Parse arguments
program.parse(process.argv);
