import {bot, ERROR_CHANNEL_ID, SUPER_SUCCESS_CHANNEL_ID, WARN_CHANNEL_ID} from "../telegram/bot";
import * as console from "console";


enum LogType {
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR",
    SUCCESS = "SUCCESS",
    SUPER_SUCCESS = "SUPER_SUCCESS"
}

function getChannel(type: LogType): string | null {
    switch (type) {
        case LogType.ERROR:
            return ERROR_CHANNEL_ID
        case LogType.WARN:
            return WARN_CHANNEL_ID
        case LogType.SUPER_SUCCESS:
            return SUPER_SUCCESS_CHANNEL_ID
        default:
            return null
    }
}

export interface ILogger {
    info(msg: string): void;
    warn(msg: string): void;
    error(msg: string): void;
    success(msg: string): void;
    done(msg: string): void;
    highGasPrice(price:  bigint | null): void;
}

const HIGH_GAS_PRICE_LOG_STEP = 100
class Logger implements ILogger{
    private highGasCounter = 0
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

    done(msg: string): void {
        this.log(LogType.SUPER_SUCCESS, msg)
    }

    highGasPrice(price: bigint | null) {
        if (this.highGasCounter % HIGH_GAS_PRICE_LOG_STEP === 0) {
            this.warn(`Gas price is too high | Gas price: ${price}`)
        }
        this.highGasCounter++
    }

    private log(type: LogType, msg: string): void {
        const message = this.getSpecifiedText(type, msg)
        console.log(message)

        const channel = getChannel(type)
        if (channel) {
            bot.sendMessage(channel, message)
        }
    }

    protected getSpecifiedText(type: LogType, msg: string) {
        return `${type} - GLOBAL - ${msg}`
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

    protected getSpecifiedText(type: LogType, msg: string): string {
        return `${type} - ${this.address} - ${msg}`
    }

}

export const globalLogger: Logger = new Logger()