

enum LogType {
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR",
    SUCCESS = "SUCCESS"
}

export interface ILogger {
    info(msg: string): void;
    warn(msg: string): void;
    error(msg: string): void;
    success(msg: string): void;
}

export class ConsoleLogger implements ILogger {
    address: string
    constructor(address: string) {
        this.address = address
    }

    info(msg: string): void {
        this.log(LogType.INFO, msg)
    }

    warn(msg: string): void {
        this.log(LogType.WARN, msg)
    }

    error(msg: string): void {
        this.log(LogType.ERROR, msg)
    }

    success(msg: string): void {
        this.log(LogType.SUCCESS, msg)
    }

    private log(type: LogType, msg: string): void {
        console.log(`${type} - ${this.address} - ${msg}`)
    }
}

export const globalLogger: ILogger = new ConsoleLogger("GLOBAL")