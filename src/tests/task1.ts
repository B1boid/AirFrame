import {AnyActions, ConnectionAction, ModuleActions, Randomness, WalletActions} from "../classes/actions";
import {Blockchains, Destination} from "../config/chains";
import {Connections} from "../module_connections/connection_modules";
import {BscActivity, EthereumActivity, PolygonActivity, ZkSyncActivity} from "../module_blockchains/blockchain_modules";
import {Asset} from "../config/tokens";

////////////////////////////////////////////////////////////////////////
// Later we will get it from UI, now it's hardcoded for testing
////////////////////////////////////////////////////////////////////////

const POLYGON_ACTIONS: ModuleActions = {
    chainName: Blockchains.Polygon,
    randomOrder: Randomness.OnlyActivities,
    activityNames: [PolygonActivity.wrapUnwrap]
}

const ZKSYNC_ACTIONS: ModuleActions = {
    chainName: Blockchains.ZkSync,
    randomOrder: Randomness.Full,
    activityNames: [ZkSyncActivity.zkSyncMintTevaera, ZkSyncActivity.zkSyncEraLendCycle, ZkSyncActivity.zkSyncEraLendInit,
        ZkSyncActivity.zkSyncMintZnsId, ZkSyncActivity.zkSyncSwapCycleNativeToUsdc]
}

const ETH_ACTIONS: ModuleActions = {
    chainName: Blockchains.Ethereum,
    randomOrder: Randomness.Full,
    activityNames: [EthereumActivity.ethRandomStuff]
}

const BSC_ACTIONS: ModuleActions = {
    chainName: Blockchains.Bsc,
    randomOrder: Randomness.Full,
    activityNames: [BscActivity.bscKinzaCycle]
}

const CONNECTION_OKX_TO_POLYGON: ConnectionAction = {
    from: Destination.OKX,
    to: Destination.Polygon,
    asset: Asset.MATIC,
    amount: 3,
    connectionName: Connections.ExchangeOKX
}

const CONNECTION_OKX_TO_ZKSYNC: ConnectionAction = {
    from: Destination.OKX,
    to: Destination.ZkSync,
    asset: Asset.ETH,
    amount: 0.05,
    connectionName: Connections.ExchangeOKX
}

const CONNECTION_POLYGON_TO_OKX: ConnectionAction = {
    from: Destination.Polygon,
    to: Destination.OKX,
    asset: Asset.MATIC,
    amount: -1,
    connectionName: Connections.ExchangeOKX
}

const CONNECTION_OPTIMISM_TO_OKX: ConnectionAction = {
    from: Destination.Optimism,
    to: Destination.OKX,
    asset: Asset.ETH,
    amount: -1,
    connectionName: Connections.ExchangeOKX
}

const CONNECTION_OKX_TO_ETHEREUM: ConnectionAction = {
    from: Destination.OKX,
    to: Destination.Ethereum,
    asset: Asset.ETH,
    amount: 0.01,
    connectionName: Connections.ExchangeOKX
}

const CONNECTION_OKX_TO_BSC: ConnectionAction = {
    from: Destination.OKX,
    to: Destination.Bsc,
    asset: Asset.BNB,
    amount: 0.06,
    connectionName: Connections.ExchangeOKX
}

const CONNECTION_ETHEREUM_TO_OKX: ConnectionAction = {
    from: Destination.Ethereum,
    to: Destination.OKX,
    asset: Asset.ETH,
    amount: -1,
    connectionName: Connections.ExchangeOKX
}

const BRIDGE_ETHEREUM_TO_ZKSYNC: ConnectionAction = {
    from: Destination.Ethereum,
    to: Destination.ZkSync,
    asset: Asset.ETH,
    amount: -1,
    connectionName: Connections.OfficialZkSyncBridge
}

const BRIDGE_ORBITER_ZKSYNC_TO_OPTIMISM: ConnectionAction = {
    from: Destination.ZkSync,
    to: Destination.Optimism,
    asset: Asset.ETH,
    amount: -1,
    connectionName: Connections.Orbiter
}

const BRIDGE_ORBITER_ZKSYNC_TO_ARBITRUM: ConnectionAction = {
    from: Destination.ZkSync,
    to: Destination.Arbitrum,
    asset: Asset.ETH,
    amount: -1,
    connectionName: Connections.Orbiter
}

const CONNECTION_ARBITRUM_TO_OKX: ConnectionAction = {
    from: Destination.Arbitrum,
    to: Destination.OKX,
    asset: Asset.ETH,
    amount: -1,
    connectionName: Connections.ExchangeOKX
}


const ACTIONS_1: AnyActions[] =  [
        // CONNECTION_OKX_TO_ZKSYNC
        // CONNECTION_OKX_TO_POLYGON,
        // POLYGON_ACTIONS,
        // CONNECTION_POLYGON_TO_OKX
        // POLYGON_ACTIONS
        BRIDGE_ETHEREUM_TO_ZKSYNC,
         ZKSYNC_ACTIONS,
         BRIDGE_ORBITER_ZKSYNC_TO_ARBITRUM,
        CONNECTION_ARBITRUM_TO_OKX
        // CONNECTION_OKX_TO_ETHEREUM,
        // ETH_ACTIONS
    // BRIDGE_ORBITER_ZKSYNC_TO_OPTIMISM,
    //    CONNECTION_OPTIMISM_TO_OKX
    // CONNECTION_ETHEREUM_TO_OKX
    // CONNECTION_OKX_TO_ZKSYNC,
    // BRIDGE_ORBITER_ZKSYNC_TO_ARBITRUM,
    // CONNECTION_ARBITRUM_TO_OKX
    // CONNECTION_OKX_TO_BSC
    // BSC_ACTIONS

]


export const WALLETS_ACTIONS_1: WalletActions[] = [
    // {address: "0x04277AC5706B24F90cD56E58D105a32906C65094", actions: ACTIONS_1},
    // {address: "0x2Fd49f2da0d07102b223D89f290F61b265291952", actions: ACTIONS_1},
    // {address: "0x750D0B78E16426a42cd9a5485BA3DF70290912C0", actions: ACTIONS_1},

    {address: "0x99535d60659e3B0A7e5728006DBD958fb5FC80D8", actions: ACTIONS_1},
]


////////////////////////////////////////////////////////////////////////