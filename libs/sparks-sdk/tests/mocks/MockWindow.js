class MockWindow {
  static windows = {};

  constructor(origin) {
    this.origin = origin;
    this.messageListeners = [];
    this.opener = null;
    MockWindow.windows[origin] = this;
  }

  open(origin, name, specs) {
    if (MockWindow.windows[origin]) {
      MockWindow.windows[origin].opener = this;
      return MockWindow.windows[origin];
    }
    this.name = name;
    this.origin = origin;
    return this;
  }

  addEventListener(event, callback) {
    if (event === 'message') {
      this.messageListeners.push(callback);
    }
  }

  removeEventListener(event, callback) {
    if (event === 'message') {
      const index = this.messageListeners.indexOf(callback);
      if (index !== -1) {
        this.messageListeners.splice(index, 1);
      }
    }
  }

  postMessage(message, origin) {
    if (origin === this.origin) {
      const event = {
        data: message,
        origin: this.origin,
        source: this,
      };
      this.messageListeners.forEach(callback => callback(event));
    }
  }
}

export default MockWindow;