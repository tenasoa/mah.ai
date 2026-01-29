// Simple global store for message count
let globalUnreadCount = 0;
let listeners: ((count: number) => void)[] = [];

export const messageStore = {
  getCount: () => globalUnreadCount,
  setCount: (count: number) => {
    console.log('Setting message count to:', count);
    globalUnreadCount = count;
    listeners.forEach(listener => listener(count));
  },
  decrement: () => {
    if (globalUnreadCount > 0) {
      const newCount = globalUnreadCount - 1;
      console.log('Decrementing message count from', globalUnreadCount, 'to', newCount);
      globalUnreadCount = newCount;
      listeners.forEach(listener => listener(newCount));
    } else {
      console.log('Cannot decrement, count is already 0');
    }
  },
  increment: () => {
    const newCount = globalUnreadCount + 1;
    console.log('Incrementing message count from', globalUnreadCount, 'to', newCount);
    globalUnreadCount = newCount;
    listeners.forEach(listener => listener(newCount));
  },
  subscribe: (listener: (count: number) => void) => {
    console.log('New subscriber added');
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }
};
