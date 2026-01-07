#!/bin/bash

# This is script is intended to be run as a cron
# Add this to crontab -e
# 0 * * * * [ -f $HOME/homebrew_count_outdated.sh ] && bash $HOME/homebrew_count_outdated.sh

# Check if homebrew is installed
if [ ! -x /opt/homebrew/bin/brew ]; then
    echo 0 > /tmp/brew-outdated-count.txt
    exit 0
fi

/opt/homebrew/bin/brew outdated --json 2>/dev/null | jq '(.formulae | length) + (.casks | length)' > /tmp/brew-outdated-count.txt
