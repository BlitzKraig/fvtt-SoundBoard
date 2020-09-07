# Sound Board by Blitz

![SoundBoard Release](https://github.com/BlitzKraig/fvtt-SoundBoard/workflows/SoundBoard%20Release/badge.svg)
![Latest Release Download Count](https://img.shields.io/github/downloads/BlitzKraig/fvtt-SoundBoard/latest/soundboard-release.zip)

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Q5Q01YIEJ)

Looking for collaborators - Hoping to build a decent library of sounds to bundle with the module to provide a nice starting point for users.
Anyone who is able to create or provide sound effects with the proper licensing, please contact me on Discord.

An easy to use soundboard for the GM.

## Configuration

See the `audio/` directory in the module, and the default setup for an example.

Create a directory for your sounds, with a single subdirectory for each sound category.

Place your sounds in these folders. WAV, MP3 & OGG are supported.

Sounds in the parent directory will show up under Uncategorized.

Sound effect names are generated from the file name. CamelCase, underscores and hypens/dashes are all parsed, split and recapitalized to generate the sound name.

Open module settings and set the path pointing to your new soundboard directory

eg.


- soundboard/
    - uncategorized-scream.wav
    - battle/
        - swordhit.ogg
        - arrowwhizz.mp3
    - tavern/
        - pour.ogg
        - laughter.ogg

Select the Ambient Sound Controls in Foundry, then the new Open Soundboard control

Note that the Volume slider on SoundBoard is a broadcasted-volume. Players will hear a louder/quiter sound when this is changed. Players should use their "Interface" volume in the Playlists sidebar to tweak the volume of soundboard if it's too quiet or too loud for them individually.

## Known issues / future improvements

Currently no way to stop the sounds immediately (they will stop once the sound has finished playing). I hope to add a stop all button in future

File picker should be used in Module Settings to select the directory

Ability to add "wild-card" sounds, where a button press will play a random sound from a selection

Ability to play a random sound from a category

Add option to keep module library and add your own, instead of one-or-the-other

Add TabsV2

Add option for non-gm users to use the soundboard

## Troubleshooting

Please create a github issue, or contact me on Discord at Blitz#6797

## Manifest

`https://raw.githubusercontent.com/BlitzKraig/fvtt-SoundBoard/master/module.json`

## Feedback

This module is open for feedback and suggestions! I would love to improve it and implement new features.

For bugs/feedback, create an issue on GitHub, or contact me on Discord at Blitz#6797

## [Release Notes](./CHANGELOG.md)

## Audio Attribution

Bundled Thunder sound effects from Mike Koenig, licensed under https://creativecommons.org/licenses/by/3.0/

All sounds have been modified from their originals.

-

Other sound effects CC0 from https://freesound.org

