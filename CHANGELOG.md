# SoundBoard Changelog

## 1.3.0 - 2021/03/30

### New Features & Enhancements

* Updated version compatibility
  * SoundBoard now works with 0.8.1
  * 0.6.x and 0.7.x are still supported
* Added macro-mode
  * New toolbar button
  * Instantly generate a macro to play a sound
    * If a macro for that sound already exists, it will not be re-generated
  * Shift-clicking the macro will preload the sound for players
  * `SoundBoard.playSoundByName('Sound Name');` can be used for custom macros.
    * Case should not matter
    * Multiple sounds with the same name will cause issues
* Added journal embeds via macro-mode
  * Using macro-mode when a Journal Entry is being edited will instantly link the sound in the Journal Entry
    * If a macro for that sound already exists, it will be automatically grabbed from your macros directory and inserted into the journal entry
  * Shift-clicking the embed will preload the sound for players
  * Left clicking the embed will play the sound
* Added random detune options
  * Randomly modulate the pitch each time a sound is played, providing some variation for repeated sounds
  * Works best on 0.8.1+, but has been backported to work for 0.6.x and 0.7.x
  * Change the detune amount in module settings
  * Can be disabled by setting to 0
* Wildcard sounds never play the same sound twice in a row
* Updated sound search layout (Thanks Calego)
* Added inactive opacity options
  * SoundBoard will turn semi-transparent when not moused-over, allowing you to see your scene below the board
  * Change amount in module settings
  * Can be disabled by setting to 1
* Added help app
  * New tooblar button
  * Loads of information about using SoundBoard
* Added Refresh Sounds toolbar button
  * Detect any changes in your SoundBoard audio directory and refresh the SoundBoard without requiring a Foundry refresh
* Added warning for users still using the exampleAudio directory
  * Don't do that, you'll lose all your stuff.
* Added delete all SoundBoard macros toolbar button

### Fixes

* Cleaned up CSS
* Fixed some CSS rules to ensure important properties are kept
* Added missing div closing tag
* Improved parsing & name formatting performance
* Moved playlists Open Soundboard button to the top of the Playlists directory
* Fixed custom time input rendering (Delayed loop)

### Localisation & Other

* Updated Spanish localisation
* Added Japanese localisation (Slightly outdated)
* Added Manifest+
* Added BugReporter
* General code tidy

## 1.2.0 - 2021/03/21

* Removed interface slider text override
* Added Spanish translation
* Fixed nullpointer on 'fresh' worlds with no playlist audio
* Added .oga file support
* Added volume changing for sounds already playing
* Updated CSS to play nicer with some systems
* Improved filename parsing and formatting
* Added ability to stop single sounds (CTRL + click)
* Added instant looping (Shift + click)
* Added instant fav/unfav (Alt + click)

## 1.1.10 - 2020/11/15

* Added many new sounds, recorded and donated by Rive247

## 1.1.9 - 2020/11/10

* Added Naval Warfare sounds, donated by powerkor

## 1.1.8 - 2020/11/09

* 0.7 compat update

## 1.1.7 - 2020/10/28

* Rerouted soundboard via custom GainNode

## 1.1.6 - 2020/10/12

* Fixed support for S3 buckets

## 1.1.5 - 2020/10/10

* Added try/catch block around name formatter, to prevent fatal error if name cannot be fully parsed and formatted
* Added new applause SFX for the League of Extraordinary Foundry Developers awards stream

## 1.1.4 - 2020/10/01

* Added S3 support

## 1.1.3 - 2020/09/29

* Added new bundled sounds
  * Added muffled "ancient land" chants
* Added pre-cache toolbar button. Activate pre-cache mode and click a sound to force all players to cache it without playing.
* Fixed box-shadow for favorited buttons

## 1.1.2 - 2020/09/23

* Added new bundled sounds
  * Added chants for a vampire-based campaign for "The world's greatest roleplaying game"

## 1.1.1 - 2020/09/22

* Added basic Forge support

## 1.1.0 - 2020/09/19

* Added player-targetted sounds - Send sounds directly to a single player
* Added Whetstone support!
  * Added a customisable default theme
* Updated translation file for easier maintenance

## 1.0.0 - 2020/09/16

### The Headlines

* Looping audio (supports wildcard audio, choosing a random sound each loop)
* Looping audio with a delay
* Favoriting audio
* Stop All Sounds button. Stop currently playing sounds for all connected players without killing Playlist & other audio
* New Bundled board
* New Favorites board

--

* Removed initial processing for non-gm users (faster player ready-time)
* Improved sound parsing speed
* Added option to use both bundled and custom sounds
* Added Favorites board
* Added Bundled board
* Added Bundled sounds (Initial version, not many sounds yet)
* Auto-collapse soundboard categories when using more than 2000 sounds
* Added Stop button to stop all SoundBoard sounds for all connected players, without killing playlists & other sounds
* Added more options per-sound
  * Favoriting sounds
  * Looping sounds
  * Looping sounds with a delay
* Added socket-based player for custom audio handling
  * Added stop all sounds button, without killing playlist audio
  * Linked client volume to "Interface" volume, renamed to "SoundBoard" or localized string
  * Support for new sound options
* Further tweaks and twiddles 🔧

## 0.2.2 - 2020/09/09

* Added more css rules to stop clobbering from a popular module
* Code refactor
* Added error handling for incorrect dirs

## 0.2.1 - 2020/09/08

* Bugfix - Filtering when a category is collapsed no longer breaks the UI
* UI Tweaks
* Added button to Playlists sidebar to open soundboard (tool button is also still there)
* Improved filtering - Now matches against all words split by spaces (eg. 'thun str' will match 'thunder strike', 'cloth rip' will match 'ripping cloth 2' etc.)
* Added 500ms timeout on filter search, should make larger soundboard a bit easier to filter
* Added collapse/expand all buttons

## 0.2.0 - 2020/09/07

* Added live filtering to soundboard
* Added 'wildcard' directories
  * Removed 'uncategorized' sounds. Sounds in the root dir will no longer appear in your soundboard

## 0.1.1 - 2020/09/07

* Added support for folders with spaces
* Tweaked CSS for better scrolling behaviour
* Added total sound count

## 0.1.0 - 2020/09/07

* Added bootstrap styling
* Added collapsible categories
* Added category count
* Added right-click preview sound
* Added in-line volume slider
* Removed client volume. Use the Playlists "Interface" volume to tweak client-side

## 0.0.2 - 2020/09/07

* Fixed minor typos
* Tweaked CSS
* Added translations for future changes

## 0.0.1 - 2020/09/06

* Initial Release
