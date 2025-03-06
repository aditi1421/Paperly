{pkgs}: {
  deps = [
    pkgs.wayland
    pkgs.mesa
    pkgs.libxkbcommon
    pkgs.libdrm
    pkgs.at-spi2-atk
    pkgs.alsa-lib
    pkgs.gtk3
    pkgs.nspr
    pkgs.pango
    pkgs.cairo
    pkgs.freetype
    pkgs.fontconfig
    pkgs.nss
    pkgs.glib
    pkgs.chromium
  ];
}
