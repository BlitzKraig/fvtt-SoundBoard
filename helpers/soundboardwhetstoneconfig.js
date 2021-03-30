Hooks.once('WhetstoneReady', () => {

    // register a default menu with Whetstone for configuration
    game.Whetstone.settings.registerMenu('SoundBoardDefault', 'SoundBoardDefault', {
        name: game.i18n.localize('WHETSTONE.ConfigureTheme'),
        label: game.i18n.localize('WHETSTONE.ConfigureTheme'),
        hint: game.i18n.localize('WHETSTONE.ConfigHint'),
        icon: 'fas fa-paint-brush',
        restricted: false
    });


    let wsVars = [{
        name: '--SoundBoard-loop-bg-from',
        default: '#01701c',
        type: 'color',
        title: 'loopbgfrom',
        hint: '',
        presets: 'palette'
    },
    {
        name: '--SoundBoard-loop-bg-to',
        default: '#1b291e',
        type: 'color',
        title: 'loopbgto',
        hint: 'loopbgto',
        presets: 'palette'
    },
    {
        name: '--SoundBoard-loop-animation-time',
        default: '1s',
        type: String,
        title: 'loopanimationtime',
        hint: 'loopanimationtime'
    },
    {
        name: '--SoundBoard-loop-active-icon-color',
        default: '#42e600',
        type: 'color',
        title: 'loopactiveiconcolor',
        hint: 'loopactiveiconcolor',
        presets: 'palette'
    },
    {
        name: '--SoundBoard-loop-text-color',
        default: '#ffffff',
        type: 'color',
        title: 'looptextcolor',
        hint: 'looptextcolor',
        presets: 'palette'
    },
    {
        name: '--SoundBoard-favorite-color',
        default: '#feeb20',
        type: 'color',
        title: 'favoritecolor',
        hint: 'favoritecolor',
        presets: 'palette'
    },
    {
        name: '--SoundBoard-text-shadow',
        default: '0 0 2px #000',
        type: String,
        title: 'textshadow',
        hint: 'textshadow'
    },
    {
        name: '--SoundBoard-more-button-active-color',
        default: '#969696',
        type: 'color',
        title: 'morebuttonactive',
        hint: 'morebuttonactive',
        presets: 'palette'
    },
    {
        name: '--SoundBoard-more-button-inactive-color',
        default: 'rgba(0, 0, 0, 04)',
        type: String,
        title: 'morebuttoninactive',
        hint: 'morebuttoninactive'
    },
    {
        name: '--SoundBoard-more-button-hover-color',
        default: '#dddddd',
        type: 'color',
        title: 'morebuttonhover',
        hint: 'morebuttonhover',
        presets: 'palette'
    },
    {
        name: '--SoundBoard-extended-options-bg',
        default: 'rgba(100, 100, 120, 0.94)',
        type: String,
        title: 'extendedoptionsbg',
        hint: 'extendedoptionsbg'
    },
    {
        name: '--SoundBoard-extended-options-icon-color',
        default: '#ffffff',
        type: 'color',
        title: 'extendedoptionsicon',
        hint: 'extendedoptionsicon',
        presets: 'palette'
    },
    {
        name: '--SoundBoard-btn-text-size',
        default: '1rem',
        type: String,
        title: 'btntextsize',
        hint: ''
    },
    {
        name: '--SoundBoard-toolbar-color',
        default: '#444444',
        type: 'color',
        title: 'toolbarcolor',
        hint: 'toolbarcolor',
        presets: 'palette'
    },
    {
        name: '--SoundBoard-toolbar-btn-active-color',
        default: '#01701c',
        type: 'color',
        title: 'toolbarbtnactivecolor',
        hint: 'toolbarbtnactivecolor',
        presets: 'palette'
    }
    ];

    wsVars = wsVars.map((el) => {
        if (el.title.length > 0) {
            el.title = `SOUNDBOARD.whetstone.var.${el.title}.title`;
        }
        if (el.hint.length > 0) {
            el.hint = `SOUNDBOARD.whetstone.var.${el.hint}.hint`;
        }
        return el;
    });

    // register a theme
    game.Whetstone.themes.register('SoundBoard', {
        id: 'SoundBoardDefault',
        name: 'SoundBoardDefault',
        title: game.i18n.localize('SOUNDBOARD.whetstone.theme.default.title'),
        description: game.i18n.localize('SOUNDBOARD.whetstone.theme.default.description'),
        version: '1.0.0',
        authors: [{
            name: 'Blitzkraig',
            contact: 'https://github.com/BlitzKraig/fvtt-SoundBoard',
            url: 'https://github.com/BlitzKraig/fvtt-SoundBoard'
        }],
        variables: wsVars,
        presets: {
            palette: {
                '#42e600': 'Vibrant Green',
                '#feeb20': 'Vibrant Yellow',
                '#01701c': 'Muted Green',
                '#1b291e': 'Darkened Green',
                '#ffffff': 'Pure White',
                '#dddddd': 'Lightest Grey',
                '#969696': 'Middlest Grey',
                '#444444': 'Darkest Grey'
            }
        },
        img: 'modules/SoundBoard/bundledDocs/default-theme-icon.png',
        preview: 'modules/SoundBoard/bundledDocs/default-theme-preview.png',
        systems: {
            'core': '0.6.6'
        }
    });
});