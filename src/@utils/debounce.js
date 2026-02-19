export function debounce(fn, delay = 500) {
    let timerId;

    return function (...args) {
      clearTimeout(timerId);
      timerId = setTimeout(() => fn.apply(this, args), delay);
    };
  }