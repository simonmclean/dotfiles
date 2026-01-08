#!/bin/bash

media=(
  label.color=$ACCENT_COLOR
  label.max_chars=20
  icon.padding_left=0
  scroll_texts=on
  icon=􀑪
  icon.color=$ACCENT_COLOR
  background.drawing=off
  updates=when_shown
  script="$PLUGIN_DIR/media.sh"
)

sketchybar --add item media e \
           --set media "${media[@]}" \
           --subscribe media media_change
