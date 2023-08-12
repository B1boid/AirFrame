import * as console from "console";


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

class Logger implements ILogger{
    connect(address: string): ILogger {
        return new ConnectedLogger(address)
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

    protected log(type: LogType, msg: string): void {
        console.log(`${type} - GLOBAL - ${msg}`)
    }
}

export class ConnectedLogger extends Logger {
    private address: string

    constructor(address: string) {
        super();
        this.address = address
    }

    override connect(address: string): ILogger {
        this.address = address
        return this
    }

    protected override log(type: LogType, msg: string) {
        console.log(`${type} - ${this.address} - ${msg}`)
    }

}

export const globalLogger: Logger = new Logger()