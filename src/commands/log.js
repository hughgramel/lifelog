const inquirer = require('inquirer');
const chalk = require('chalk');
const dayjs = require('dayjs');
const { addLog, getCompletedTasksCount, getLogForDate } = require('../utils/storage');

async function logCommand() {
  const today = dayjs().format('YYYY-MM-DD');

  // Check if already logged today
  const existingLog = getLogForDate(today);
  if (existingLog) {
    console.log(chalk.yellow('\nYou already logged today! Here\'s your entry:\n'));
    displayLog(existingLog);

    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: 'Do you want to overwrite today\'s log?',
        default: false
      }
    ]);

    if (!overwrite) {
      return;
    }
  }

  console.log(chalk.blue.bold('\n📝 Daily Life Log\n'));

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'sleepQuality',
      message: 'How well did you sleep?',
      choices: [
        { name: '😴 Excellent - Fully rested', value: 5 },
        { name: '😊 Good - Woke up refreshed', value: 4 },
        { name: '😐 Okay - Decent sleep', value: 3 },
        { name: '😕 Poor - Not well rested', value: 2 },
        { name: '😩 Terrible - Barely slept', value: 1 }
      ]
    },
    {
      type: 'input',
      name: 'dayRating',
      message: 'How would you rate your day? (1-10)',
      validate: (input) => {
        const num = parseInt(input);
        if (isNaN(num) || num < 1 || num > 10) {
          return 'Please enter a number between 1 and 10';
        }
        return true;
      }
    },
    {
      type: 'list',
      name: 'productivity',
      message: 'How productive were you today?',
      choices: [
        { name: '🚀 Very productive', value: 5 },
        { name: '✅ Productive', value: 4 },
        { name: '😊 Moderately productive', value: 3 },
        { name: '😕 Slightly productive', value: 2 },
        { name: '😞 Not productive', value: 1 }
      ]
    },
    {
      type: 'input',
      name: 'notes',
      message: 'Any notes about today? (optional)',
      default: ''
    }
  ]);

  const completedTasks = getCompletedTasksCount(today);

  const logEntry = {
    date: today,
    sleepQuality: answers.sleepQuality,
    dayRating: parseInt(answers.dayRating),
    productivity: answers.productivity,
    notes: answers.notes,
    tasksCompleted: completedTasks
  };

  addLog(logEntry);

  console.log(chalk.green.bold('\n✅ Log entry saved!\n'));
  console.log(chalk.cyan(`📅 Date: ${dayjs(today).format('MMM D, YYYY')}`));
  console.log(chalk.cyan(`😴 Sleep Quality: ${getSleepLabel(answers.sleepQuality)}`));
  console.log(chalk.cyan(`⭐ Day Rating: ${answers.dayRating}/10`));
  console.log(chalk.cyan(`🎯 Productivity: ${getProductivityLabel(answers.productivity)}`));
  console.log(chalk.cyan(`✅ Tasks Completed: ${completedTasks}`));
  if (answers.notes) {
    console.log(chalk.cyan(`📝 Notes: ${answers.notes}`));
  }
  console.log();
}

function getSleepLabel(value) {
  const labels = {
    5: 'Excellent',
    4: 'Good',
    3: 'Okay',
    2: 'Poor',
    1: 'Terrible'
  };
  return labels[value] || 'Unknown';
}

function getProductivityLabel(value) {
  const labels = {
    5: 'Very productive',
    4: 'Productive',
    3: 'Moderately productive',
    2: 'Slightly productive',
    1: 'Not productive'
  };
  return labels[value] || 'Unknown';
}

function displayLog(log) {
  console.log(chalk.cyan(`📅 Date: ${dayjs(log.date).format('MMM D, YYYY')}`));
  console.log(chalk.cyan(`😴 Sleep Quality: ${getSleepLabel(log.sleepQuality)}`));
  console.log(chalk.cyan(`⭐ Day Rating: ${log.dayRating}/10`));
  console.log(chalk.cyan(`🎯 Productivity: ${getProductivityLabel(log.productivity)}`));
  console.log(chalk.cyan(`✅ Tasks Completed: ${log.tasksCompleted}`));
  if (log.notes) {
    console.log(chalk.cyan(`📝 Notes: ${log.notes}`));
  }
  console.log();
}

module.exports = logCommand;
