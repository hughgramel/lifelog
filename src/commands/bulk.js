const chalk = require('chalk');
const readline = require('readline');
const { addTask } = require('../utils/storage');

async function bulkCommand() {
  console.log(chalk.blue.bold('\n📝 Bulk Task Creation Mode\n'));
  console.log(chalk.gray('Enter tasks one per line. Press Ctrl+C or Ctrl+D when done.\n'));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.cyan('Task: ')
  });

  let taskCount = 0;

  rl.prompt();

  rl.on('line', (line) => {
    const taskName = line.trim();

    if (taskName.length > 0) {
      addTask(taskName);
      taskCount++;
      console.log(chalk.green(`  ✅ Added: ${taskName}`));
    }

    rl.prompt();
  });

  rl.on('close', () => {
    console.log(chalk.green.bold(`\n✅ Created ${taskCount} task${taskCount === 1 ? '' : 's'}!\n`));
    console.log(chalk.gray('Run "log tasks" to view all tasks\n'));
    process.exit(0);
  });
}

module.exports = bulkCommand;
