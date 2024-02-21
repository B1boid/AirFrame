import {ConnectionModule} from "../../classes/connection";
import {WalletI} from "../../classes/wallet";
import {Destination} from "../../config/chains";

class LzConnectionModule implements ConnectionModule {
    async sendAsset(wallet: WalletI, from: Destination, to: Destination, asset: string, amount: number, keepAmount: number): Promise<[boolean, number]> {
        return Promise.resolve([false, 0]);
    }

}

export const lzConnectionModule: LzConnectionModule = new LzConnectionModule()