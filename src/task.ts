import {Actions, ConnectionAction, ModuleActions, Randomness} from "./classes/actions";
import {Destination} from "./config/chains";

////////////////////////////////////////////////////////////////////////
// Later we will get it from UI, now it's hardcoded for testing
////////////////////////////////////////////////////////////////////////

const POLYGON_ACTIONS: ModuleActions = {
    chainName: Destination.polygon,
    randomOrder: Randomness.onlyActivities,
    activityNames: ["polygonProject1"]
}

const ZKSYNC_ACTIONS: ModuleActions = {
    chainName: Destination.zkSync,
    randomOrder: Randomness.onlyActivities,
    activityNames: ["zksyncProject1", "zksyncProject2"]
}

const CONNECTION_OKX_TO_POLYGON: ConnectionAction = {
    from: Destination.okx,
    to: Destination.polygon,
    connectionName: "withdraw"
}

const CONNECTION_ZKSYNC_TO_OKX: ConnectionAction = {
    from: Destination.zkSync,
    to: Destination.okx,
    connectionName: "deposit"
}

const CONNECTION_POLYGON_TO_ZKSYNC: ConnectionAction = {
    from: Destination.polygon,
    to: Destination.zkSync,
    connectionName: "bridge1"
}

const ACTIONS_1: Actions = {
    actions: [
        CONNECTION_OKX_TO_POLYGON,
        POLYGON_ACTIONS,
        CONNECTION_POLYGON_TO_ZKSYNC,
        ZKSYNC_ACTIONS,
        CONNECTION_ZKSYNC_TO_OKX
    ]
}

export const WALLETS_ACTIONS: {[id: string]: Actions} = {
    "0x..1": ACTIONS_1,
    // "0x..2": ACTIONS_1
}

////////////////////////////////////////////////////////////////////////