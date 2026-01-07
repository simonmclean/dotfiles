#!/bin/bash

source $HOME/.config/bash/theme.sh

# Check if Slack is running
if ! pgrep -x "Slack" > /dev/null; then
  sketchybar --set $NAME drawing=off
  exit 0
fi

sketchybar --set $NAME drawing=on

# Get badge count from Slack app in Dock
COUNT=$(defaults read com.tinyspeck.slackmacgap BadgeCount 2>/dev/null || echo 0)

if [[ $COUNT -eq 0 ]]; then
  COLOUR=$SYSTEM_HEALTH_STATUS_4
  LABEL=""
else
  COLOUR=$SYSTEM_HEALTH_STATUS_2
  LABEL="$COUNT"
fi

sketchybar --set $NAME \
  icon= \
  icon.color=$COLOUR \
  label="$LABEL" \
  label.color=$COLOUR
