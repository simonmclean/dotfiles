#!/bin/bash

volume=(
  script="$PLUGIN_DIR/volume.sh"
  click_script="open 'x-apple.systempreferences:com.apple.Sound'"
)

sketchybar --add item volume right \
           --set volume "${volume[@]}" \
           --subscribe volume volume_change
