const chalk = require('chalk');
const dayjs = require('dayjs');
const { getLogForDate, getTasksForDate, readLogs } = require('../utils/storage');

function dashboardCommand() {
  const today = dayjs();
  const todayStr = today.format('YYYY-MM-DD');

  console.log(chalk.blue.bold('\n╔════════════════════════════════════════╗'));
  console.log(chalk.blue.bold('║          LIFELOG DASHBOARD             ║'));
  console.log(chalk.blue.bold('╚════════════════════════════════════════╝\n'));

  console.log(chalk.cyan(`📅 ${today.format('dddd, MMMM D, YYYY')}\n`));

  // Today's log
  const todayLog = getLogForDate(todayStr);
  if (todayLog) {
    console.log(chalk.green('✅ Today\'s Log'));
    console.log(chalk.gray('  ⭐ Day Rating: ' + todayLog.dayRating + '/10'));
    console.log(chalk.gray('  😴 Sleep: ' + getSleepLabel(todayLog.sleepQuality)));
    console.log(chalk.gray('  🎯 Productivity: ' + getProductivityLabel(todayLog.productivity)));
  } else {
    console.log(chalk.yellow('📝 No log entry for today yet'));
    console.log(chalk.gray('  Run: ll log'));
  }
  console.log();

  // Today's tasks
  const tasks = getTasksForDate(todayStr);
  const completedTasks = tasks.filter(t => t.completed).length;

  console.log(chalk.cyan('📋 Today\'s Tasks'));
  if (tasks.length === 0) {
    console.log(chalk.gray('  No tasks yet'));
    console.log(chalk.gray('  Run: ll create "task name"'));
  } else {
    console.log(chalk.gray(`  Total: ${tasks.length} | Completed: ${completedTasks}`));
    tasks.slice(0, 5).forEach(task => {
      const status = task.completed ? chalk.green('✅') : chalk.gray('⬜');
      const name = task.completed ? chalk.gray.strikethrough(task.name) : task.name;
      console.log(`  ${status} ${name}`);
    });
    if (tasks.length > 5) {
      console.log(chalk.gray(`  ... and ${tasks.length - 5} more`));
    }
    console.log(chalk.gray('  Run: ll tasks (to view all)'));
  }
  console.log();

  // Recent activity
  const allLogs = readLogs();
  const recentLogs = allLogs
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 7);

  if (recentLogs.length > 1) {
    console.log(chalk.cyan('📊 7-Day Trend'));

    const last7 = recentLogs.slice(0, 7);
    const avgRating = (last7.reduce((sum, log) => sum + log.dayRating, 0) / last7.length).toFixed(1);
    const avgProductivity = (last7.reduce((sum, log) => sum + log.productivity, 0) / last7.length).toFixed(1);

    console.log(chalk.gray(`  Average Rating: ${avgRating}/10`));
    console.log(chalk.gray(`  Average Productivity: ${avgProductivity}/5`));
    console.log(chalk.gray(`  Logged Days: ${last7.length}/7`));
    console.log(chalk.gray('  Run: ll history (for more details)'));
  }
  console.log();

  // Quick actions
  console.log(chalk.cyan('⚡ Quick Actions'));
  console.log(chalk.gray('  ll log          - Log today\'s entry'));
  console.log(chalk.gray('  ll create "..."  - Create a task'));
  console.log(chalk.gray('  ll tasks        - View tasks'));
  console.log(chalk.gray('  ll history      - View history'));
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

module.exports = dashboardCommand;
