#! /bin/sh

# Generate the bindings for TS <-> Rust

scriptLocation=$(readlink -f "$0")
startDir=$(dirname "$scriptLocation")

tauriBindingsDir="$startDir/src/tauriTypes"

# cd into src-tauri, set the export dir, and run the tests (which generates the bindings automatically)
cd "$startDir/src-tauri"
TS_RS_EXPORT_DIR="$tauriBindingsDir" cargo test
