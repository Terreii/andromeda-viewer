# Tools

This directory contains tools used by the build process or complex scrips. They get ran with `npm run {script}`.

## Update scripts

This are scripts that will update some files.

### updateCaps

This script will fetch the newest list of capabilities and save them into `./src/actions/capabilities.json`.

It can be ran with `npm run update-caps`.

## Build scripts

Those are scripts part of the build process.

### createMessageTemplate

This script will parse `master_message_template.msg` and generate an JSON representation of it.

It is ran before `npm run build` and `npm run watch`.
