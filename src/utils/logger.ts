export class Logger {
  private static instance: Logger;
  private isDevelopment = process.env.NODE_ENV === 'development';

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  info(message: string, ...args: unknown[]) {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]) {
    console.warn(`[WARN] ${message}`, ...args);
  }

  error(message: string, ...args: unknown[]) {
    console.error(`[ERROR] ${message}`, ...args);
  }

  debug(message: string, ...args: unknown[]) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();