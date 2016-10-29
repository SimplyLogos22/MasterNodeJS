'use strict';

// Declare app level module which depends on filters, and services

angular.module('myApp', [
    'ngRoute',
    'myApp.controllers',
    'myApp.filters',
    'myApp.services',
    'myApp.directives'
]).
    config(function ($routeProvider, $locationProvider) {
        $routeProvider.
            when('/', {
                templateUrl: 'partials/chamberList',
                controller: 'chamberListCtrl'
            }).
            when('/chamber/:name', {
                templateUrl: 'partials/playerList',
                controller: 'chamberViewCtrl'
            }).
            when('/playerHistory', {
                templateUrl: 'partials/playerHistory',
                controller: 'playerHistoryViewCtrl'
            }).
            otherwise({
                redirectTo: '/view1'
            });

        $locationProvider.html5Mode(true);
    });