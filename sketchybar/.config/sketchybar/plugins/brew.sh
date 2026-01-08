#!/bin/bash

source $HOME/.config/bash/theme.sh

# Read count from cache file updated by cron
COUNT=$(cat /tmp/brew-outdated-count.txt 2>/dev/null || echo -1)

if [[ $COUNT -eq 0 ]]; then
  ICON_COLOUR=$SYSTEM_HEALTH_STATUS_4
elif [[ $COUNT -lt 4 ]]; then
  ICON_COLOUR=$SYSTEM_HEALTH_STATUS_3
elif [[ $COUNT -lt 8 ]]; then
  ICON_COLOUR=$SYSTEM_HEALTH_STATUS_2
else
  ICON_COLOUR=$SYSTEM_HEALTH_STATUS_1
fi

if [[ $COUNT -eq -1 ]]; then
  LABEL="?"
elif [[ $COUNT -eq 0 ]]; then
  LABEL=""
else
  LABEL=$COUNT
fi

sketchybar --set $NAME \
  icon.color=$ICON_COLOUR \
  label="$LABEL"
