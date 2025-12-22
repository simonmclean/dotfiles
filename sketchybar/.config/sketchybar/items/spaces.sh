#!/bin/bash

for sid in $(aerospace list-workspaces --all); do
    sketchybar --add item space.$sid left \
               --subscribe space.$sid aerospace_workspace_change \
               --set space.$sid \
                     icon=$sid                                  \
                     icon.padding_left=6 \
                     label.font="sketchybar-app-font:Regular:16.0" \
                     label.padding_right=10                     \
                     label.padding_left=0                     \
                     label.y_offset=-1                          \
                     click_script="aerospace workspace $sid" \
                     script="$PLUGIN_DIR/space.sh $sid"
    # Set initial background color
    if [ "$sid" = "$(aerospace list-workspaces --focused)" ]; then
        sketchybar --set space.$sid background.color=$ACCENT_COLOR
    else
        sketchybar --set space.$sid background.color=$BAR_COLOR
    fi
done

sketchybar --add item space_separator left                             \
           --subscribe space_separator aerospace_workspace_change front_app_switched space_windows_change aerospace_monitor_change \
           --set space_separator icon="􀆊"                                \
                                 icon.color=$ACCENT_COLOR \
                                 icon.padding_left=4                   \
                                 label.drawing=off                     \
                                 background.drawing=off                \
                                 script="$PLUGIN_DIR/space_icons.sh" \

$PLUGIN_DIR/space_icons.sh
