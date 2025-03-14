import {Destination} from "../config/chains";
import {WalletI} from "./wallet";
import {Asset} from "../config/tokens";


export interface ConnectionModule {
    sendAsset(wallet: WalletI, from: Destination, to: Destination, asset: Asset, amount: number, keepAmount: number): Promise<[boolean, number]>
}