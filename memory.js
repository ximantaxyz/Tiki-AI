class Memory {
  constructor() {
    this.store = new Map();
  }

  getUserHistory(userId) {
    return this.store.get(userId) || [];
  }

  addMessage(userId, role, content) {
    if (!this.store.has(userId)) {
      this.store.set(userId, []);
    }

    const history = this.store.get(userId);

    history.push({ role, content });

    // limit memory (last 10 messages)
    if (history.length > 10) {
      history.shift();
    }
  }
}

module.exports = Memory;
