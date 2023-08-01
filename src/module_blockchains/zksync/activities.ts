import {Activity} from "../../classes/module";
import {zksyncProject1_swap, zksyncProject2_stake, zksyncProject2_unstake} from "./interations";
import {ZkSyncActivity} from "../blockchain_modules";


export const zksyncProject1: Activity = {
    name: ZkSyncActivity.Project1,
    txs: [
        zksyncProject1_swap
    ]
}

export const zksyncProject2: Activity = {
    name: ZkSyncActivity.Project2,
    txs: [
        zksyncProject2_stake,
        zksyncProject2_unstake
    ]
}