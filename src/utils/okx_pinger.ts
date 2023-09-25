import {Method, OKX_BASE_URL, OKXApiMethod} from "./okx_api";
import {AddressInfo, OkxCredentials} from "../classes/info";
import Crypto from "crypto-js";
import axios from "axios";
import {globalLogger} from "./logger";
import {getOkxCredentialsForSub, getOkxCredentialsSubs, sleep} from "./utils";
import {Asset} from "../config/tokens";

export async function pingSubs(okxPassword: string) {
    const allCredentials: OkxCredentials[] = getOkxCredentialsSubs(okxPassword)
    for (let credentials of allCredentials) {
        const method = Method.GET
        const okxApiMethod = OKXApiMethod.OKX_TEST
        const body = {
            // ccy: Asset.ETH
        }
        const nowISO: string = new Date().toISOString()
        const message: string = `${nowISO}${method}${okxApiMethod}?${body}`
        const sign: string = Crypto.enc.Base64.stringify(
            Crypto.HmacSHA256(
                message,
                credentials.secretKey
            )
        )

        let e = (await (async () => {
            switch (method) {
                case Method.GET:
                    return axios.get(`${OKX_BASE_URL}${okxApiMethod}?${body}`, {
                        headers: {
                            "OK-ACCESS-KEY": credentials.apiKey,
                            "OK-ACCESS-SIGN": sign,
                            "OK-ACCESS-TIMESTAMP": nowISO,
                            "OK-ACCESS-PASSPHRASE": credentials.passphrase
                        }
                    })
                default:
                    throw Error(`Unexpected method: ${method}.`)
            }
        })()).data;
        await sleep(5)
    }
    console.log("Pinged all subs")
}