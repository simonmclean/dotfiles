#!/bin/bash

source $HOME/.config/bash/theme.sh

if ! pgrep -x "Slack" > /dev/null; then
  sketchybar --set $NAME drawing=off
  exit 0
fi

ICON="󰒱"

# Reading the dock tile badge needs Accessibility permission for sketchybar.
if ! LABEL=$(osascript -e 'tell application "System Events" to tell process "Dock" to tell list 1 to get value of attribute "AXStatusLabel" of (first UI element whose name is "Slack")' 2>/dev/null); then
  sketchybar --set $NAME drawing=on icon=$ICON icon.color=$SYSTEM_HEALTH_STATUS_1 label="!"
  exit 0
fi

# An unbadged tile reports "missing value".
if [[ $LABEL == "missing value" || -z $LABEL ]]; then
  LABEL=""
  ICON_COLOUR=$SYSTEM_HEALTH_STATUS_4
elif [[ $LABEL == "•" ]]; then
  ICON_COLOUR=$SYSTEM_HEALTH_STATUS_3
elif [[ $LABEL =~ ^[0-9]+$ ]]; then
  ICON_COLOUR=$SYSTEM_HEALTH_STATUS_2
else
  ICON_COLOUR=$SYSTEM_HEALTH_STATUS_1
fi

slack=(
  drawing=on
  icon=$ICON
  icon.color=$ICON_COLOUR
  label="$LABEL"
)

sketchybar --set $NAME "${slack[@]}"
