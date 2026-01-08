#!/bin/bash

slack=(
  update_freq=60
  updates=when_shown
  script="$PLUGIN_DIR/slack.sh"
  click_script="open -a Slack"
)

sketchybar --add item slack right \
           --set slack "${slack[@]}" \
           --subscribe slack system_woke
