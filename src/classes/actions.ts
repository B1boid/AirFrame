import {Blockchains, Destination} from "../config/chains";
import {Connections} from "../module_connections/connection_modules";
import {ActivityTag} from "../module_blockchains/blockchain_modules";
import {Asset} from "../config/tokens";

export interface Actions {
    actions: (ModuleActions | ConnectionAction)[]
}

export enum Randomness {
    No,
    OnlyActivities, // possible  Activity1 -> Activity2 and Activity2 -> Activity1
    Full// strict inside Activity, but possible to mix: act2_Interaction1 -> act1_Interaction1 -> act1_Interaction2 -> act2_Interaction2
}

export interface ModuleActions {
    chainName: Blockchains
    randomOrder: Randomness
    activityNames: ActivityTag[]
}


export interface ConnectionAction {
    from: Destination // chain name or exchange name
    to: Destination // chain name or exchange name
    asset: Asset
    amount: number // -1 if fullBalance
    connectionName: Connections
}