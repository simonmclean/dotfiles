#!/bin/bash

STATE="$(echo "$INFO" | jq -r '.state')"
if [ "$STATE" = "playing" ]; then
  MEDIA="$(echo "$INFO" | jq -r '.title + " - " + .artist')"
  media=(
    label="$MEDIA"
    drawing=on
  )
  sketchybar --set $NAME "${media[@]}"
else
  sketchybar --set $NAME drawing=off
fi
