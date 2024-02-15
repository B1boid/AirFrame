import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import {main} from "../main";
import {getAccountInfo} from "../builder/zksync_builder";
import {Blockchains, ethereumChain, zkSyncChain} from "../config/chains";
import {needToStop, setStop, setZkSyncKeepRandomAmount, getZkSyncKeepRandomAmount} from "../utils/utils";
import {allGases, setGasPriceLimit} from "../config/online_config";
let Table = require("easy-table")

dotenv.config()


const API_KEY = process.env.TELEGRAM_API_KEY!
export const ERROR_CHANNEL_ID = process.env.TELEGRAM_ERROR_CHANNEL_ID!
export const WARN_CHANNEL_ID = process.env.TELEGRAM_WARN_CHANNEL_ID!
export const SUPER_SUCCESS_CHANNEL_ID = process.env.TELEGRAM_SUPER_SUCCESS_CHANNEL_ID!
export const bot = new TelegramBot(API_KEY, {polling: true});


const MAX_TRIES = 10
let areAccsRunning = false

bot.onText(/\/run_active/, async (msg) => {
    if (msg.text === undefined) {
        bot.sendMessage(msg.chat.id, "Usage: /run_active <accs_password> <okx_password>")
        return
    }
    const passwords = msg.text.split(/\s+/).slice(1)
    if (passwords.length !== 2) {
        bot.sendMessage(msg.chat.id, "Usage: /run_active <accs_password> <okx_password>")
        return
    }

    if (areAccsRunning) {
        bot.sendMessage(msg.chat.id, "Accounts are already running. ")
        return
    }

    try {
        areAccsRunning = true
        await main(passwords[0], passwords[1])
    } catch {
        /* empty */
    } finally {
        areAccsRunning = false
        bot.sendMessage(msg.chat.id, "Accounts done.")
    }

})

bot.onText(/\/addr_info/, async (msg) =>  {
    if (msg.text === undefined) {
        bot.sendMessage(msg.chat.id, "Usage: /addr_info <address>")
        return
    }
    const args = msg.text!.split(/\s+/).slice(1)
    if (args.length !== 1) {
        bot.sendMessage(msg.chat.id, "Usage: /addr_info <address>")
        return
    }

    try {
        const info = await getAccountInfo(args[0], MAX_TRIES)
        if (info === null) {
            bot.sendMessage(msg.chat.id, `Failed to fetch info after ${MAX_TRIES} tries.`)
            return
        }

        const t = new Table

        t.cell('Address', `${info.walletAddress}`)
        t.cell(`[EthTxs](${ethereumChain.explorerUrl}/address/${info.walletAddress})`, `${info.ethTxs}`)
        t.cell(`[ZkTxs](${zkSyncChain.explorerUrl}/address/${info.walletAddress})`, `${info.zkTxs}`)
        t.cell('HasZkBridge', `\`${info.hasOffBridge}\``)
        t.newRow()

        bot.sendMessage(msg.chat.id, t.printTransposed().replaceAll(/[ \t]+/g, " ").substring(0, 4000),
            {parse_mode: "MarkdownV2", disable_web_page_preview: true})
    } catch (e) {
        bot.sendMessage(msg.chat.id, `Something went wrong. Try again. Exception: ${e}`)
        /* empty */
    }
})

bot.onText(/\/set_force_stop/, (msg) => {
    if (msg.text === undefined) {
        bot.sendMessage(msg.chat.id, "Usage: /set_force_stop <true|false>")
        return
    }

    const args = msg.text.split(/\s+/).slice(1)
    if (args.length === 0) {
        bot.sendMessage(msg.chat.id, "Usage: /set_force_stop <true|false>")
        return
    }

    switch (args[0]) {
        case "true":
            setStop(true)
            break
        case "false":
            setStop(false)
            break
        default:
            bot.sendMessage(msg.chat.id, `Wrong status. Expected: <true|false>. Found: ${args[0]}`)
            return
    }

    bot.sendMessage(msg.chat.id, `Successfully set status \`${args[0]}\` for force stop.`)
})

bot.onText(/\/get_force_stop/, (msg) => {
    bot.sendMessage(msg.chat.id, `${needToStop()}`)
})

bot.onText(/\/set_zk_sync_keep_balance/, (msg) => {
    if (msg.text === undefined) {
        bot.sendMessage(msg.chat.id, "Usage: /set_zk_sync_keep_balance <true|false>")
        return
    }

    const args = msg.text.split(/\s+/).slice(1)
    if (args.length === 0) {
        bot.sendMessage(msg.chat.id, "Usage: /set_zk_sync_keep_balance <true|false>")
        return
    }

    switch (args[0]) {
        case "true":
            setZkSyncKeepRandomAmount(true)
            break
        case "false":
            setZkSyncKeepRandomAmount(false)
            break
        default:
            bot.sendMessage(msg.chat.id, `Wrong status. Expected: <true|false>. Found: ${args[0]}`)
            return
    }

    bot.sendMessage(msg.chat.id, `Successfully set status \`${args[0]}\` for zk_sync_keep_balance.`)
})

bot.onText(/\/get_zk_sync_keep_balance/, (msg) => {
    bot.sendMessage(msg.chat.id, `${getZkSyncKeepRandomAmount()}`)
})

bot.onText(/\/set_gas_price_limit/, (msg) => {
    if (msg.text === undefined) {
        bot.sendMessage(msg.chat.id, "Usage: /set_gas_price_limit <chain> <limit>")
        return
    }

    const args = msg.text.split(/\s+/).slice(1)
    if (args.length < 2) {
        bot.sendMessage(msg.chat.id, "Usage: /set_gas_price_limit <chain> <limit>")
        return
    }

    let limit: number;

    if (Object.values(Blockchains).indexOf(args[0] as unknown as Blockchains) === -1) {
        bot.sendMessage(msg.chat.id, `Unknown chain: ${args[0]}.`)
        return
    }
    const chain: Blockchains  = args[0] as Blockchains

    try {
        limit = Number(args[1])

        if (limit < 0) {
            throw new Error("Wrong limit.")
        }
    } catch {
        bot.sendMessage(msg.chat.id, "Fail parsing gas price limit.")
        return
    }

    setGasPriceLimit(chain, limit)

    bot.sendMessage(msg.chat.id, `Successfully set ${limit} for ${chain}.`)
})

bot.onText(/\/get_gas_price_limits/, (msg) => {
    bot.sendMessage(msg.chat.id, JSON.stringify(allGases))
})