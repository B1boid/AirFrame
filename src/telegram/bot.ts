import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config()


const API_KEY = process.env.TELEGRAM_API_KEY!
export const ERROR_CHANNEL_ID = process.env.TELEGRAM_ERROR_CHANNEL_ID!
export const WARN_CHANNEL_ID = process.env.TELEGRAM_WARN_CHANNEL_ID!
export const SUPER_SUCCESS_CHANNEL_ID = process.env.TELEGRAM_SUPER_SUCCESS_CHANNEL_ID!
export const bot = new TelegramBot(API_KEY, {polling: true});