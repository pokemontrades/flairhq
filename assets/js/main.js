require.config({

    // alias libraries paths
    paths: {
        'angular': 'dependencies/angular.min',
        'angular-md': 'dependencies/angular-md.min',
        'angular-spinner': 'dependencies/angular-spinner.min',
        'angular-ui-router': 'dependencies/angular-ui-router',
        'jquery': 'dependencies/jquery.min',
        "angular-bootstrap": 'dependencies/ui-bootstrap-tpls-0.10.0',
        "sails": "dependencies/sails.io",
        "collapse": "dependencies/collapse",
        "dropdown": "dependencies/dropdown",
        "lodash": "dependencies/lodash.min",
        "marked": "dependencies/marked",
        "modal": "dependencies/modal",
        "spin": "dependencies/spin",
        "tab": "dependencies/tab"
    },

    // angular does not support AMD out of the box, put it in a shim
    shim: {
        'sails': {
            exports: 'io'
        },
        'angular': {
            exports: 'angular'
        },
        'spin': {
            exports: 'Spinner'
        },
        'lodash': {
            exports: "_"
        },
        'jquery': {
            exports: "$"
        },
        'angular-md': ['angular', 'marked'],
        'angular-spinner': ['angular', 'spin'],
        'angular-ui-router': ['angular'],
        'angular-bootstrap': ['angular'],
        'app': ['sails'],
        'modal': ['jquery'],
        'tab': ['jquery'],
        'collapse': ['jquery']
    }
});


require([
    'angular',
    'app',
    'marked',
    'ngReallyClick',
    'numberPadding',
    'collapse',
    'modal',
    'tab',
    'spin'
], function (angular, app, marked) {
    window.marked = marked;
    angular.bootstrap(document, ['fapp']);
});