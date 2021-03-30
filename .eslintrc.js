module.exports = {
    'env': {
        'browser': true,
        'commonjs': true,
        'es2021': true,
        'node': true,
        'jquery': true
    },
    'extends': [
        'eslint:recommended'
    ],
    'parser': 'babel-eslint',
    'parserOptions': {
        'ecmaFeatures': {
            'jsx': true
        },
        'ecmaVersion': 12
    },
    'globals': {
        'game': true,
        'ui': true,
        'keyboard': true,
        'SoundNode': true,
        'SoundBoard': true,
        'Howl': true,
        'Howler': true,
        'SBSocketHelper': true,
        'Macro': true,
        'Hooks': true,
        'Application': true,
        'SoundBoardApplication': true,
        'SoundBoardFavApplication': true,
        'SoundBoardBundledApplication': true,
        'SoundBoardHelp': true,
        'SBAudioHelper': true,
        'SBMacroHelper': true,
        'Dialog': true,
        'FilePicker': true,
        'Handlebars': true
    },
    'rules': {
        'indent': [
            'error',
            4
        ],
        'linebreak-style': [
            'error',
            'windows'
        ],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'always'
        ]
    }
};
