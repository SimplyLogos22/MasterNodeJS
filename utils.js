"use strict";

/* GetCurrenTime
 *
 * Should return the current time in milliseconds (ms)
 *
 */
function getCurrentTime() {
	return new Date().getTime()
}


function randomIntFromInterval(min,max)
{
	return Math.floor(Math.random()*(max-min+1)+min);
}

function isNumeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

module.exports = {
	getCurrentTime: getCurrentTime,
    randomIntFromInterval: randomIntFromInterval,
	isNumeric: isNumeric,
};
