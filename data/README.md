# Data Directory

This directory contains your lifelog data files when using the app from this repository.

## Files

- **logs.json** - Your daily log entries (morning and evening entries)
- **tasks.json** - Your task tracking data

## Privacy Note

By default, these files are tracked in git and will be pushed to GitHub, making your logs public. If you want to keep your personal data private:

1. Edit `.gitignore` in the root directory
2. Uncomment the lines:
   ```
   # data/logs.json
   # data/tasks.json
   ```
3. Run `git rm --cached data/logs.json data/tasks.json` to stop tracking existing files

The `OVERVIEW.md` file in the root will still be generated and pushed to show statistics and visualizations without revealing detailed personal entries.

## Fallback Behavior

If this directory doesn't exist, the app will automatically fall back to using `~/.lifelog/` as the data directory.
