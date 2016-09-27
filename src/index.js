const osc = require('node-osc');
const fs = require('fs');
const transmit = require('./transmit');

// Load all the shows into memory
let showFiles = [
    './shows/scar.json'
];
let shows = {};
showFiles.forEach(file => {
    let show = JSON.parse(fs.readFileSync(file));
    shows[show.name] = show;
    console.log('Loaded show: ' + file.name);
});

let server = new osc.Server(12345, '127.0.0.1');
server.on('message', msg => {
    console.log(msg);
    let name = msg[0].split('/')[2];
    startShow(shows[name]);
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

