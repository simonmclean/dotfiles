#!/bin/bash

cpu=(
  update_freq=2
  icon=􀧓
  script="$PLUGIN_DIR/cpu.sh"
)

sketchybar --add item cpu right \
           --set cpu "${cpu[@]}"
