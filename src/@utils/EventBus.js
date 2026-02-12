export default function createEventBus() {
    const listeners = new Map(); // event -> Set(callback)
  
    return {
      on(event, cb) {
        if (!listeners.has(event)) listeners.set(event, new Set());
        listeners.get(event).add(cb);
        return () => listeners.get(event)?.delete(cb); // unsubscribe
      },
      emit(event, payload) {
        listeners.get(event)?.forEach((cb) => cb(payload));
      },
    };
  }
  