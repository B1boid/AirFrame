import {Activity, ActivityTag} from "../../classes/module";
import {zksyncProject1_swap, zksyncProject2_stake, zksyncProject2_unstake} from "./interations";


export const zksyncProject1: Activity = {
    name: ActivityTag.ZkSyncProject1,
    txs: [
        zksyncProject1_swap
    ]
}

export const zksyncProject2: Activity = {
    name: ActivityTag.ZkSyncProject2,
    txs: [
        zksyncProject2_stake,
        zksyncProject2_unstake
    ]
}