"use strict";


function PlayerStatistics(player) {
    this.player = player;

    this.statistics = {
        round: {
            frags: 0,
            bullets: {
                shots: 0,
                hits: 0,
            },
            grenades: {
                shots: 0,
                hits: 0,
            },
            powerups: 0,
            barriers: 0,
            invisibility: 0,
            movementSpeed: 0,
            attackSpeed: 0,
        },
        session: {
            frags: 0,
            deaths: 0,
            bullets: {
                shots: 0,
                hits: 0,
            },
            grenades: {
                shots: 0,
                hits: 0,
            },
            barriers: 0,
            invisibility: 0,
            movementSpeed: 0,
            attackSpeed: 0,
            powerups: 0,
        },
        ping: 0,
    };
}
PlayerStatistics.prototype.constructor = PlayerStatistics;

module.exports = PlayerStatistics;

PlayerStatistics.prototype.addPowerup = function() {
    this.statistics.round.powerups += 1;
    this.statistics.session.powerups += 1;
}


PlayerStatistics.prototype.addGrenadeShot = function() {
    this.statistics.round.grenades.shots += 1;
    this.statistics.session.grenades.shots += 1;
}

PlayerStatistics.prototype.addGrenadetHit = function() {
    this.statistics.round.grenades.hits += 1;
    this.statistics.session.grenades.hits += 1;
}


PlayerStatistics.prototype.addBulletShot = function() {
    this.statistics.round.bullets.shots += 1;
    this.statistics.session.bullets.shots += 1;
}
PlayerStatistics.prototype.addBulletHit = function() {
    this.statistics.round.bullets.hits += 1;
    this.statistics.session.bullets.hits += 1;
}

PlayerStatistics.prototype.addBarrierShot = function() {
    this.statistics.round.barriers += 1;
    this.statistics.session.barriers += 1;
}
PlayerStatistics.prototype.addMovementSpeed = function() {
    this.statistics.round.movementSpeed += 1;
    this.statistics.session.movementSpeed += 1;
}
PlayerStatistics.prototype.addAttackSpeed = function() {
    this.statistics.round.attackSpeed += 1;
    this.statistics.session.attackSpeed += 1;
}
PlayerStatistics.prototype.addInvisibility = function() {
    this.statistics.round.invisibility += 1;
    this.statistics.session.invisibility += 1;
}

PlayerStatistics.prototype.addFrag = function() {
    this.statistics.round.frags += 1;
    this.statistics.session.frags += 1;
}

PlayerStatistics.prototype.addDeath = function() {
    this.statistics.session.deaths += 1;
}

PlayerStatistics.prototype.addPing = function(ping) {
    this.statistics.ping = ping;
}


PlayerStatistics.prototype.resetRound = function() {
    this.statistics.round.frags = 0;
    this.statistics.round.bullets.shots = 0;
    this.statistics.round.bullets.hit = 0;
    this.statistics.round.grenades.shots = 0;
    this.statistics.round.grenades.hits = 0;
    this.statistics.round.barriers = 0;
    this.statistics.round.invisibility = 0;
    this.statistics.round.movementSpeed = 0;
    this.statistics.round.attackSpeed = 0;
    this.statistics.round.powerups = 0;

}

PlayerStatistics.prototype.getStatistics = function(type) {
    if (type == 'all') {
        return this.statistics;
    } else if (type == 'round') {
        return this.statistics.round;
    } else if (type == 'session') {
        return this.statistics.session;
    }
}
