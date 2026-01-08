#!/bin/bash

battery=(
  update_freq=120
  script="$PLUGIN_DIR/battery.sh"
  click_script="open 'x-apple.systempreferences:com.apple.Battery'"
)

sketchybar --add item battery right \
           --set battery "${battery[@]}" \
           --subscribe battery system_woke power_source_change
