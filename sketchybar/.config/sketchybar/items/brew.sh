#!/bin/bash

sketchybar --add item brew right \
           --set brew update_freq=3600 \
                      script="$PLUGIN_DIR/brew.sh" \
                      icon= \
           --subscribe brew system_woke