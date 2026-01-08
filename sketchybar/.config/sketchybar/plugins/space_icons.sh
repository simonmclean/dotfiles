#!/bin/bash

SPACE_LABEL_COMMANDS=()

while read -r workspace; do
  apps="$(aerospace list-windows --workspace "$workspace" --json | jq -r '.[] | .["app-name"]')"

  icon_strip=""
  if [ "${apps}" != "" ]; then
    while read -r app
    do
      icon_strip+=" $($CONFIG_DIR/plugins/icon_map_fn.sh "$app")"
    done <<< "${apps}"
  else
    icon_strip="—"
  fi

  SPACE_LABEL_COMMANDS+=(--set space.$workspace label="$icon_strip")
done <<< "$(aerospace list-workspaces --all)"

sketchybar "${SPACE_LABEL_COMMANDS[@]}"
