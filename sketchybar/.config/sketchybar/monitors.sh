#!/bin/bash

# Shared state for monitor change detection.
# Sourced by sketchybarrc and by plugins/monitor_watch.sh.

# The monitor count the currently loaded config was built for. Written by
# items/spaces.sh on every config load, so it is always the truth about what
# the bar currently contains, never just what was last observed.
MONITOR_COUNT_FILE="$HOME/.cache/sketchybar-monitor-count.txt"

# Exists while sketchybarrc is running. Reloading part way through a config
# load leaves the outgoing shell adding its remaining items to the newly built
# bar, which shows up as mis-ordered items and missing padding.
CONFIG_LOADING_FILE="$HOME/.cache/sketchybar-config-loading"

RELOAD_LOCK_DIR="$HOME/.cache/sketchybar-reload.lock"

monitor_count() {
  aerospace list-monitors --json | jq 'length'
}
