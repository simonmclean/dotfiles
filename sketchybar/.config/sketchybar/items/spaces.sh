#!/bin/bash


SPACE_COMMANDS=()

# Record what this config is being built for, so monitor_watch.sh can tell
# whether the bar still matches the monitors that are actually connected.
MONITOR_COUNT=$(monitor_count)
echo "$MONITOR_COUNT" > "$MONITOR_COUNT_FILE"

for sid in $(aerospace list-workspaces --monitor 1); do
  SPACE_COMMANDS+=(
    --add item space.$sid left
    --subscribe space.$sid aerospace_workspace_change
    --set space.$sid
      display=1
      icon=$sid
      icon.padding_left=6
      label.font="sketchybar-app-font:Regular:14.0"
      label.padding_right=10
      label.padding_left=0
      label.y_offset=-1
      click_script="aerospace workspace $sid"
      script="$PLUGIN_DIR/space.sh $sid"
  )
done

# Handle multi-monitor (assumes main is the external display)
if [ "$MONITOR_COUNT" -gt 1 ]; then
  for sid in $(aerospace list-workspaces --monitor 2); do
    SPACE_COMMANDS+=(
      --add item space.$sid left
      --subscribe space.$sid aerospace_workspace_change
      --set space.$sid
        display=2
        icon=$sid
        icon.padding_left=6
        label.font="sketchybar-app-font:Regular:14.0"
        label.padding_right=10
        label.padding_left=0
        label.y_offset=-1
        click_script="aerospace workspace $sid"
        script="$PLUGIN_DIR/space.sh $sid"
    )
  done
fi

space_separator=(
  icon="􀆊"
  icon.color=$ACCENT_COLOR
  icon.padding_left=4
  label.drawing=off
  background.drawing=off
  script="$PLUGIN_DIR/space_icons.sh"
)

# Invisible item whose only job is to reload the bar when the set of connected
# monitors changes, since the workspace items above cannot be rebuilt in place.
monitor_watch=(
  drawing=off
  updates=on
  script="$PLUGIN_DIR/monitor_watch.sh"
)

sketchybar "${SPACE_COMMANDS[@]}" \
           --add item space_separator left \
           --subscribe space_separator aerospace_workspace_change front_app_switched space_windows_change display_change \
           --set space_separator "${space_separator[@]}" \
           --add item monitor_watch left \
           --subscribe monitor_watch display_change system_woke \
           --set monitor_watch "${monitor_watch[@]}"

$PLUGIN_DIR/space_icons.sh
