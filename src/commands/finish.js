const inquirer = require('inquirer');
const chalk = require('chalk');
const dayjs = require('dayjs');
const { getLogForDate, updateLog, getCompletedTasksCount, generateOverview } = require('../utils/storage');
const { syncToGit, readGitConfig } = require('../utils/gitSync');

async function finishCommand() {
  const today = dayjs().format('YYYY-MM-DD');

  // Check if already finished today
  const existingLog = getLogForDate(today);
  if (existingLog && existingLog.eveningEntry) {
    console.log(chalk.yellow('\nYou already finished today! Here\'s your evening entry:\n'));
    displayEveningEntry(existingLog.eveningEntry, today);

    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: 'Do you want to overwrite this evening\'s entry?',
        default: false
      }
    ]);

    if (!overwrite) {
      return;
    }
  }

  console.log(chalk.blue.bold('\n🌙 Time to wrap up your day\n'));

  // Show morning goals if they exist
  if (existingLog && existingLog.morningEntry && existingLog.morningEntry.goals) {
    console.log(chalk.cyan('🎯 Your goals for today were:'));
    existingLog.morningEntry.goals.forEach((goal, i) => {
      console.log(chalk.gray(`  ${i + 1}. ${goal}`));
    });
    console.log();
  }

  const answers = await inquirer.prompt([
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
      type: 'editor',
      name: 'dayOverview',
      message: 'Write an overview of your day (1-2 paragraphs). Press Enter to open your editor.',
      validate: (input) => {
        if (!input || input.trim() === '') {
          return 'Please write at least a brief overview of your day';
        }
        return true;
      }
    }
  ]);

  const completedTasks = getCompletedTasksCount(today);

  const eveningEntry = {
    dayRating: parseInt(answers.dayRating),
    productivity: answers.productivity,
    dayOverview: answers.dayOverview.trim(),
    tasksCompleted: completedTasks,
    timestamp: new Date().toISOString()
  };

  updateLog(today, { eveningEntry });
  generateOverview();

  // Auto-sync if configured
  const gitConfig = readGitConfig();
  if (gitConfig && gitConfig.enabled && gitConfig.autoSync) {
    const syncResult = syncToGit();
    if (syncResult.success) {
      console.log(chalk.gray(`🔄 ${syncResult.message}`));
    }
  }

  console.log(chalk.green.bold('\n✅ Evening entry saved!\n'));
  console.log(chalk.cyan(`📅 ${dayjs(today).format('dddd, MMMM D, YYYY')}`));
  console.log(chalk.cyan(`⭐ Day Rating: ${answers.dayRating}/10`));
  console.log(chalk.cyan(`🎯 Productivity: ${getProductivityLabel(answers.productivity)}`));
  console.log(chalk.cyan(`✅ Tasks Completed: ${completedTasks}`));
  console.log(chalk.cyan('\n📝 Day Overview:'));
  console.log(chalk.gray(answers.dayOverview));
  console.log(chalk.blue('\n😴 Good night! Rest well for tomorrow.\n'));
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

function displayEveningEntry(entry, date) {
  console.log(chalk.cyan(`📅 ${dayjs(date).format('dddd, MMMM D, YYYY')}`));
  console.log(chalk.cyan(`⭐ Day Rating: ${entry.dayRating}/10`));
  console.log(chalk.cyan(`🎯 Productivity: ${getProductivityLabel(entry.productivity)}`));
  console.log(chalk.cyan(`✅ Tasks Completed: ${entry.tasksCompleted || 0}`));
  if (entry.dayOverview) {
    console.log(chalk.cyan('\n📝 Day Overview:'));
    console.log(chalk.gray(entry.dayOverview));
  }
  console.log();
}

module.exports = finishCommand;
