'use strict';

const osc = require('node-osc');
const fs = require('fs');
const transmit = require('./transmit');

// Load all the shows into memory
let showFiles = [
    './shows/barker0.json',
    './shows/barker1.json',
    './shows/friends.json',
    './shows/green.json',
    './shows/murray.json',
    './shows/murray2.json',
    './shows/nuke.json',
    './shows/orange.json',
    './shows/pumpkin.json',
    './shows/pumpkin2.json',
    './shows/purple.json',
    './shows/scar.json',
];
let shows = {};
showFiles.forEach(file => {
    let show = JSON.parse(fs.readFileSync(file));
    shows[show.name] = show;
    console.log('Loaded show: ' + show.name);
});

console.log('Starting OSC server on port 12345');
let server = new osc.Server(12345, '127.0.0.1');
server.on('message', msg => {
    console.log('Recieved OSC message:', msg);
    let name = msg[0].split('/')[2];
    if (!shows[name]) {
        console.warn('Show not loaded:', name);
    } else {
        startShow(shows[name]);
    }
});

function startShow(show) {
    console.log('Starting show: ' + show.name);
    
    let time = 0;
    let prevTimestamp = new Date().getTime();
    let interval = setInterval(() => {
        let newTimestamp = new Date().getTime();
        let newTime = time + newTimestamp - prevTimestamp;
        transmit(show.tracks, time, newTime);
        time = newTime;
        prevTimestamp = newTimestamp;
        
        if (time >= show.duration) {
            console.log('Show finished: ' + show.name);
            clearInterval(interval);
        }
    }, 30);
    
}

if (process.argv.length === 3) {
    startShow(shows[process.argv[2]]);
}
