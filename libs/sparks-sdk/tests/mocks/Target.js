export class MockTarget {
  constructor(origin, name, specs) {
    this.name = name;
    this.specs = specs;
    this.origin = origin;
    this.messageListeners = [];
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

  open(origin, name, specs) {
    return new MockTarget(origin, name, specs);
  }
}
