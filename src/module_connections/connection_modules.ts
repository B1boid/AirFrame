import {ConnectionModule} from "../classes/connection";
import {okxConnectionModule} from "./okx/connection_okx";
import {EnumDictionary} from "../utils/utils";
import {lzConnectionModule} from "./lz/connection-lz";
import {zkSyncEthConnectionModule} from "./eth-zksyncofficial/connection_eth_zksync_official";
import {orbiterConnectionModule} from "./orbiter/connection_orbiter";
import { nitroConnectionModule } from './nitro/connection_nitro';

export enum Connections {
    ExchangeOKX = "exchange-okx",
    BridgeLZ = "bridge-lz",
    OfficialZkSyncBridge = "official-zk-sync-bridge",
    Orbiter = "orbiter-finance-bridge",
    Nitro = "nitro-router"
}

export const connectionModules: EnumDictionary<Connections, ConnectionModule> = {
    [Connections.ExchangeOKX]: okxConnectionModule,
    [Connections.OfficialZkSyncBridge]: zkSyncEthConnectionModule,
    [Connections.BridgeLZ]: lzConnectionModule,
    [Connections.Orbiter]: orbiterConnectionModule,
    [Connections.Nitro]: nitroConnectionModule
}