#!/bin/bash

for sid in $(aerospace list-workspaces --all); do
    sketchybar --add item space.$sid left \
               --subscribe space.$sid aerospace_workspace_change \
               --set space.$sid \
                     icon=$sid                                  \
                     label.font="sketchybar-app-font:Regular:16.0" \
                     label.padding_right=20                     \
                     label.y_offset=-1                          \
                     click_script="aerospace workspace $sid" \
                     script="$PLUGIN_DIR/aerospace.sh $sid"
done

sketchybar --add item space_separator left                             \
           --subscribe space_separator aerospace_workspace_change front_app_switched space_windows_change aerospace_monitor_change \
           --set space_separator icon="􀆊"                                \
                                 icon.color=$ACCENT_COLOR \
                                 icon.padding_left=4                   \
                                 label.drawing=off                     \
                                 background.drawing=off                \
                                 script="$PLUGIN_DIR/space_windows.sh" \
