#!/bin/sh

source $HOME/.config/bash/theme.sh

# The volume_change event supplies a $INFO variable in which the current volume
# percentage is passed to the script.

if [ "$SENDER" = "volume_change" ]; then
  VOLUME=$INFO

  case $VOLUME in
    [8-9][0-9]|100)
      ICON="􀊩"
      ICON_COLOR=$SYSTEM_VOLUME_4
    ;;
    [3-7][0-9])
      ICON="􀊥"
      ICON_COLOR=$SYSTEM_VOLUME_3
    ;;
    [1-9]|[1-2][0-9])
      ICON="􀊡"
      ICON_COLOR=$SYSTEM_VOLUME_2
    ;;
    *)
      ICON="􀊣"
      ICON_COLOR=$SYSTEM_VOLUME_1
  esac

  sketchybar --set $NAME \
    icon="$ICON" \
    icon.color="$ICON_COLOR" \
    label="$VOLUME%"
fi
