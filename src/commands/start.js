const inquirer = require('inquirer');
const chalk = require('chalk');
const dayjs = require('dayjs');
const { getLogForDate, updateLog, generateOverview, rolloverTasks } = require('../utils/storage');
const { syncToGit, readGitConfig } = require('../utils/gitSync');

async function startCommand() {
  // Automatically rollover uncompleted tasks from previous days
  const rolledOver = rolloverTasks();
  if (rolledOver > 0) {
    console.log(chalk.yellow(`\n🔄 ${rolledOver} uncompleted task(s) rolled over to today`));
  }

  const today = dayjs().format('YYYY-MM-DD');

  // Check if already started today
  const existingLog = getLogForDate(today);
  if (existingLog && existingLog.morningEntry) {
    console.log(chalk.yellow('\nYou already started today! Here\'s your morning entry:\n'));
    displayMorningEntry(existingLog.morningEntry, today);

    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: 'Do you want to overwrite this morning\'s entry?',
        default: false
      }
    ]);

    if (!overwrite) {
      return;
    }
  }

  console.log(chalk.blue.bold('\n🌅 Good Morning! Let\'s start your day\n'));

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'sleepQuality',
      message: 'How did you sleep last night?',
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
      name: 'gratefulFor',
      message: 'What are you grateful for today? (one sentence)',
      validate: (input) => {
        if (!input || input.trim() === '') {
          return 'Please enter something you\'re grateful for';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'goals',
      message: 'What do you want to accomplish today? (separate with commas)',
      validate: (input) => {
        if (!input || input.trim() === '') {
          return 'Please enter at least one goal';
        }
        return true;
      }
    }
  ]);

  const goals = answers.goals.split(',').map(g => g.trim()).filter(g => g.length > 0);

  const morningEntry = {
    sleepQuality: answers.sleepQuality,
    gratefulFor: answers.gratefulFor,
    goals: goals,
    timestamp: new Date().toISOString()
  };

  updateLog(today, { morningEntry });
  generateOverview();

  // Auto-sync if configured
  const gitConfig = readGitConfig();
  if (gitConfig && gitConfig.enabled && gitConfig.autoSync) {
    const syncResult = syncToGit();
    if (syncResult.success) {
      console.log(chalk.gray(`🔄 ${syncResult.message}`));
    }
  }

  console.log(chalk.green.bold('\n✅ Morning entry saved!\n'));
  console.log(chalk.cyan(`📅 ${dayjs(today).format('dddd, MMMM D, YYYY')}`));
  console.log(chalk.cyan(`😴 Sleep: ${getSleepLabel(answers.sleepQuality)}`));
  console.log(chalk.cyan(`🙏 Grateful For: ${answers.gratefulFor}`));
  console.log(chalk.cyan('\n🎯 Today\'s Goals:'));
  goals.forEach((goal, i) => {
    console.log(chalk.gray(`  ${i + 1}. ${goal}`));
  });
  console.log(chalk.blue('\n💪 Have a great day! Use "log create <task>" to add tasks.\n'));
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

function displayMorningEntry(entry, date) {
  console.log(chalk.cyan(`📅 ${dayjs(date).format('dddd, MMMM D, YYYY')}`));
  console.log(chalk.cyan(`😴 Sleep: ${getSleepLabel(entry.sleepQuality)}`));
  console.log(chalk.cyan(`🙏 Grateful For: ${entry.gratefulFor}`));
  if (entry.goals && entry.goals.length > 0) {
    console.log(chalk.cyan('\n🎯 Today\'s Goals:'));
    entry.goals.forEach((goal, i) => {
      console.log(chalk.gray(`  ${i + 1}. ${goal}`));
    });
  }
  console.log();
}

module.exports = startCommand;
