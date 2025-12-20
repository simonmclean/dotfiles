#!/bin/bash
echo "hi"
# if [ "$SENDER" = "aerospace_workspace_change" ]; then
#   echo "aerospace_workspace_change"
#   space="$(echo "$INFO" | jq -r '.space')"
#   apps="$(echo "$INFO" | jq -r '.apps | keys[]')"
#
#   icon_strip=" "
#   if [ "${apps}" != "" ]; then
#     while read -r app
#     do
#       icon_strip+=" $($CONFIG_DIR/plugins/icon_map_fn.sh "$app")"
#     done <<< "${apps}"
#   else
#     icon_strip=" —"
#   fi
#
#   sketchybar --set space.$space label="$icon_strip"
# fi
if [ "$SENDER" = "aerospace_monitor_change" ]; then
  sketchybar --set space."$FOCUSED_WORKSPACE" display="$TARGET_MONITOR"
  exit 0
fi

if [ "$SENDER" = "aerospace_workspace_change" ]; then
  echo "aerospace_workspace_change"
  prevapps=$(aerospace list-windows --workspace "$PREV_WORKSPACE" | awk -F'|' '{gsub(/^ *| *$/, "", $2); print $2}')
  echo "prevapps $prevapps"
  if [ "${prevapps}" != "" ]; then
    sketchybar --set space.$PREV_WORKSPACE drawing=on
    icon_strip=" "
    while read -r app; do
      icon_strip+=" $($CONFIG_DIR/plugins/icon_map_fn.sh "$app")"
    done <<<"${prevapps}"
    echo "icon_strip $icon_strip"
    sketchybar --set space.$PREV_WORKSPACE label="$icon_strip"
  else
    #WARN: moves empty workspaces back to monitor 1
    ###### this assumes monitor 1 is your main monitor
    aerospace move-workspace-to-monitor --workspace "$PREV_WORKSPACE" 1
    sketchybar --set space.$PREV_WORKSPACE drawing=off display=1
  fi
else
  FOCUSED_WORKSPACE="$(aerospace list-workspaces --focused)"
fi

apps=$(aerospace list-windows --workspace "$FOCUSED_WORKSPACE" | awk -F'|' '{gsub(/^ *| *$/, "", $2); print $2}')
sketchybar --set space.$FOCUSED_WORKSPACE drawing=on
icon_strip=" "
if [ "${apps}" != "" ]; then
  while read -r app; do
    icon_strip+=" $($CONFIG_DIR/plugins/icon_map_fn.sh "$app")"
  done <<<"${apps}"
else
  icon_strip=""
fi
sketchybar --set space.$FOCUSED_WORKSPACE label="$icon_strip"
