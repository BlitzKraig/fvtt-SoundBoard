# Sound Board by Blitz

![SoundBoard Release](https://github.com/BlitzKraig/fvtt-SoundBoard/workflows/SoundBoard%20Release/badge.svg)
![Latest Release Download Count](https://img.shields.io/github/downloads/BlitzKraig/fvtt-SoundBoard/latest/soundboard-release.zip)

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Q5Q01YIEJ)

## DO NOT PLACE YOUR CUSTOM SOUNDS IN THE MODULE DIRECTORY

Any sounds placed here will be deleted when the module updates.

----

Looking for collaborators - Hoping to build a decent library of sounds to bundle with the module to provide a nice starting point for users.
Anyone who is able to create or provide sound effects with the proper licensing, please contact me on Discord.

An easy-to-use soundboard for the GM.

## Using SoundBoard

Open your Ambient Sound Controls to find the button to open SoundBoard.

At the top right of the SoundBoard there's a blue button with a question mark. Click it for help and tips.

## Configuration

See the `exampleAudio/` directory in the module, and the default setup for an example.

Create a directory for your sounds, with a single subdirectory for each sound category.

Place your sounds in these folders. WAV, MP3 & OGG/OGA are supported.

Place another directory inside one of these category directories to create a 'Wildcard Sound'. Clicking these sounds will play a random selection from any sound files placed inside this directory

Sound effect names are generated from the file name. CamelCase, underscores and hyphens/dashes are all parsed, split and recapitalized to generate the sound name.

Open module settings and set the path pointing to your new soundboard directory

eg.

- soundboard/
  - battle/
    - swordhit.ogg
    - arrowwhizz.mp3
    - gunshot/
      - gunshot1.mp3
      - magnumfire.ogg
      - distantpistol.wav
  - tavern/
    - pour.ogg
    - laughter.ogg

Select the Ambient Sound Controls in Foundry, then the new Open Soundboard control

Note that the Volume slider on SoundBoard is a broadcasted-volume. Players will hear a louder/quieter sound when this is changed. Players should use their "Interface" volume in the Playlists sidebar to tweak the volume of soundboard if it's too quiet or too loud for them individually.

## Known issues / future improvements

File picker should be used in Module Settings to select the directory

Add option for non-gm users to use the soundboard

Option for per-sound volume levels

Option to save a "soundscape". All currently looping & delayed looping sounds linked to 1 button

## Troubleshooting

Please create a GitHub issue, or contact me on Discord at Blitz#6797

## Manifest

`https://raw.githubusercontent.com/BlitzKraig/fvtt-SoundBoard/master/module.json`

## Feedback

This module is open for feedback and suggestions! I would love to improve it and implement new features.

For bugs/feedback, create an issue on GitHub, or contact me on Discord at Blitz#6797

## [Release Notes](./CHANGELOG.md)

## Audio Attribution

Bundled Thunder sound effects from Mike Koenig, licensed under <https://creativecommons.org/licenses/by/3.0/>

All sounds have been modified from their originals.

-

'Bundled' SoundBoard sounds all royalty free, from the GDC Audio Bundles on sonniss.com

Cult Chant sounds recorded by me

Multiple sounds generously recorded and donated by Rive247

Multiple sounds generously donated by powerkor
