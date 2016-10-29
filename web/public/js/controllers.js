'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
    controller('AppCtrl', function ($scope, $http) {

    }).
    controller('chamberListCtrl', function ($scope, $http, $timeout) {
        $scope.getData = function() {
            $http({
                method: 'GET',
                url: '/api/chambers'
            }).
            success(function (data, status, headers, config) {
                $scope.chambers = data.chambers;
            }).
            error(function (data, status, headers, config) {
                $scope.error = 'Error!';
            });
        }

        // Function to replicate setInterval using $timeout service.
        $scope.intervalFunction = function(){
            $timeout(function() {
                $scope.getData();
                $scope.intervalFunction();
            }, 5000)
        };

        // Kick off the interval
        $scope.intervalFunction();

        // And get the data
        $scope.getData();
    }).

    controller('playerHistoryViewCtrl', function ($scope, $http, $timeout) {
        $scope.getData = function() {
            $http({
                method: 'GET',
                url: '/api/playerHistory'
            }).
                success(function (data, status, headers, config) {
                    $scope.playerHistory = data.playerHistory;

                }).
                error(function (data, status, headers, config) {
                    $scope.error = 'Error!';
                });
        }

        // Function to replicate setInterval using $timeout service.
        $scope.intervalFunction = function(){
            $timeout(function() {
                $scope.getData();
                $scope.intervalFunction();
            }, 5000)
        };

        // Kick off the interval
        $scope.intervalFunction();

        // And get the data
        $scope.getData();
    })
;