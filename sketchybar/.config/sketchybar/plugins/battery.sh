#!/bin/sh

source $HOME/.config/bash/theme.sh

PERCENTAGE=$(pmset -g batt | grep -Eo "\d+%" | cut -d% -f1)
CHARGING=$(pmset -g batt | grep 'AC Power')

if [ $PERCENTAGE = "" ]; then
  exit 0
fi

case ${PERCENTAGE} in
  9[0-9]|100)
    ICON="􀛨"
    ICON_COLOR=$SYSTEM_HEALTH_STATUS_4
  ;;
  [6-8][0-9])
    ICON="􀺸"
    ICON_COLOR=$SYSTEM_HEALTH_STATUS_4
  ;;
  [3-5][0-9])
    ICON="􀺶"
    ICON_COLOR=$SYSTEM_HEALTH_STATUS_3
  ;;
  [1-2][0-9])
    ICON="􀛩"
    ICON_COLOR=$SYSTEM_HEALTH_STATUS_2
  ;;
  *)
    ICON="􀛪"
    ICON_COLOR=$SYSTEM_HEALTH_STATUS_1
esac

if [[ $CHARGING != "" ]]; then
  ICON="􀢋"
fi

# The item invoking this script (name $NAME) will get its icon and label
# updated with the current battery status
battery=(
  icon="$ICON"
  icon.color="$ICON_COLOR"
  label="${PERCENTAGE}%"
)

sketchybar --set $NAME "${battery[@]}"
