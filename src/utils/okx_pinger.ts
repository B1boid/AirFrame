import {Method, OKX_BASE_URL, OKXApiMethod} from "./okx_api";
import {OkxCredentials} from "../classes/info";
import Crypto from "crypto-js";
import axios from "axios";
import {globalLogger} from "./logger";
import {getOkxCredentialsSubs, sleep} from "./utils";
import {destToOkxChain} from "../module_connections/okx/config";
import {Blockchains} from "../config/chains";
import {Asset} from "../config/tokens";

export async function pingSubs(okxPassword: string) {
    const allCredentials: OkxCredentials[] = getOkxCredentialsSubs(okxPassword)
    for (let credentials of allCredentials) {
        if (credentials.fakeTxId.length < 2 || credentials.fakeWallet.length < 2){
            globalLogger.info("No fakeTxId/fakeWallet for " + credentials.apiKey)
            continue
        }
        const method = Method.GET
        const okxApiMethod = OKXApiMethod.OKX_DEPOSIT_WITHDRAW_STATUS
        const body = new URLSearchParams(
            {
                txId: credentials.fakeTxId,
                ccy: Asset.ETH,
                to: credentials.fakeWallet,
                chain: `${Asset.ETH}-${destToOkxChain(Blockchains.Optimism)}`
            }
        )
        const nowISO: string = new Date().toISOString()
        const message = (() => {
            switch (method) {
                case Method.GET:
                    return `${nowISO}${method}${okxApiMethod}?${body}`
            }
        })()
        const sign: string = Crypto.enc.Base64.stringify(
            Crypto.HmacSHA256(
                message,
                credentials.secretKey
            )
        )

        let e = (await axios.get(`${OKX_BASE_URL}${okxApiMethod}?${body}`, {
            headers: {
                "OK-ACCESS-KEY": credentials.apiKey,
                "OK-ACCESS-SIGN": sign,
                "OK-ACCESS-TIMESTAMP": nowISO,
                "OK-ACCESS-PASSPHRASE": credentials.passphrase
            }
        })).data
        console.log("Done ping, status:", e.code)
        await sleep(3)
    }
    console.log("Pinged all subs")
}