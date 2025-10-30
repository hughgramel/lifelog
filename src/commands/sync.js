const chalk = require('chalk');
const inquirer = require('inquirer');
const { setupGitSync, syncToGit, readGitConfig } = require('../utils/gitSync');

async function syncCommand(action) {
  if (action === 'setup') {
    await setupSync();
  } else if (action === 'now') {
    performSync();
  } else {
    showSyncStatus();
  }
}

async function setupSync() {
  const result = await setupGitSync(inquirer);
  if (result.success) {
    console.log(chalk.green(`\n✅ ${result.message}\n`));

    const config = readGitConfig();
    if (config && config.enabled) {
      console.log(chalk.cyan('Git sync is now enabled!'));
      console.log(chalk.gray(`Repository: ${config.repoPath}`));
      if (config.remoteName) {
        console.log(chalk.gray(`Remote: ${config.remoteName}/${config.branch}`));
        console.log(chalk.gray(`Auto-sync: ${config.autoSync ? 'Yes' : 'No'}`));
      }

      const { syncNow } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'syncNow',
          message: 'Would you like to sync now?',
          default: true
        }
      ]);

      if (syncNow) {
        performSync();
      }
    }
  } else {
    console.log(chalk.red(`\n❌ ${result.message}\n`));
  }
}

function performSync() {
  console.log(chalk.blue('\n🔄 Syncing overview to git...\n'));
  const result = syncToGit();

  if (result.success) {
    console.log(chalk.green(`✅ ${result.message}\n`));
  } else {
    console.log(chalk.red(`❌ ${result.message}\n`));
  }
}

function showSyncStatus() {
  const config = readGitConfig();

  console.log(chalk.blue.bold('\n📦 Git Sync Status\n'));

  if (!config || !config.enabled) {
    console.log(chalk.yellow('Git sync is not configured.'));
    console.log(chalk.gray('Run: log sync setup\n'));
    return;
  }

  console.log(chalk.green('✅ Git sync is enabled'));
  console.log(chalk.cyan(`📁 Repository: ${config.repoPath}`));

  if (config.remoteName) {
    console.log(chalk.cyan(`🌐 Remote: ${config.remoteName}/${config.branch}`));
    console.log(chalk.cyan(`🔄 Auto-sync: ${config.autoSync ? 'Enabled' : 'Disabled'}`));
  } else {
    console.log(chalk.gray('No remote configured (local commits only)'));
  }

  console.log(chalk.gray('\nCommands:'));
  console.log(chalk.gray('  log sync setup - Reconfigure git sync'));
  console.log(chalk.gray('  log sync now   - Sync immediately\n'));
}

module.exports = syncCommand;
