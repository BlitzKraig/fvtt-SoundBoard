// eslint-disable-next-line no-unused-vars
class SoundBoardHelp extends Application {
    
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.title = `❔${game.i18n.localize('SOUNDBOARD.app.help.title')}`;
        options.id = 'soundboard-help-app';
        options.template = 'modules/SoundBoard/templates/soundboardhelp.html';
        options.resizable = true;
        options.width = 400;
        options.height = 600;
        return options;
    }

    _onResize() {
        super._onResize();
        $('.yt-help-video').width($('.soundboard-help').width());
        $('.yt-help-video').height(($('.soundboard-help').width() / 16) * 9);
        
    }
    // TODO Localization
    getData() {
        let helpItems = [{title:'General Usage', body:`<p><b>SoundBoard by Blitz</b> is designed to enhance and simplify on-the-fly sound effects for a GM</p>
            <b>Features</b>
            <ul>
            <li>Bundled selection of sounds to use out of the box</li>
            <li>Custom sounds
            <ul><li>Add your own sound collection to the board by setting up the directory in Module Settings</li></ul>
            </li>
            <li>Broadcast sounds to all connected players</li>
            <li>Target single player and broadcast sounds
            <ul><li>Use the Target Player button in the toolbar</li></ul>
            </li>
            <li>Preview sounds before broadcasting
            <ul><li>Right click to play a sound without broadcasting</li></ul>
            </li>
            <li>Force sound caching before broadcasting
            <ul><li>Use the Cache Mode button in the toolbar to force connected players to load and cache a sound without playing, allowing instant playback later</li></ul>
            </li>
            <li>Loop sounds with optional delay</li>
            <li>Fully searchable</li>
            <li>Favoriting</li>
            <li>Simple journal embeds
            <ul><li>Prepare scenes ahead of time! Use the Macro Mode button in the toolbar while a journal entry is being actively edited to instantly link a sound in the journal.</li></ul>
            </li>
            <li>Wildcard sounds, linking multiple sounds to a single button</li>
            <li>Automatic macro creation
            <ul><li>Use the Macro Mode button in the toolbar to instantly create a macro for a sound</li></ul>
            </li>
            <li>Simple macro API to use sounds in your own macros</li>
            </ul>
            <h3>Demo Video</h3>
            <h4>Coming Soon</h4>`},
        {title:'Setting Up Custom Audio', body:`<b style="color:red !important; text-decoration: underline !important;">DO NOT PLACE YOUR CUSTOM AUDIO ANYWHERE INSIDE THE MODULE DIRECTORY OR IT <i>WILL</i> BE LOST WHEN THE MODULE UPDATES!</b>
            <p></p>
            <p>Custom Audio must exist in a very specific directory structure. This structure can be viewed in the exampleAudio folder inside the module.</p>
            <h3>Directory Structure</h3>
            <ol>
            <li>Create a directory in your User Data to hold your sounds</li>
            <li>Inside that directory, create a directory for each Category you wish to use</li>
            <ul><li>For example, 'Battle Sounds', 'Animals' etc.</li></ul>
            <li>Inside each of these category directories, place your audio files</li>
            <ul><li>You can place another directory inside the category directories in order to create a Wildcard Sound. To do this, create a directory with the sound name you wish to use, then fill that directory with all of the possible wildcard audio files.</li></ul>
            </ol>
            <h3>Module Settings</h3>
            <p>Once you have set up your directory structure, go to the modules settings and change them to reference your new directory.</p>
            <p>Be sure to check the Source Type if you are hosting via an S3 bucket or The Forge.</p>
            <p>When you save your settings, Foundry should refresh. You should now see your custom audio inside the SoundBoard.</p>`},
        {title:'Favoriting Sounds', body:`<p>To favorite a sound, click the 3 dots on the right side of a sound button, then click the Favorite Star <i class="far fa-star"></i></p>
            <p>The button border should turn yellow, indicating that the sound is now favorited.</p>
            <p>To unfavorite a sound, click the 3 dots on the right side of a favorited sound button, then click the Unfavorite Star <i class="fas fa-star"></i></p>
            <p>Once a sound is favorited, it will appear in the Favorite Sounds board</p>`},
        {title:'Looping Sounds', body:`<p>To loop a sound, click the 3 dots on the right side of a sound button, then click the Loop Sound icon <i class="fas fa-sync-alt "></i></p>
            <p>The button should start flashing green, indicating that the sound is now looping.</p>
            <p>Click the sound button again to stop looping. The final loop will play, then the sound will stop.</p>`},
        {title:'Delayed Loop', body:`<p>You can start looping a sound with a delay between loops by clickin the 3 dots on the right side of a sound button, then clicking the Delayed Loop Sound icon <i class="fas fa-history"></i></p>
            <p>A context-style menu will appear with preset times. Click one of these times to start the loop with a delay</p>
            <p>Alternatively, you can set your own time by typing a number into the input field at the bottom of the context menu, then clicking the 's' next to it.</p>
            <p>To stop a delayed loop, simply click the flashing sound button</p>`},
        {title:'Modifier Keys', body:`
            <p>Modifier Keys can be used to quickly perform some functions in the SoundBoard.</p>
            <p>Hold down a modifier key and click a sound button to perform the following functions:</p>
            <ul>
            <li>Shift - Start Loop</li>
            <li>ALT - Favorite/Unfavorite Sound</li>
            <li>Control/Command - Stop single sound immediately</li>
            </ul>`},
        {title:'Controlling Volume', body:`<p>The volume slider at the bottom right of the SoundBoard controls the volume of the sounds, including the broadcast volume. Changing this will affect how loud the sound is for your players.</p>
            <p>All players can also individually change their Interface volume in the Playlists sidebar to change the overall volume of the SoundBoard.</p>`},
        {title:'Stopping Sounds', body:`<p>A big red 'Stop' button at the bottom left of the SoundBoard will immediately stop all playing sounds, and send a signal to connected players machines to also stop their audio.</p>
            <p>To stop a looping sound, simply click the flashing green sound button.</p>
            <p>To immediately stop any single sound, hold Control/Command and click the sound button</p>`},
        {title:'Targeting a player', body:`<p>Player Targeting Mode can be activated by pressing the Target Player button in the toolbar.</p>
            <p>
            <button style="width: 40px;
            height: 26px;
            line-height: 0;
            padding: 0;"
            type="button" class="btn btn-secondary toolbar-btn ">
                <i class="fas fa-users"></i>
            </button></p>
            <p>A context menu will appear, displaying all currently connected players except the GM. Click a player name to begin targeting only that player.</p>
            <p>When you broadcast a sound with targeting active, only the chosen player and the GM will hear it.</p>
            <p>To disable targeting mode, click the Target Player button again and select 'Everyone'</p>`},
        {title:'Caching Mode', body:`
            <p>Caching Mode can be activated by clicking the Toggle Cache Mode button in the toolbar.</p>
            <p><button style="width: 40px;
            height: 26px;
            line-height: 0;
            padding: 0;"
            type="button" class="btn btn-secondary toolbar-btn">
                <i class="fas fa-cloud-download-alt"></i>
            </button></p>
            <p>When active, the button will turn green.</p>
            <p>Click a sound while Caching Mode is active to force all connected players to load and cache the audio instead of playing it.</p>
            <p>This allows the GM to ensure all players will hear the sound at the same time when it is triggered, regardless of connection speed.</p>
            <p>The GM will receive a notification once caching is completed for each player.</p>`},
        {title:'Macro Mode & Journal Links', body:`
            <p>Macro Mode can be activated by clicking the Toggle Macro Mode button in the toolbar.</p>
            <p><button style="width: 40px;
            height: 26px;
            line-height: 0;
            padding: 0;"
            type="button" class="btn btn-secondary toolbar-btn ">
            <i class="fas fa-file-code"></i>
          </button></p>
            <p>When active, the button will turn green.</p>
            <p>Click a sound while Macro Mode is active to instantly generate a macro to play that sound. The macro can be found in your Macros Directory.</p>
            <p>If you have a Journal Entry currently opened and in edit mode, clicking a sound with Macro Mode enabled will:</p>
            <ol>
            <li>Check if a macro already exists for that sound</li>
            <li>Generate a macro if it doesn't exist</li>
            <li>Insert a link to the macro in the active Journal Entry editor</li>
            <ul><li>The link will be inserted at the last known position of your text cursor, allowing you to type up some notes and instantly link to a sound.</li></ul>
            </ol>
            <p>Activating a macro, either directly or through a journal, will broadcast the sound through SoundBoard</p>
            <p>Holding Shift while activating the macro, either directly or through a journal, will force your players to load and cache the sound instead of playing it.</p>
            <p>This works in the same way as Caching Mode, allowing the GM to preload sounds so all of their players will hear them at the same time when they are played.</p>
            `},
        {title:'Refreshing Sounds', body:`
            <p>The Refresh toolbar button can be activated to scan for changes in your SoundBoard directory.</p>
            <p><button style="width: 40px;
            height: 26px;
            line-height: 0;
            padding: 0;"
            type="button" class="btn btn-secondary toolbar-btn">
                <i class="fas fa-sync-alt"></i>
            </button></p>
            <p>SoundBoard will immediately scan for changes, then re-render the open application, allowing you to add new sounds without needing to refresh your browser.</p>
            `},
        {title:'Delete Macros', body:`
            <p>The Delete Macros toolbar button can be clicked to remove all SoundBoard generated macros from your Macro Directory.</p>
            <p><button style="width: 40px;
            height: 26px;
            line-height: 0;
            padding: 0;"
            type="button" class="btn btn-danger toolbar-btn">
            <i class="fas fa-bomb"></i>
            </button></p>
            <p>A dialog will appear, requiring confirmation to delete the macros. If accepted, all of the SoundBoard macros will be removed. They can be re-added using Macro Mode.</p>
            <p>Note that removing a macro will break any links to it in a Journal Entry.</p>
            `},
        {title:'Getting Help', body:`
            <p>The Help toolbar button can be clicked to bring you here...</p>
            <p><button style="width: 40px;
            height: 26px;
            line-height: 0;
            padding: 0;"
            type="button" class="btn btn-info toolbar-btn">
            <i class="far fa-question-circle"></i>
            </button></p>
            <p>Additionally, you can reach me on Discord at Blitz#6797, or create a ticket on the GitHub repo.</p>
            `},
        {title: 'Module Settings', body:`
            <h3>Custom Soundboard Directory</h3>
            <p>This should point to a directory containing your SoundBoard audio setup. See 'Setting Up Custom Audio' for more information</p>
            <h3>Source Type</h3>
            <p>Tells the Foundry Filepicker where your custom audio is.</p>
            <p>'Forge' should be selected if your server is Forge hosted, and your sounds are in your Forge Assets.</p>
            <p>'S3' should be selected if your audio is hosted in an AWS S3 bucket.</p>
            <p>For anything else, 'Data' should work.</p>
            <h3>Defocus Opacity</h3>
            <p>This controls the opacity of the SoundBoard when you don't have your mouse hovered over it. Useful if you'd like to see your scene underneat SoundBoard.</p>
            <h3>Random Detune Amount</h3>
            <p>Increase this value to randomly alter the pitch of sounds each time they are played.</p>
            <p>This can be useful to provide some variety in sounds that are played repeatedly.</p>
            `},
        {title: 'Bundled Sounds & Sound Packs', body:`
        <h3>Bundled Sounds</h3>
        <p>As of 1.4.0, SoundBoard's old Bundled Sounds have been moved into the <a href="https://github.com/BlitzKraig/fvtt-SoundBoard-BlitzFreePack">Blitz Free Pack</a> and the <a href="https://github.com/BlitzKraig/fvtt-SoundBoard-BlitzCommunityPack">Community Pack</a></p>
        <h3>Sound Packs</h3>
        <p>Sound Packs are small modules containing a collection of SoundBoard sounds. They can be installed and activated, and should instantly appear in your Bundled Sounds soundboard.</p>
        <p>You can enable and disable individual packs using the Package Manager, which can be accessed via the button at the top right of the SoundBoard</p>
        <p><button style="width: 40px;
            height: 26px;
            line-height: 0;
            padding: 0;"
            type="button" class="btn btn-secondary toolbar-btn ">
            <i class="fas fa-tasks"></i>
          </button></p>
        <p>Any module can provide sounds for SoundBoard to use as a Sound Pack. The sounds should be placed in the same directory structure as Custom Sounds, and some code should be called:</p>
        <ol>
        <li>Listen for the <code>SBPackageManagerReady</code> Hook</li>
        <li>Call <code>SoundBoard.packageManager.addSoundPack(packName, packDir, moduleName, {licenses, description, link, author});</code></li>
        <ul><li>The final object is optional, but recommended.</li>
        <li><code>licenses</code> should be an array of license objects, containing <code>licenseUrl, licenseType</code> and <code>licenseDescription</code>. See one of the sound packs linked above for an example.</li>
        </ul>
        </ol>
        <p>This approach allows users to create dedicated Sound Packs, or ship SoundBoard sounds with their existing modules, worlds and systems.</p>
        `}
        ];
        // Filepicker to get files from help-partials
        // readFromFile to read content to array
        // Pass content to help
        return {
            help: helpItems // Read all help files to an array, whack em into the help object.
        };
    }
}