/**
 * PS3 BUZZ! Controller Driver (WebHID + Gamepad API + Toetsenbord)
 * Ondersteunt:
 * - Sony PS3 Draadloze Buzz! USB Dongle (VID 0x054C, PID 0x1000)
 * - Sony PS2/PS3 Bedrade Buzz! Controllers (VID 0x054C, PID 0x0002)
 * - Gamepad API (automatische herkenning indien ondersteund door OS/browser)
 * - Toetsenbord sneltoetsen voor 4 spelers
 * - LED-sturing op de rode Buzz! knoppen via WebHID Output Reports
 */
class BuzzControllerDriver {
  constructor() {
    this.hidDevice = null;
    this.listeners = new Set();
    this.rawListeners = new Set();
    this.statusListeners = new Set();

    // Huidige knopstatus: 4 spelers x 5 knoppen
    this.state = Array.from({ length: 4 }, () => ({
      red: false,
      blue: false,
      orange: false,
      green: false,
      yellow: false
    }));

    this.ledState = [false, false, false, false];
    this.gamepadIndex = null;
    this.gamepadLoopId = null;
    this.connectionMode = 'keyboard'; // 'webhid' | 'gamepad' | 'keyboard'
    this.deviceName = 'Toetsenbord / Muis';

    // Toetsenbord mapping per speler
    this.keyMap = {
      // Speler 1
      KeyQ: { p: 0, b: 'red' },
      Digit1: { p: 0, b: 'blue' },
      Digit2: { p: 0, b: 'orange' },
      Digit3: { p: 0, b: 'green' },
      Digit4: { p: 0, b: 'yellow' },
      // Speler 2
      KeyE: { p: 1, b: 'red' },
      Digit5: { p: 1, b: 'blue' },
      Digit6: { p: 1, b: 'orange' },
      Digit7: { p: 1, b: 'green' },
      Digit8: { p: 1, b: 'yellow' },
      // Speler 3
      KeyA: { p: 2, b: 'red' },
      KeyZ: { p: 2, b: 'blue' },
      KeyX: { p: 2, b: 'orange' },
      KeyC: { p: 2, b: 'green' },
      KeyV: { p: 2, b: 'yellow' },
      // Speler 4
      KeyP: { p: 3, b: 'red' },
      KeyU: { p: 3, b: 'blue' },
      KeyI: { p: 3, b: 'orange' },
      KeyO: { p: 3, b: 'green' },
      KeyK: { p: 3, b: 'yellow' }
    };

    this._bindKeyboard();
    this._bindGamepadEvents();
    this._tryAutoReconnectWebHID();
  }

  onPress(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  onRawState(callback) {
    this.rawListeners.add(callback);
    return () => this.rawListeners.delete(callback);
  }

  onStatusChange(callback) {
    this.statusListeners.add(callback);
    callback(this.getStatus());
    return () => this.statusListeners.delete(callback);
  }

  getStatus() {
    return {
      mode: this.connectionMode,
      deviceName: this.deviceName,
      webHidSupported: 'hid' in navigator,
      ledSupported: this.connectionMode === 'webhid' && !!this.hidDevice
    };
  }

  _notifyStatus() {
    const status = this.getStatus();
    this.statusListeners.forEach((cb) => cb(status));
  }

  _emitPress(playerIndex, button) {
    this.listeners.forEach((cb) => cb(playerIndex, button));
  }

  _updateButton(playerIndex, button, isPressed) {
    const prev = this.state[playerIndex][button];
    if (prev !== isPressed) {
      this.state[playerIndex][button] = isPressed;
      if (isPressed) {
        this._emitPress(playerIndex, button);
      }
      this.rawListeners.forEach((cb) => cb(this.state));
    }
  }

  /* ==================== WEB-HID (PS3/PS2 BUZZ! USB) ==================== */

  async _tryAutoReconnectWebHID() {
    if (!('hid' in navigator)) return;
    try {
      const devices = await navigator.hid.getDevices();
      const buzz = devices.find((d) => d.vendorId === 0x054c);
      if (buzz) {
        await this._openHidDevice(buzz);
      }
    } catch {
      // Negeer stille auto-reconnect fouten
    }
  }

  async connectWebHID(showAllDevices = false) {
    if (!('hid' in navigator)) {
      throw new Error('WebHID wordt niet ondersteund in deze browser. Gebruik Google Chrome of Microsoft Edge.');
    }

    const filters = showAllDevices
      ? []
      : [
          { vendorId: 0x054c, productId: 0x1000 }, // PS3 Wireless Buzz!
          { vendorId: 0x054c, productId: 0x0002 }, // PS2/PS3 Wired Buzz!
          { vendorId: 0x054c } // Overige Sony Buzz! varianten
        ];

    const devices = await navigator.hid.requestDevice({ filters });
    if (!devices || devices.length === 0) {
      return false;
    }

    await this._openHidDevice(devices[0]);
    return true;
  }

  async _openHidDevice(device) {
    if (this.hidDevice && this.hidDevice !== device && this.hidDevice.opened) {
      await this.hidDevice.close().catch(() => {});
    }

    this.hidDevice = device;
    if (!device.opened) {
      await device.open();
    }

    device.addEventListener('inputreport', (event) => this._handleHidInputReport(event));

    navigator.hid.addEventListener('disconnect', (event) => {
      if (event.device === this.hidDevice) {
        this.hidDevice = null;
        this.connectionMode = this.gamepadIndex !== null ? 'gamepad' : 'keyboard';
        this.deviceName = this.gamepadIndex !== null ? 'Gamepad / Buzz! Controller' : 'Toetsenbord / Muis';
        this._notifyStatus();
      }
    });

    this.connectionMode = 'webhid';
    this.deviceName = device.productName || 'Sony PS3 Buzz! Controller';
    this._notifyStatus();
  }

  /**
   * Parseert het standaard 5-byte (of 6+ byte) Sony Buzz! HID input report.
   * Standaard hid-sony bit-packing (vanaf byte 2):
   * Byte 2: P1(Red:0x01, Yel:0x02, Grn:0x04, Org:0x08, Blu:0x10), P2(Red:0x20, Yel:0x40, Grn:0x80)
   * Byte 3: P2(Org:0x01, Blu:0x02), P3(Red:0x04, Yel:0x08, Grn:0x10, Org:0x20, Blu:0x40), P4(Red:0x80)
   * Byte 4: P4(Yel:0x01, Grn:0x02, Org:0x04, Blu:0x08)
   */
  _handleHidInputReport(event) {
    const { data } = event;
    if (!data || data.byteLength < 5) return;

    const bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    // Sommige Windows HID drivers zetten Report ID (0x00) of status (0x7F) vooraan
    // Standaard Sony Buzz: bytes[0]=0x7F/0x00, bytes[1]=0x7F/0x00, bytes[2..4]=knoppen
    const b2 = bytes[2] || 0;
    const b3 = bytes[3] || 0;
    const b4 = bytes[4] || 0;

    // Speler 1
    this._updateButton(0, 'red', (b2 & 0x01) !== 0);
    this._updateButton(0, 'yellow', (b2 & 0x02) !== 0);
    this._updateButton(0, 'green', (b2 & 0x04) !== 0);
    this._updateButton(0, 'orange', (b2 & 0x08) !== 0);
    this._updateButton(0, 'blue', (b2 & 0x10) !== 0);

    // Speler 2
    this._updateButton(1, 'red', (b2 & 0x20) !== 0);
    this._updateButton(1, 'yellow', (b2 & 0x40) !== 0);
    this._updateButton(1, 'green', (b2 & 0x80) !== 0);
    this._updateButton(1, 'orange', (b3 & 0x01) !== 0);
    this._updateButton(1, 'blue', (b3 & 0x02) !== 0);

    // Speler 3
    this._updateButton(2, 'red', (b3 & 0x04) !== 0);
    this._updateButton(2, 'yellow', (b3 & 0x08) !== 0);
    this._updateButton(2, 'green', (b3 & 0x10) !== 0);
    this._updateButton(2, 'orange', (b3 & 0x20) !== 0);
    this._updateButton(2, 'blue', (b3 & 0x40) !== 0);

    // Speler 4
    this._updateButton(3, 'red', (b3 & 0x80) !== 0);
    this._updateButton(3, 'yellow', (b4 & 0x01) !== 0);
    this._updateButton(3, 'green', (b4 & 0x02) !== 0);
    this._updateButton(3, 'orange', (b4 & 0x04) !== 0);
    this._updateButton(3, 'blue', (b4 & 0x08) !== 0);
  }

  /**
   * Stuurt de rode LED-lampjes op de 4 Buzz! controllers aan (alleen via WebHID).
   */
  async setLeds(states = [false, false, false, false]) {
    this.ledState = [...states];
    if (!this.hidDevice || !this.hidDevice.opened) return;

    const payload = new Uint8Array([
      0x00,
      states[0] ? 0xff : 0x00,
      states[1] ? 0xff : 0x00,
      states[2] ? 0xff : 0x00,
      states[3] ? 0xff : 0x00,
      0x00,
      0x00
    ]);

    try {
      await this.hidDevice.sendReport(0x00, payload);
    } catch {
      // Sommige USB-adapters accepteren 6 bytes zonder voorloop-0x00
      try {
        await this.hidDevice.sendReport(0x00, payload.slice(1));
      } catch {
        // Negeer als hardware geen LED output ondersteunt
      }
    }
  }

  async flashAllLeds(times = 3, intervalMs = 180) {
    for (let i = 0; i < times; i++) {
      await this.setLeds([true, true, true, true]);
      await new Promise((r) => setTimeout(r, intervalMs));
      await this.setLeds([false, false, false, false]);
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }

  /* ==================== GAMEPAD API FALLBACK ==================== */

  _bindGamepadEvents() {
    window.addEventListener('gamepadconnected', (e) => {
      const id = (e.gamepad.id || '').toLowerCase();
      if (id.includes('buzz') || e.gamepad.buttons.length >= 20) {
        this.gamepadIndex = e.gamepad.index;
        if (this.connectionMode !== 'webhid') {
          this.connectionMode = 'gamepad';
          this.deviceName = e.gamepad.id || 'Buzz! Gamepad';
          this._notifyStatus();
        }
        this._startGamepadLoop();
      }
    });

    window.addEventListener('gamepaddisconnected', (e) => {
      if (e.gamepad.index === this.gamepadIndex) {
        this.gamepadIndex = null;
        if (this.connectionMode === 'gamepad') {
          this.connectionMode = 'keyboard';
          this.deviceName = 'Toetsenbord / Muis';
          this._notifyStatus();
        }
      }
    });
  }

  _startGamepadLoop() {
    if (this.gamepadLoopId) return;
    const poll = () => {
      if (this.gamepadIndex !== null && this.connectionMode === 'gamepad') {
        const pads = navigator.getGamepads ? navigator.getGamepads() : [];
        const pad = pads[this.gamepadIndex];
        if (pad && pad.buttons.length >= 20) {
          const btnOrder = ['red', 'yellow', 'green', 'orange', 'blue'];
          for (let p = 0; p < 4; p++) {
            for (let b = 0; b < 5; b++) {
              const btn = pad.buttons[p * 5 + b];
              this._updateButton(p, btnOrder[b], !!(btn && btn.pressed));
            }
          }
        }
      }
      this.gamepadLoopId = requestAnimationFrame(poll);
    };
    this.gamepadLoopId = requestAnimationFrame(poll);
  }

  /* ==================== TOETSENBORD FALLBACK ==================== */

  _bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      const mapped = this.keyMap[e.code];
      if (mapped) {
        this._updateButton(mapped.p, mapped.b, true);
      }
    });

    window.addEventListener('keyup', (e) => {
      const mapped = this.keyMap[e.code];
      if (mapped) {
        this._updateButton(mapped.p, mapped.b, false);
      }
    });
  }
}

window.BuzzDriver = new BuzzControllerDriver();
