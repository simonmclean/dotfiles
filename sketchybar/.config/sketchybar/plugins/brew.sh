#!/bin/bash

source $HOME/.config/bash/theme.sh

# Read count from cache file updated by cron
COUNT=$(cat /tmp/brew-outdated-count.txt 2>/dev/null || echo 0)

if [[ $COUNT -eq 0 ]]; then
  COLOUR=$SYSTEM_HEALTH_STATUS_4
elif [[ $COUNT -lt 4 ]]; then
  COLOUR=$SYSTEM_HEALTH_STATUS_3
elif [[ $COUNT -lt 8 ]]; then
  COLOUR=$SYSTEM_HEALTH_STATUS_2
else
  COLOUR=$SYSTEM_HEALTH_STATUS_1
fi

sketchybar --set $NAME \
  icon.color=$COLOUR \
  label="$COUNT" \
  label.color=$COLOUR