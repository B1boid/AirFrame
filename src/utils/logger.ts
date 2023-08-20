import {bot, ERROR_CHANNEL_ID, SUPER_SUCCESS_CHANNEL_ID, WARN_CHANNEL_ID} from "../telegram/bot";
import * as console from "console";
let Table = require("easy-table")

const ETHERSCAN_BASE_ADDRESS = "https://etherscan.io/address/"


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
}

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

    private log(type: LogType, msg: string): void {
        const message = this.getSpecifiedText(type, msg)
        console.log(message)
        console.log("-----------------------------")

        const channel = getChannel(type)
        if (channel) {
            bot.sendMessage(channel, message, {parse_mode: "MarkdownV2", disable_web_page_preview: true})
        }
    }

    protected getSpecifiedText(type: LogType, msg: string) {
        const t = new Table

        t.cell('Type', `*${type}*`)
        t.cell('Address', "*GLOBAL*")
        t.cell('Message', `\`${msg}\``)
        t.newRow()
        return t.printTransposed({separator: "|"})
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
        const t = new Table

        t.cell('Type', `*${type}*`)
        t.cell('Address', `[${this.address}](${ETHERSCAN_BASE_ADDRESS}/${this.address})`)
        t.cell('Message', `\`${msg}\``)
        t.newRow()
        return t.printTransposed()
    }

}

export const globalLogger: Logger = new Logger()