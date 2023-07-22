import {Activity} from "../../classes/module";
import {zksyncProject1_swap, zksyncProject2_stake, zksyncProject2_unstake} from "./interations";




export const zksyncProject1: Activity = {
    name: "zksyncProject1",
    txs: [
        zksyncProject1_swap
    ]
}

export const zksyncProject2: Activity = {
    name: "zksyncProject2",
    txs: [
        zksyncProject2_stake,
        zksyncProject2_unstake
    ]
}