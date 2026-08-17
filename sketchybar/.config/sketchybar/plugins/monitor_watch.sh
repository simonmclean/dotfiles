#!/bin/bash

# Workspace items are only created for the monitors connected when sketchybar
# builds its config, so a change in monitor count needs a full reload rather
# than a label refresh, otherwise workspaces belonging to a newly connected
# monitor never appear.

source "$CONFIG_DIR/monitors.sh"

# One pending reload at a time, so the burst of events that a plug/unplug or a
# wake produces collapses into a single reload.
mkdir "$RELOAD_LOCK_DIR" 2>/dev/null || exit 0
trap 'rmdir "$RELOAD_LOCK_DIR" 2>/dev/null' EXIT

# Let the displays settle before reading the monitor count.
sleep 2

# Never reload during a config load. A load in progress is already building for
# the current monitors, so there is nothing to fix. The marker is treated as
# stale after 30s, since a reload kills the config shell before it can clean up.
LOADING_AT=$(stat -f %m "$CONFIG_LOADING_FILE" 2>/dev/null)
if [ $(($(date +%s) - ${LOADING_AT:-0})) -lt 30 ]; then
  exit 0
fi

[ "$(monitor_count)" = "$(cat "$MONITOR_COUNT_FILE" 2>/dev/null)" ] && exit 0

rmdir "$RELOAD_LOCK_DIR" 2>/dev/null
exec sketchybar --reload
