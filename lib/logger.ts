export const logger = {
  info: (msg: string, data?: unknown) => {
    console.log(JSON.stringify({ level: 'info', msg, data, timestamp: new Date().toISOString() }));
  },
  warn: (msg: string, data?: unknown) => {
    console.warn(JSON.stringify({ level: 'warn', msg, data, timestamp: new Date().toISOString() }));
  },
  error: (msg: string, data?: unknown) => {
    console.error(JSON.stringify({ level: 'error', msg, data, timestamp: new Date().toISOString() }));
  },
  debug: (msg: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(JSON.stringify({ level: 'debug', msg, data, timestamp: new Date().toISOString() }));
    }
  },
};
