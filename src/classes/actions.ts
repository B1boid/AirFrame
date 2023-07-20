import {Destination} from "../config/chains";

export interface Actions {
    actions: (ModuleActions | ConnectionAction)[]
}

export enum Randomness {
    No,
    onlyActivities, // possible  Activity1 -> Activity2 and Activity2 -> Activity1
    Full// strict inside Activity, but possible to mix: act2_Interaction1 -> act1_Interaction1 -> act1_Interaction2 -> act2_Interaction2
}

export interface ModuleActions {
    chainName: Destination
    randomOrder: Randomness
    activityNames: string[]
}


export interface ConnectionAction {
    from: Destination // chain name or exchange name
    to: Destination // chain name or exchange name
    connectionName: string
}