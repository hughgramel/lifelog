const inquirer = require('inquirer');
const chalk = require('chalk');
const dayjs = require('dayjs');
const isoWeek = require('dayjs/plugin/isoWeek');
const { readLogs, getLogsByDateRange } = require('../utils/storage');

dayjs.extend(isoWeek);

async function historyCommand() {
  const { timeframe } = await inquirer.prompt([
    {
      type: 'list',
      name: 'timeframe',
      message: 'Select a timeframe to view:',
      choices: [
        { name: '📅 Today', value: 'today' },
        { name: '📆 Yesterday', value: 'yesterday' },
        { name: '📊 This Week', value: 'week' },
        { name: '📈 This Month', value: 'month' },
        { name: '📉 Last 7 Days', value: 'last7' },
        { name: '📋 Last 30 Days', value: 'last30' },
        { name: '📚 All Time', value: 'all' }
      ]
    }
  ]);

  let logs = [];
  let title = '';

  switch (timeframe) {
    case 'today':
      const today = dayjs();
      logs = getLogsByDateRange(today, today);
      title = 'Today';
      break;
    case 'yesterday':
      const yesterday = dayjs().subtract(1, 'day');
      logs = getLogsByDateRange(yesterday, yesterday);
      title = 'Yesterday';
      break;
    case 'week':
      const weekStart = dayjs().startOf('isoWeek');
      const weekEnd = dayjs().endOf('isoWeek');
      logs = getLogsByDateRange(weekStart, weekEnd);
      title = 'This Week';
      break;
    case 'month':
      const monthStart = dayjs().startOf('month');
      const monthEnd = dayjs().endOf('month');
      logs = getLogsByDateRange(monthStart, monthEnd);
      title = 'This Month';
      break;
    case 'last7':
      const last7Start = dayjs().subtract(6, 'day');
      const last7End = dayjs();
      logs = getLogsByDateRange(last7Start, last7End);
      title = 'Last 7 Days';
      break;
    case 'last30':
      const last30Start = dayjs().subtract(29, 'day');
      const last30End = dayjs();
      logs = getLogsByDateRange(last30Start, last30End);
      title = 'Last 30 Days';
      break;
    case 'all':
      logs = readLogs();
      title = 'All Time';
      break;
  }

  if (logs.length === 0) {
    console.log(chalk.yellow(`\n📭 No logs found for ${title}\n`));
    return;
  }

  // Display overview
  displayOverview(logs, title);

  // Ask if they want to see details
  const { showDetails } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'showDetails',
      message: 'Would you like to see detailed entries?',
      default: false
    }
  ]);

  if (showDetails) {
    displayDetailedLogs(logs);
  }
}

function displayOverview(logs, title) {
  console.log(chalk.blue.bold(`\n📊 Overview for ${title}\n`));

  const avgDayRating = (logs.reduce((sum, log) => sum + log.dayRating, 0) / logs.length).toFixed(1);
  const avgSleep = (logs.reduce((sum, log) => sum + log.sleepQuality, 0) / logs.length).toFixed(1);
  const avgProductivity = (logs.reduce((sum, log) => sum + log.productivity, 0) / logs.length).toFixed(1);
  const totalTasks = logs.reduce((sum, log) => sum + (log.tasksCompleted || 0), 0);

  console.log(chalk.cyan(`📊 Total Entries: ${logs.length}`));
  console.log(chalk.cyan(`⭐ Average Day Rating: ${avgDayRating}/10`));
  console.log(chalk.cyan(`😴 Average Sleep Quality: ${avgSleep}/5`));
  console.log(chalk.cyan(`🎯 Average Productivity: ${avgProductivity}/5`));
  console.log(chalk.cyan(`✅ Total Tasks Completed: ${totalTasks}`));

  // Find best and worst days
  const sortedByRating = [...logs].sort((a, b) => b.dayRating - a.dayRating);
  const bestDay = sortedByRating[0];
  const worstDay = sortedByRating[sortedByRating.length - 1];

  console.log(chalk.green(`\n🌟 Best Day: ${dayjs(bestDay.date).format('MMM D, YYYY')} (${bestDay.dayRating}/10)`));
  if (logs.length > 1) {
    console.log(chalk.red(`😔 Worst Day: ${dayjs(worstDay.date).format('MMM D, YYYY')} (${worstDay.dayRating}/10)`));
  }
  console.log();
}

function displayDetailedLogs(logs) {
  console.log(chalk.blue.bold('\n📝 Detailed Entries\n'));

  logs.sort((a, b) => new Date(b.date) - new Date(a.date));

  logs.forEach((log, index) => {
    console.log(chalk.yellow(`\n═══ ${dayjs(log.date).format('MMM D, YYYY (ddd)')} ═══`));
    console.log(chalk.cyan(`⭐ Day Rating: ${log.dayRating}/10`));
    console.log(chalk.cyan(`😴 Sleep: ${getSleepLabel(log.sleepQuality)}`));
    console.log(chalk.cyan(`🎯 Productivity: ${getProductivityLabel(log.productivity)}`));
    console.log(chalk.cyan(`✅ Tasks: ${log.tasksCompleted || 0}`));
    if (log.notes) {
      console.log(chalk.gray(`📝 ${log.notes}`));
    }
  });
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

module.exports = historyCommand;
