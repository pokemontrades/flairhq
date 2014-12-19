require.config({

    // alias libraries paths
    paths: {
        'angular': '/js/dependencies/angular.min',
        'angular-md': '/js/dependencies/angular-md.min',
        'angular-spinner': '/js/dependencies/angular-spinner.min',
        'angular-ui-router': '/js/dependencies/angular-ui-router',
        'jquery': '/js/dependencies/jquery.min',
        "angular-bootstrap": '/js/dependencies/ui-bootstrap-tpls-0.10.0',
        "sails": "/js/dependencies/sails.io",
        "collapse": "/js/dependencies/collapse",
        "dropdown": "/js/dependencies/dropdown",
        "lodash": "/js/dependencies/lodash.min",
        "marked": "/js/dependencies/marked",
        "modal": "/js/dependencies/modal",
        "spin": "/js/dependencies/spin",
        "tab": "/js/dependencies/tab"
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