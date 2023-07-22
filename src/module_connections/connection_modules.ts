import {ConnectionModule} from "../classes/connection";
import {okxConnectionModule} from "./okx/connection_okx";
import {EnumDictionary} from "../utils/utils";
import {lzConnectionModule} from "./lz/connection-lz";

export enum Connections {
    ExchangeOKX = "exchange-okx",
    BridgeLZ = "bridge-lz"
}

export const connectionModules: EnumDictionary<Connections, ConnectionModule> = {
    [Connections.ExchangeOKX]: okxConnectionModule,
    [Connections.BridgeLZ]: lzConnectionModule,
}