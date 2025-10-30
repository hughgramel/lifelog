const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { DATA_DIR, OVERVIEW_FILE } = require('./storage');

const CONFIG_FILE = path.join(DATA_DIR, 'git-config.json');

// Read git configuration
function readGitConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    return null;
  }
  try {
    const data = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

// Save git configuration
function saveGitConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
}

// Check if git is installed
function isGitInstalled() {
  try {
    execSync('git --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Initialize git repo in data directory
function initGitRepo(repoPath) {
  if (!isGitInstalled()) {
    throw new Error('Git is not installed on your system');
  }

  if (!fs.existsSync(repoPath)) {
    fs.mkdirSync(repoPath, { recursive: true });
  }

  // Check if already a git repo
  const gitDir = path.join(repoPath, '.git');
  if (!fs.existsSync(gitDir)) {
    execSync('git init', { cwd: repoPath });
  }

  // Create .gitignore if it doesn't exist
  const gitignorePath = path.join(repoPath, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, 'logs.json\ntasks.json\ngit-config.json\n', 'utf8');
  }

  return true;
}

// Sync overview to git repository
function syncToGit() {
  const config = readGitConfig();

  if (!config || !config.enabled) {
    return { success: false, message: 'Git sync not configured' };
  }

  if (!isGitInstalled()) {
    return { success: false, message: 'Git is not installed' };
  }

  try {
    const repoPath = config.repoPath || DATA_DIR;

    // Copy OVERVIEW.md to the git repo if it's a different location
    if (repoPath !== DATA_DIR) {
      const destPath = path.join(repoPath, 'OVERVIEW.md');
      fs.copyFileSync(OVERVIEW_FILE, destPath);
    }

    // Git commands
    execSync('git add OVERVIEW.md', { cwd: repoPath, stdio: 'ignore' });

    // Check if there are changes to commit
    try {
      execSync('git diff --staged --quiet', { cwd: repoPath, stdio: 'ignore' });
      return { success: true, message: 'No changes to sync' };
    } catch (error) {
      // There are changes, proceed with commit
    }

    const commitMessage = `Update lifelog overview - ${new Date().toISOString()}`;
    execSync(`git commit -m "${commitMessage}"`, { cwd: repoPath, stdio: 'ignore' });

    // Push if remote is configured
    if (config.autoSync && config.remoteName) {
      const branch = config.branch || 'main';
      execSync(`git push ${config.remoteName} ${branch}`, { cwd: repoPath, stdio: 'ignore' });
      return { success: true, message: 'Synced and pushed to remote' };
    }

    return { success: true, message: 'Changes committed locally' };
  } catch (error) {
    return { success: false, message: `Sync failed: ${error.message}` };
  }
}

// Setup git sync interactively
async function setupGitSync(inquirer) {
  console.log('\n📦 Git Sync Setup\n');

  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'enable',
      message: 'Do you want to enable automatic git sync for your overview?',
      default: false
    }
  ]);

  if (!answers.enable) {
    saveGitConfig({ enabled: false });
    return { success: true, message: 'Git sync disabled' };
  }

  const config = await inquirer.prompt([
    {
      type: 'input',
      name: 'repoPath',
      message: 'Where should the git repository be? (leave empty to use ~/.lifelog)',
      default: DATA_DIR
    },
    {
      type: 'confirm',
      name: 'useRemote',
      message: 'Do you want to push to a remote repository (like GitHub)?',
      default: false
    }
  ]);

  const gitConfig = {
    enabled: true,
    repoPath: config.repoPath || DATA_DIR,
    autoSync: false
  };

  if (config.useRemote) {
    const remoteConfig = await inquirer.prompt([
      {
        type: 'input',
        name: 'remoteName',
        message: 'Remote name (usually "origin"):',
        default: 'origin'
      },
      {
        type: 'input',
        name: 'branch',
        message: 'Branch name:',
        default: 'main'
      },
      {
        type: 'confirm',
        name: 'autoSync',
        message: 'Automatically push after each log entry?',
        default: true
      }
    ]);

    gitConfig.remoteName = remoteConfig.remoteName;
    gitConfig.branch = remoteConfig.branch;
    gitConfig.autoSync = remoteConfig.autoSync;
  }

  // Initialize git repo
  try {
    initGitRepo(gitConfig.repoPath);
    saveGitConfig(gitConfig);
    return { success: true, message: 'Git sync configured successfully!' };
  } catch (error) {
    return { success: false, message: `Setup failed: ${error.message}` };
  }
}

module.exports = {
  readGitConfig,
  saveGitConfig,
  syncToGit,
  setupGitSync,
  isGitInstalled
};
