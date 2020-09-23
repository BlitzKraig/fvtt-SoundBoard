# 1.1.2 - 2020/09/23

* Added new bundled sounds
    * Added chants for a vampire-based campaign for "The world's greatest roleplaying game"

# 1.1.1 - 2020/09/22

* Added basic Forge support

# 1.1.0 - 2020/09/19

* Added player-targetted sounds - Send sounds directly to a single player
* Added Whetstone support!
    * Added a customisable default theme
* Updated translation file for easier maintenance

# 1.0.0 - 2020/09/16

## The Headlines

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

# 0.2.2 - 2020/09/09

* Added more css rules to stop clobbering from a popular module
* Code refactor
* Added error handling for incorrect dirs

# 0.2.1 - 2020/09/08

* Bugfix - Filtering when a category is collapsed no longer breaks the UI
* UI Tweaks
* Added button to Playlists sidebar to open soundboard (tool button is also still there)
* Improved filtering - Now matches against all words split by spaces (eg. 'thun str' will match 'thunder strike', 'cloth rip' will match 'ripping cloth 2' etc.)
* Added 500ms timeout on filter search, should make larger soundboard a bit easier to filter
* Added collapse/expand all buttons

# 0.2.0 - 2020/09/07

* Added live filtering to soundboard
* Added 'wildcard' directories
    * Removed 'uncategorized' sounds. Sounds in the root dir will no longer appear in your soundboard

# 0.1.1 - 2020/09/07

* Added support for folders with spaces
* Tweaked CSS for better scrolling behaviour
* Added total sound count

# 0.1.0 - 2020/09/07

* Added bootstrap styling
* Added collapsible categories
* Added category count
* Added right-click preview sound
* Added in-line volume slider
* Removed client volume. Use the Playlists "Interface" volume to tweak client-side

# 0.0.2 - 2020/09/07

* Fixed minor typos
* Tweaked CSS
* Added translations for future changes

# 0.0.1 - 2020/09/06

* Initial Release