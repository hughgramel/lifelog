const fs = require('fs');
const path = require('path');
const os = require('os');
const dayjs = require('dayjs');

// Use repo data directory if it exists, otherwise fallback to ~/.lifelog
const REPO_DATA_DIR = path.join(__dirname, '../../data');
const HOME_DATA_DIR = path.join(os.homedir(), '.lifelog');

// Check if repo data directory exists
const DATA_DIR = fs.existsSync(REPO_DATA_DIR) ? REPO_DATA_DIR : HOME_DATA_DIR;
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const OVERVIEW_FILE = path.join(__dirname, '../../OVERVIEW.md'); // Always in repo root

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Read logs
function readLogs() {
  ensureDataDir();
  if (!fs.existsSync(LOGS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(LOGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Write logs
function writeLogs(logs) {
  ensureDataDir();
  fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), 'utf8');
}

// Add a log entry
function addLog(logEntry) {
  const logs = readLogs();
  logs.push({
    ...logEntry,
    id: Date.now(),
    createdAt: new Date().toISOString()
  });
  writeLogs(logs);
  return logs[logs.length - 1];
}

// Read tasks
function readTasks() {
  ensureDataDir();
  if (!fs.existsSync(TASKS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(TASKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Write tasks
function writeTasks(tasks) {
  ensureDataDir();
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf8');
}

// Add a task
function addTask(taskName) {
  const tasks = readTasks();
  const task = {
    id: Date.now(),
    name: taskName,
    completed: false,
    createdAt: new Date().toISOString(),
    date: dayjs().format('YYYY-MM-DD')
  };
  tasks.push(task);
  writeTasks(tasks);
  return task;
}

// Complete a task
function completeTask(taskId) {
  const tasks = readTasks();
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = true;
    task.completedAt = new Date().toISOString();
    writeTasks(tasks);
  }
  return task;
}

// Get tasks for a specific date
function getTasksForDate(date) {
  const tasks = readTasks();
  const dateStr = dayjs(date).format('YYYY-MM-DD');
  return tasks.filter(t => t.date === dateStr);
}

// Get completed tasks count for a date
function getCompletedTasksCount(date) {
  const tasks = getTasksForDate(date);
  return tasks.filter(t => t.completed).length;
}

// Get logs by date range
function getLogsByDateRange(startDate, endDate) {
  const logs = readLogs();
  const start = dayjs(startDate).startOf('day');
  const end = dayjs(endDate).endOf('day');

  return logs.filter(log => {
    const logDate = dayjs(log.date);
    return logDate.isAfter(start) && logDate.isBefore(end);
  });
}

// Get log for specific date
function getLogForDate(date) {
  const logs = readLogs();
  const dateStr = dayjs(date).format('YYYY-MM-DD');
  return logs.find(log => log.date === dateStr);
}

// Update a log entry
function updateLog(date, updates) {
  const logs = readLogs();
  const dateStr = dayjs(date).format('YYYY-MM-DD');
  const logIndex = logs.findIndex(log => log.date === dateStr);

  if (logIndex !== -1) {
    logs[logIndex] = { ...logs[logIndex], ...updates };
  } else {
    logs.push({
      date: dateStr,
      ...updates,
      id: Date.now(),
      createdAt: new Date().toISOString()
    });
  }

  writeLogs(logs);
  return logs[logIndex !== -1 ? logIndex : logs.length - 1];
}

// Generate overview markdown file
function generateOverview() {
  ensureDataDir();
  const logs = readLogs().sort((a, b) => new Date(b.date) - new Date(a.date));

  let content = '# 📊 Life Log Overview\n\n';
  content += `*Last updated: ${dayjs().format('MMMM D, YYYY h:mm A')}*\n\n`;

  // Add statistics first
  if (logs.length > 0) {
    content += generateStatisticsSection(logs);
    content += '\n---\n\n';
    content += generateChartsSection(logs);
    content += '\n---\n\n';
  }

  content += '## 📝 Recent Entries\n\n';

  logs.slice(0, 30).forEach(log => {
    content += `### ${dayjs(log.date).format('dddd, MMMM D, YYYY')}\n\n`;

    if (log.morningEntry) {
      content += '**Morning Entry:**\n';
      content += `- Sleep Quality: ${getSleepLabel(log.morningEntry.sleepQuality)}\n`;
      content += `- Grateful For: ${log.morningEntry.gratefulFor}\n`;
      if (log.morningEntry.goals && log.morningEntry.goals.length > 0) {
        content += '- Goals for today:\n';
        log.morningEntry.goals.forEach(goal => {
          content += `  - ${goal}\n`;
        });
      }
      content += '\n';
    }

    if (log.eveningEntry) {
      content += '**Evening Entry:**\n';
      content += `- Day Rating: ${log.eveningEntry.dayRating}/10\n`;
      content += `- Productivity: ${getProductivityLabel(log.eveningEntry.productivity)}\n`;
      content += `- Tasks Completed: ${log.eveningEntry.tasksCompleted || 0}\n`;
      if (log.eveningEntry.dayOverview) {
        content += '\n**Day Overview:**\n';
        content += `${log.eveningEntry.dayOverview}\n`;
      }
      content += '\n';
    }

    content += '---\n\n';
  });

  fs.writeFileSync(OVERVIEW_FILE, content, 'utf8');
  return OVERVIEW_FILE;
}

function generateStatisticsSection(logs) {
  let content = '## 📈 Statistics\n\n';

  const completeLogs = logs.filter(l => l.eveningEntry && l.eveningEntry.dayRating);
  const morningLogs = logs.filter(l => l.morningEntry);

  if (completeLogs.length === 0) {
    content += '*No complete entries yet. Start logging to see statistics!*\n';
    return content;
  }

  const avgRating = (completeLogs.reduce((sum, log) => sum + log.eveningEntry.dayRating, 0) / completeLogs.length).toFixed(1);
  const avgProductivity = (completeLogs.reduce((sum, log) => sum + log.eveningEntry.productivity, 0) / completeLogs.length).toFixed(1);
  const avgSleep = morningLogs.length > 0 ? (morningLogs.reduce((sum, log) => sum + log.morningEntry.sleepQuality, 0) / morningLogs.length).toFixed(1) : 'N/A';
  const totalTasks = completeLogs.reduce((sum, log) => sum + (log.eveningEntry.tasksCompleted || 0), 0);

  content += '| Metric | Value |\n';
  content += '|--------|-------|\n';
  content += `| 📅 Total Logged Days | ${completeLogs.length} |\n`;
  content += `| ⭐ Average Day Rating | ${avgRating}/10 |\n`;
  content += `| 🎯 Average Productivity | ${avgProductivity}/5 |\n`;
  content += `| 😴 Average Sleep Quality | ${avgSleep}/5 |\n`;
  content += `| ✅ Total Tasks Completed | ${totalTasks} |\n`;
  content += `| 📊 Tasks Per Day | ${(totalTasks / completeLogs.length).toFixed(1)} |\n`;

  return content;
}

function generateChartsSection(logs) {
  let content = '## 📊 Visual Charts\n\n';

  const completeLogs = logs.filter(l => l.eveningEntry && l.eveningEntry.dayRating).slice(0, 30).reverse();

  if (completeLogs.length === 0) {
    return '';
  }

  // Day Rating Trend (last 30 days)
  content += '### ⭐ Day Rating Trend (Last 30 Days)\n\n';
  content += '```\n';
  content += '10 ┤';
  const ratingData = completeLogs.map(l => l.eveningEntry.dayRating);
  content += createSparkline(ratingData, 10);
  content += '\n 1 ┤' + '─'.repeat(completeLogs.length) + '\n';
  content += '   └' + '─'.repeat(completeLogs.length) + '→ time\n';
  content += '```\n\n';

  // Productivity Chart
  content += '### 🎯 Productivity Levels (Last 30 Days)\n\n';
  content += '```\n';
  const productivityData = completeLogs.map(l => l.eveningEntry.productivity);
  completeLogs.forEach((log, i) => {
    const date = dayjs(log.date).format('MM/DD');
    const bars = '█'.repeat(log.eveningEntry.productivity);
    const empty = '░'.repeat(5 - log.eveningEntry.productivity);
    content += `${date} ┤${bars}${empty} ${log.eveningEntry.productivity}/5\n`;
  });
  content += '```\n\n';

  // Sleep Quality Distribution
  const morningLogs = logs.filter(l => l.morningEntry).slice(0, 30);
  if (morningLogs.length > 0) {
    content += '### 😴 Sleep Quality Distribution\n\n';
    const sleepCounts = [0, 0, 0, 0, 0, 0]; // index 0 unused, 1-5 for ratings
    morningLogs.forEach(log => {
      sleepCounts[log.morningEntry.sleepQuality]++;
    });

    content += '```\n';
    for (let i = 5; i >= 1; i--) {
      const count = sleepCounts[i];
      const percentage = ((count / morningLogs.length) * 100).toFixed(0);
      const bars = '█'.repeat(Math.round(count / morningLogs.length * 20));
      content += `${i} ⭐ ┤${bars} ${count} nights (${percentage}%)\n`;
    }
    content += '```\n\n';
  }

  // Tasks Completion Heatmap (last 7 days)
  const last7Days = completeLogs.slice(-7);
  if (last7Days.length > 0) {
    content += '### ✅ Task Completion (Last 7 Days)\n\n';
    content += '```\n';
    last7Days.forEach(log => {
      const date = dayjs(log.date).format('ddd MM/DD');
      const tasks = log.eveningEntry.tasksCompleted || 0;
      const bars = '▓'.repeat(Math.min(tasks, 20));
      content += `${date} ┤${bars} ${tasks} tasks\n`;
    });
    content += '```\n\n';
  }

  // Rating Distribution
  content += '### 📊 Day Rating Distribution\n\n';
  const ratingCounts = {};
  for (let i = 1; i <= 10; i++) ratingCounts[i] = 0;
  completeLogs.forEach(log => {
    ratingCounts[log.eveningEntry.dayRating]++;
  });

  content += '```\n';
  for (let i = 10; i >= 1; i--) {
    const count = ratingCounts[i];
    const percentage = ((count / completeLogs.length) * 100).toFixed(0);
    const bars = '█'.repeat(Math.round(count / completeLogs.length * 30));
    if (count > 0) {
      content += `${i.toString().padStart(2)} ┤${bars} ${count} days (${percentage}%)\n`;
    }
  }
  content += '```\n\n';

  return content;
}

function createSparkline(data, max) {
  const chars = ['_', '▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  return data.map(value => {
    const index = Math.min(Math.floor((value / max) * (chars.length - 1)), chars.length - 1);
    return chars[index];
  }).join('');
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

module.exports = {
  readLogs,
  writeLogs,
  addLog,
  updateLog,
  readTasks,
  writeTasks,
  addTask,
  completeTask,
  getTasksForDate,
  getCompletedTasksCount,
  getLogsByDateRange,
  getLogForDate,
  generateOverview,
  DATA_DIR,
  LOGS_FILE,
  TASKS_FILE,
  OVERVIEW_FILE
};
