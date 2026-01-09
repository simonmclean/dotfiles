#!/usr/bin/env bash

source "$CONFIG_DIR/colors.sh" # Loads all defined colors

FOCUSED_WORKSPACE=$(aerospace list-workspaces --focused)
FOCUSED_MONITOR_WORKSPACES=$(aerospace list-workspaces --monitor focused)

SPACE=()

if [ "$1" = "$FOCUSED_WORKSPACE" ]; then
  SPACE+=(
    background.drawing=on
    background.color=$ACCENT_COLOR
    label.color=$BAR_COLOR
    icon.color=$BAR_COLOR
  )
elif [[ "$FOCUSED_MONITOR_WORKSPACES" == *"$1"* ]]; then
  # workspaces in the focused monitor
  SPACE+=(
    background.drawing=on
    background.color=$BAR_COLOR
    label.color=$ACCENT_COLOR
    icon.color=$ACCENT_COLOR
  )
else
  # workspaces not in the focused monitor
  SPACE+=(
    background.drawing=on
    background.color=$BAR_COLOR
    label.color=$ACCENT_COLOR_TRANSPARENT
    icon.color=$ACCENT_COLOR_TRANSPARENT
  )
fi

sketchybar --set $NAME "${SPACE[@]}"
