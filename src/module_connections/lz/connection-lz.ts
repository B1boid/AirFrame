import {ConnectionModule} from "../../classes/connection";
import {WalletI} from "../../classes/wallet";
import {Destination} from "../../config/chains";

class LzConnectionModule implements ConnectionModule {
    async sendAsset(wallet: WalletI, from: Destination, to: Destination, asset: string, amount: number): Promise<boolean> {
        return Promise.resolve(true);
    }

}

export const lzConnectionModule: LzConnectionModule = new LzConnectionModule()