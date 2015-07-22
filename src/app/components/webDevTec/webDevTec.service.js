class WebDevTecService {
    constructor() {
        'ngInject';

        this.data = [
            {
                'title': 'AngularJS',
                'url': 'https://angularjs.org/',
                'description': 'HTML enhanced for web apps!',
                'logo': 'angular.png'
            },
            {
                'title': 'BrowserSync',
                'url': 'http://browsersync.io/',
                'description': 'Time-saving synchronised browser testing.',
                'logo': 'browsersync.png'
            },
            {
                'title': 'GulpJS',
                'url': 'http://gulpjs.com/',
                'description': 'The streaming build system.',
                'logo': 'gulp.png'
            },
            {
                'title': 'Jasmine',
                'url': 'http://jasmine.github.io/',
                'description': 'Behavior-Driven JavaScript.',
                'logo': 'jasmine.png'
            },
            {
                'title': 'Karma',
                'url': 'http://karma-runner.github.io/',
                'description': 'Spectacular Test Runner for JavaScript.',
                'logo': 'karma.png'
            },
            {
                'title': 'Protractor',
                'url': 'https://github.com/angular/protractor',
                'description': 'End to end test framework for AngularJS applications built on top of WebDriverJS.',
                'logo': 'protractor.png'
            },
            {
                'title': 'Bootstrap',
                'url': 'http://getbootstrap.com/',
                'description': 'Bootstrap is the most popular HTML, CSS, and JS framework for developing responsive, mobile first projects on the web.',
                'logo': 'bootstrap.png'
            },
            {
                'title': 'Angular UI Bootstrap',
                'url': 'http://angular-ui.github.io/bootstrap/',
                'description': 'Bootstrap components written in pure AngularJS by the AngularUI Team.',
                'logo': 'ui-bootstrap.png'
            },
            {
                'title': 'Sass (Node)',
                'url': 'https://github.com/sass/node-sass',
                'description': 'Node.js binding to libsass, the C version of the popular stylesheet preprocessor, Sass.',
                'logo': 'node-sass.png'
            },
            {
                'title': 'ES6 (Babel formerly 6to5)',
                'url': 'https://babeljs.io/',
                'description': 'Turns ES6+ code into vanilla ES5, so you can use next generation features today.',
                'logo': 'babel.png'
            }
        ];
    }

    getTec() {
        return this.data;
    }
}

export default WebDevTecService;
