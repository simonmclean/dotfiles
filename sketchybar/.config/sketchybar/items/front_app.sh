#!/bin/bash

front_app=(
  background.color=$ACCENT_COLOR
  associated_display=active
  icon.color=$BAR_COLOR
  icon.padding_left=7
  icon.font="sketchybar-app-font:Regular:14.0"
  label.color=$BAR_COLOR
  label.padding_left=2
  label.padding_right=8
  script="$PLUGIN_DIR/front_app.sh"
)

sketchybar --add item front_app left \
           --set front_app "${front_app[@]}" \
           --subscribe front_app front_app_switched
