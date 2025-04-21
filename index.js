// index.js

const { exec } = require('child_process');
const path = require('path');
const { writeFileSync, unlinkSync } = require('fs');

let Service, Characteristic;

module.exports = (homebridge) => {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory('homebridge-tuya-garage', 'TuyaGarage', TuyaGarageAccessory);
};

function runPython(code, callback) {
  const filename = path.join('/tmp', `temp-tuya-${Date.now()}.py`);
  writeFileSync(filename, code);
  exec(`python3 ${filename}`, (err, stdout) => {
    try { unlinkSync(filename); } catch (_) {}
    callback(err, stdout);
  });
}

class TuyaGarageAccessory {
  constructor(log, config) {
    this.log = log;
    this.name = config.name;
    this.deviceId = config.deviceId;
    this.ip = config.ip;
    this.localKey = config.localKey;

    this.service = new Service.GarageDoorOpener(this.name);

    this.service.getCharacteristic(Characteristic.CurrentDoorState)
      .on('get', this.getCurrentState.bind(this));

    this.service.getCharacteristic(Characteristic.TargetDoorState)
      .on('set', this.setTargetState.bind(this))
      .on('get', this.getTargetState.bind(this));

    this.currentState = null;
    this.targetState = Characteristic.TargetDoorState.CLOSED;
    this.initialized = false;

    this.pollState(() => {
      this.initialized = true;
    });

    setInterval(() => this.pollState(), 10000);
  }

  buildScript(command) {
    return [
      "import tinytuya",
      "import json",
      "",
      `d = tinytuya.Device('${this.deviceId}', '${this.ip}', '${this.localKey}', version=3.4)`,
      command
    ].join('\n');
  }

  pollState(callback = () => {}) {
    const script = this.buildScript("data = d.status()\nprint(json.dumps(data))");
    runPython(script, (err, stdout) => {
      if (err) {
        this.log('Error getting status:', err);
        return callback();
      }

      let json;
      try {
        json = JSON.parse(stdout);
      } catch (e) {
        this.log('⚠️ Could not parse device response as JSON:', stdout.trim());
        return callback();
      }

      const value = json.dps && json.dps['104'];
      if (typeof value === 'number') {
        const position = parseInt(value);

        if (position === 0) {
          this.currentState = Characteristic.CurrentDoorState.CLOSED;
        } else if (position === 100) {
          this.currentState = Characteristic.CurrentDoorState.OPEN;
        } else {
          this.currentState = Characteristic.CurrentDoorState.STOPPED;
        }

        this.service.updateCharacteristic(Characteristic.CurrentDoorState, this.currentState);
        this.service.updateCharacteristic(Characteristic.TargetDoorState, this.currentState === Characteristic.CurrentDoorState.OPEN ? Characteristic.TargetDoorState.OPEN : Characteristic.TargetDoorState.CLOSED);
      } else {
        this.log("⚠️ Unexpected or missing '104' value in DPS payload:", json);
      }

      callback();
    });
  }

  getCurrentState(callback) {
    callback(null, this.currentState ?? Characteristic.CurrentDoorState.STOPPED);
  }

  getTargetState(callback) {
    callback(null, this.targetState);
  }

  setTargetState(value, callback) {
    const command = value === Characteristic.TargetDoorState.OPEN
      ? "d.set_status(True, 101)"
      : "d.set_status(True, 102)";

    runPython(this.buildScript(command), (err) => {
      if (err) {
        this.log('Error executing control command:', err);
        return callback(err);
      }

      this.targetState = value;
      this.service.updateCharacteristic(Characteristic.TargetDoorState, value);
      this.service.updateCharacteristic(
        Characteristic.CurrentDoorState,
        value === Characteristic.TargetDoorState.OPEN
          ? Characteristic.CurrentDoorState.OPENING
          : Characteristic.CurrentDoorState.CLOSING
      );

      setTimeout(() => this.pollState(), 20000);
      callback(null);
    });
  }

  getServices() {
    return [this.service];
  }
}
