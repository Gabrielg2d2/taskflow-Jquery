export class Task {
  constructor({ id, title, done = false, createdAt = Date.now() }) {
    this.id = id;
    this.title = title;
    this.done = done;
    this.createdAt = createdAt;
  }

  toggle() {
    return new Task({
      ...this,
      done: !this.done,
    });
  }

  updateTitle(newTitle) {
    return new Task({
      ...this,
      title: newTitle,
    });
  }

  toPlainObject() {
    return {
      id: this.id,
      title: this.title,
      done: this.done,
      createdAt: this.createdAt,
    };
  }

  static fromPlainObject(obj) {
    return new Task({
      id: obj.id,
      title: obj.title,
      done: obj.done ?? false,
      createdAt: obj.createdAt ?? Date.now(),
    });
  }
}
