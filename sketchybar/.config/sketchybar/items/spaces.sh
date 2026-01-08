#!/bin/bash

add_space ()
{
  sketchybar --add item space.$1 left \
    --subscribe space.$1 aerospace_workspace_change \
    --set space.$1 \
    display=$2 \
    icon=$1                                  \
    icon.padding_left=6 \
    label.font="sketchybar-app-font:Regular:14.0" \
    label.padding_right=10                     \
    label.padding_left=0                     \
    label.y_offset=-1                          \
    click_script="aerospace workspace $1" \
    script="$PLUGIN_DIR/space.sh $1"
}

for sid in $(aerospace list-workspaces --monitor 1); do
  add_space $sid 1
done

# Handle multi-monitor (assumes main is the external display)
if [ $(aerospace list-monitors --json | jq 'length') -gt 1 ]; then
  for sid in $(aerospace list-workspaces --monitor 2); do
    add_space $sid 2
  done
fi

sketchybar --add item space_separator left                             \
  --subscribe space_separator aerospace_workspace_change front_app_switched space_windows_change aerospace_monitor_change \
  --set space_separator icon="􀆊"                                \
  icon.color=$ACCENT_COLOR \
  icon.padding_left=4                   \
  label.drawing=off                     \
  background.drawing=off                \
  script="$PLUGIN_DIR/space_icons.sh" \

  $PLUGIN_DIR/space_icons.sh
