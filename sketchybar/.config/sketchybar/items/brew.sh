#!/bin/bash

brew=(
  update_freq=3600
  script="$PLUGIN_DIR/brew.sh"
  icon=
  click_script="$PLUGIN_DIR/brew.sh"
)

sketchybar --add item brew right \
           --set brew "${brew[@]}" \
           --subscribe brew system_woke
