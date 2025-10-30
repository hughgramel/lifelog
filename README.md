# Lifelog

A simple and beautiful CLI tool for tracking how your life is going. Start your day with intention, track your progress, and reflect on your accomplishments—all from your terminal.

## Features

- **Morning & Evening Logging**: Start your day with gratitude and goals, finish with reflection and overview
- **Task Management**: Create and track daily tasks throughout the day
- **Comprehensive Journaling**: Write detailed overviews of your day with an integrated text editor
- **History & Analytics**: View your logs with filtering by day, week, month, or custom ranges
- **Beautiful Dashboard**: See an overview of your day at a glance
- **File-based Storage**: All your data is stored locally in JSON files in `~/.lifelog/`
- **Auto-generated Overview**: Creates a beautiful markdown file (`OVERVIEW.md`) of your recent entries that you can view on GitHub

## Installation

### From npm (when published)

```bash
npm install -g lifelog
```

### Local Development

```bash
git clone <your-repo-url>
cd lifelog
npm install
npm link
```

This will make the `ll` command available globally on your system.

## Usage

### Recommended Daily Workflow

#### 1. Start Your Day (Morning)

```bash
ll start
```

Begin each morning by:
- Rating how well you slept last night
- Writing one sentence about what you're grateful for
- Setting your goals/intentions for the day

#### 2. Track Tasks Throughout the Day

Create tasks as they come up:

```bash
ll create "Clean room"
ll create "Finish project report"
ll create "Call mom"
```

View and mark tasks complete:

```bash
ll tasks
```

#### 3. Finish Your Day (Evening)

```bash
ll finish
```

End your day with reflection:
- Rate your day (1-10)
- Rate your productivity (1-5)
- Write a comprehensive 1-2 paragraph overview of what happened today
- Automatically tracks how many tasks you completed

### Dashboard

Check your current status anytime:

```bash
ll
```

This shows:
- Today's log status (morning/evening entries)
- Today's tasks and completion count
- 7-day trends
- Quick action links

### Quick Log (Legacy)

For a simpler logging experience without the morning/evening split:

```bash
ll log
```

**Note**: We recommend using `ll start` and `ll finish` for the full experience!

### Create Tasks

Create a new task for today:

```bash
ll create "Clean room"
ll create "Finish project report"
```

### View Tasks

See all tasks for today and mark them as complete:

```bash
ll tasks
```

This command will:
- Show all tasks for today
- Display completion status
- Allow you to mark tasks as complete interactively

### View History

Browse your historical logs with various time ranges:

```bash
ll history
```

Choose from:
- Today
- Yesterday
- This Week
- This Month
- Last 7 Days
- Last 30 Days
- All Time

You'll see:
- Summary statistics (averages, totals)
- Best and worst days
- Option to view detailed entries

## Data Storage

All your data is stored locally in JSON files:

- **Location**: `~/.lifelog/`
- **Files**:
  - `logs.json` - Your daily log entries
  - `tasks.json` - Your task history

You can directly view or back up these files at any time.

### Example log entry

```json
{
  "date": "2025-10-30",
  "sleepQuality": 4,
  "dayRating": 8,
  "productivity": 4,
  "notes": "Great day, got a lot done!",
  "tasksCompleted": 5,
  "id": 1730318400000,
  "createdAt": "2025-10-30T12:00:00.000Z"
}
```

### Example task entry

```json
{
  "id": 1730318400001,
  "name": "Clean room",
  "completed": true,
  "createdAt": "2025-10-30T12:00:00.000Z",
  "completedAt": "2025-10-30T15:30:00.000Z",
  "date": "2025-10-30"
}
```

### Git Sync for Overview

Your OVERVIEW.md file is automatically generated in `~/.lifelog/OVERVIEW.md` and contains beautiful visualizations of your data. You can sync this to a git repository to view it on GitHub:

#### Option 1: Manual Copy (Simplest)

Just copy the overview to your repo when you want to share it:

```bash
cp ~/.lifelog/OVERVIEW.md ~/my-lifelog-repo/OVERVIEW.md
cd ~/my-lifelog-repo
git add OVERVIEW.md
git commit -m "Update lifelog overview"
git push
```

#### Option 2: Automatic Git Sync

Set up automatic syncing:

```bash
ll sync setup
```

This will guide you through:
- Choosing a git repository location
- Setting up remote (GitHub, GitLab, etc.)
- Enabling auto-sync after each log entry

Once configured, your overview will automatically:
- Be generated after each `ll start` and `ll finish`
- Be committed to git
- Be pushed to your remote repository (if enabled)

Check sync status anytime:

```bash
ll sync
```

Manual sync:

```bash
ll sync now
```

## Commands

| Command | Description |
|---------|-------------|
| `ll` | Show the dashboard |
| `ll start` | Start your day (morning logging) |
| `ll finish` | Finish your day (evening logging) |
| `ll log` | Quick log (legacy mode) |
| `ll create "task"` | Create a new task |
| `ll tasks` | View and manage today's tasks |
| `ll history` | View historical logs with filtering |
| `ll sync [action]` | Manage git sync (setup, now, status) |

## Technologies

- **Commander.js** - CLI framework
- **Inquirer.js** - Interactive prompts
- **Chalk** - Terminal styling
- **Day.js** - Date handling

## Development

```bash
# Install dependencies
npm install

# Link for local testing
npm link

# Test the CLI
ll
```

## Publishing to npm

1. Create an npm account if you don't have one
2. Login: `npm login`
3. Publish: `npm publish`

Make sure to update the `author` field in `package.json` before publishing.

## License

ISC

## Contributing

Feel free to open issues or submit pull requests!

## Future Enhancements

Possible features to add:
- Export data to CSV/PDF
- Custom questions/metrics
- Weekly/monthly reports via email
- Reminders to log daily
- Mood tracking with emojis
- Goal setting and tracking
- Data visualization charts
- Cloud sync options
