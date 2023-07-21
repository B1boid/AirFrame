import {ConnectionModule} from "../classes/connection";
import {okxConnectionModule} from "./okx/connection_okx";
import {EnumDictionary} from "../utils/utils";
import {lzConnectionModule} from "./lz/connection-lz";

export enum Connections {
    exchange_okx = "exchange-okx",
    bridge_lz = "bridge-lz"
}

export const connectionModules: EnumDictionary<Connections, ConnectionModule> = {
    [Connections.exchange_okx]: okxConnectionModule,
    [Connections.bridge_lz]: lzConnectionModule,
}