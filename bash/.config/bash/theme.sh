transparency() {
  local color=$1
  local opacity=$2

  # Extract RGB part
  local rgb=${color:4}

  # Convert opacity (0-1) to hex (0-255), remove decimal
  local alpha=$(printf '%02x' $(echo "$opacity * 255" | bc | cut -d. -f1))

  echo "0x${alpha}${rgb}"
}

# PALETTE
# Catppuccin Mocha when macOS is in dark mode; the light palette starts from
# Latte but its accent and status hues are tuned by eye.
# AppleInterfaceStyle only exists while dark mode is on.
# Sketchybar picks this up on --reload, not when the system theme changes.
if [ "$(defaults read -g AppleInterfaceStyle 2>/dev/null)" = "Dark" ]; then
  export SYSTEM_APPEARANCE=dark

  THEME_BLUE=0xff89b4fa
  THEME_SAPPHIRE=0xff74c7ec
  THEME_TEAL=0xff94e2d5
  THEME_GREEN=0xffa6da95
  THEME_YELLOW=0xffe5c890
  THEME_PEACH=0xffef9f76
  THEME_RED=0xffe78284

  # Backdrop through to foreground
  THEME_MANTLE=0xff181825
  THEME_BASE=0xff1e1e2e
  THEME_SURFACE_0=0xff363a4f
  THEME_SURFACE_1=0xff45475a
  THEME_SURFACE_2=0xff585b70
  THEME_OVERLAY_0=0xff6c7086
  THEME_OVERLAY_1=0xff7f849c
  THEME_OVERLAY_2=0xff9399b2
  THEME_SUBTEXT_0=0xffa6adc8
  THEME_SUBTEXT_1=0xffbac2de
  THEME_TEXT=0xffcdd6f4

  THEME_GOOD=$THEME_GREEN
  THEME_WARN=$THEME_YELLOW
  THEME_ALERT=$THEME_PEACH
  THEME_BAD=$THEME_RED

  THEME_ACCENT=$THEME_SAPPHIRE
  THEME_ON_ACCENT=$THEME_MANTLE
  THEME_ACCENT_FADE=0.6
  THEME_STATUS_WEIGHT=SemiBold
else
  export SYSTEM_APPEARANCE=light

  THEME_BLUE=0xff1e66f5
  THEME_SAPPHIRE=0xff209fb5
  THEME_TEAL=0xff179299

  # Backdrop through to foreground
  THEME_MANTLE=0xffe6e9ef
  THEME_BASE=0xffeff1f5
  THEME_SURFACE_0=0xffccd0da
  THEME_SURFACE_1=0xffbcc0cc
  THEME_SURFACE_2=0xffacb0be
  THEME_OVERLAY_0=0xff9ca0b0
  THEME_OVERLAY_1=0xff8c8fa1
  THEME_OVERLAY_2=0xff7c7f93
  THEME_SUBTEXT_0=0xff6c6f85
  THEME_SUBTEXT_1=0xff5c5f77
  THEME_TEXT=0xff3f4756

  # Outside Latte, whose hues all read too saturated against this bar.
  THEME_STEEL=0xff3b6ea5
  THEME_GOOD=0xff5a7d52
  THEME_WARN=0xffa8792f
  THEME_ALERT=0xffb5673a
  THEME_BAD=0xffa8434a

  THEME_ACCENT=$THEME_STEEL
  THEME_ON_ACCENT=$THEME_BASE
  # The light accent is darker than its bar, so fading it toward the bar washes
  # it out rather than dimming it. Needs a higher alpha than the dark theme.
  THEME_ACCENT_FADE=0.75
  # Status text needs more weight to hold its own against a pale bar.
  THEME_STATUS_WEIGHT=Bold
fi

export WHITE=0xffffffff

# APPLIED COLORS
export SYSTEM_BG_COLOR=$THEME_MANTLE
export SYSTEM_TEXT_COLOR=$THEME_TEXT
export SYSTEM_SUBTEXT_COLOR_0=$THEME_SUBTEXT_0
export SYSTEM_SUBTEXT_COLOR_1=$THEME_SUBTEXT_1
export SYSTEM_SURFACE_COLOR_0=$THEME_SURFACE_0
export SYSTEM_SURFACE_COLOR_1=$THEME_SURFACE_1
export SYSTEM_SURFACE_COLOR_2=$THEME_SURFACE_2
export SYSTEM_ACCENT_COLOR=$THEME_ACCENT
export SYSTEM_ON_ACCENT_COLOR=$THEME_ON_ACCENT
export SYSTEM_ACCENT_FADE=$THEME_ACCENT_FADE
export SYSTEM_STATUS_WEIGHT=$THEME_STATUS_WEIGHT

# Higher is healthier
export SYSTEM_HEALTH_STATUS_4=$THEME_GOOD
export SYSTEM_HEALTH_STATUS_3=$THEME_WARN
export SYSTEM_HEALTH_STATUS_2=$THEME_ALERT
export SYSTEM_HEALTH_STATUS_1=$THEME_BAD

# Higher is louder
export SYSTEM_VOLUME_4=$THEME_TEXT
export SYSTEM_VOLUME_3=$THEME_SUBTEXT_1
export SYSTEM_VOLUME_2=$THEME_SUBTEXT_0
export SYSTEM_VOLUME_1=$THEME_SUBTEXT_0


# FONTS
MACOS="SF Pro"
JETBRAINS="JetBrainsMono NF"
export SYSTEM_FONT=$JETBRAINS
