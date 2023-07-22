import {Destination} from "../config/chains";
import {WalletI} from "./wallet";


export interface ConnectionModule {
    sendAsset(wallet: WalletI, from: Destination, to: Destination, asset: string, amount: number): Promise<boolean>
}