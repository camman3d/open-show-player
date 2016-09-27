const outputs = require('./outputs');
const sendOsc = outputs.sendOsc;
const sendDmx = outputs.sendDmx;


module.exports = function transmit(tracks, prevTime, time) {
    tracks.forEach(track => {
        if (!track.enabled) {
            return;
        }
        if (track.type === 'osc' && prevTime !== undefined) {
            for (let point of track.points) {
                if (time < point.time) {
                    break;
                }
                if (point.time > prevTime && point.time <= time) {
                    console.log('osc');
                    sendOsc(track.output, point.path);
                }
            }
        }
        if (track.type === 'dmx') {
            for (let i=0; i < track.points.length - 1; i++) {
                let p1 = track.points[i];
                let p2 = track.points[i + 1];
                if (time < p1.time) {
                    break;
                }
                if (p1.time <= time && p2.time >= time) {
                    // Interpolate the value based on the time
                    let p = (time - p1.time) / (p2.time - p1.time);
                    let val = Math.round((1 - p) * p1.value + p * p2.value);
                    sendDmx(track.output, track.channel, val);
                }
            }
            let last = track.points[track.points.length - 1];
            if (last && time > last.time) {
                sendDmx(track.output, track.channel, last.value);
            }
        }
        if (track.type === 'color') {
            for (let i=0; i < track.points.length - 1; i++) {
                let p1 = track.points[i];
                let p2 = track.points[i + 1];
                if (time < p1.time) {
                    break;
                }
                if (p1.time <= time && p2.time >= time) {
                    // Interpolate the value based on the time
                    let p = (time - p1.time) / (p2.time - p1.time);
                    let value1 = getRgb(p1.color);
                    let value2 = getRgb(p2.color);
                    let r = Math.round((1 - p) * value1.r + p * value2.r);
                    let g = Math.round((1 - p) * value1.g + p * value2.g);
                    let b = Math.round((1 - p) * value1.b + p * value2.b);
                    sendDmx(track.output, track.channel, r);
                    sendDmx(track.output, track.channel + 1, g);
                    sendDmx(track.output, track.channel + 2, b);
                }
            }
            let last = track.points[track.points.length - 1];
            if (last && time > last.time) {
                let {r,g,b} = getRgb(last.color);
                sendDmx(track.output, track.channel, r);
                sendDmx(track.output, track.channel + 1, g);
                sendDmx(track.output, track.channel + 2, b);
            }
        }
    })
};