import {Destination} from "../config/chains";
import {Connections} from "../module_connections/connection_modules";
import {Blockchains} from "../modules/blockchain_modules";

export interface Actions {
    actions: (ModuleActions | ConnectionAction)[]
}

export enum Asset {
    ETH = "ETH",
    USDT = "USDT",
    USDC = "USDC",
    MATIC = "MATIC"
}

export enum Randomness {
    No,
    onlyActivities, // possible  Activity1 -> Activity2 and Activity2 -> Activity1
    Full// strict inside Activity, but possible to mix: act2_Interaction1 -> act1_Interaction1 -> act1_Interaction2 -> act2_Interaction2
}

export interface ModuleActions {
    chainName: Blockchains
    randomOrder: Randomness
    activityNames: string[]
}


export interface ConnectionAction {
    from: Destination // chain name or exchange name
    to: Destination // chain name or exchange name
    asset: Asset
    amount: number // -1 if fullBalance
    connectionName: Connections
}