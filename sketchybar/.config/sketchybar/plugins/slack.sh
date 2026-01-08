#!/bin/bash

source $HOME/.config/bash/theme.sh

# Check if Slack is running
if ! pgrep -x "Slack" > /dev/null; then
  sketchybar --set $NAME drawing=off
  exit 0
fi

STATUS_LABEL=$(lsappinfo info -only StatusLabel "Slack")
ICON="󰒱"

if [[ $STATUS_LABEL =~ \"label\"=\"([^\"]*)\" ]]; then
    LABEL="${BASH_REMATCH[1]}"

    if [[ $LABEL == "" ]]; then
        ICON_COLOUR=$SYSTEM_HEALTH_STATUS_4
    elif [[ $LABEL == "•" ]]; then
        ICON_COLOUR=$SYSTEM_HEALTH_STATUS_3
    elif [[ $LABEL =~ ^[0-9]+$ ]]; then
        ICON_COLOUR=$SYSTEM_HEALTH_STATUS_2
    else
        exit 0
    fi
else
  exit 0
fi

sketchybar --set $NAME \
  drawing=on \
  icon=$ICON \
  icon.color=$ICON_COLOUR \
  label="$LABEL"
