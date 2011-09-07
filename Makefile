#############################################################################################
# NOTES:
#
# This Makefile assumes that you have the following installed, setup:
#
#  * Java
#  * Unixy shell (use msys on Windows)
#  * SpiderMonkey JavaScript Shell (jsshell), binaries available at:
#      https://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/latest-mozilla-central/
#  * $JSSHELL environment variable in .profile or .bashrc pointing to a SpiderMonkey binary.
#    For example: export JSSHELL=/Users/dave/moz/jsshell/js
#
#############################################################################################

TOOLS_DIR := ./tools
RESCUEFOX := ./src/rescuefox.js

check-lint:
	@@$(JSSHELL) -f $(TOOLS_DIR)/jshint.js $(TOOLS_DIR)/jshint-cmdline.js < $(RESCUEFOX)

submodule:
	@@git submodule update --init --recursive
	@@git submodule status --recursive
