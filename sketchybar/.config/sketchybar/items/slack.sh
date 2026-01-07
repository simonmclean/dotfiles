#!/bin/bash

sketchybar --add item slack right \
           --set slack update_freq=60 \
                       script="$PLUGIN_DIR/slack.sh" \
                       click_script="open -a Slack" \
           --subscribe slack system_woke
