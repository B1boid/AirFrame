import {Chain} from "../config/chains";
import {WalletI} from "./wallet";
import {Randomness} from "./actions";


export interface BlockchainModule {
    chain: Chain
    activities: Activity[] // all available activities for this module

    doActivities(wallet: WalletI, activityNames: string[], randomOrder: Randomness): Promise<void>
}

export interface Activity {
    name: string
    txs: ((wallet: WalletI) => TxInteraction[])[]
}

export interface TxInteraction {
    to: string
    data: string
    value: string

}
