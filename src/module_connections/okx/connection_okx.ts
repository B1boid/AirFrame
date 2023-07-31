import {ConnectionModule} from "../../classes/connection";
import {TxResult, WalletI} from "../../classes/wallet";
import {Destination, destToChain} from "../../config/chains";
import {ConsoleLogger, ILogger} from "../../utils/logger";
import {OKXDepositAddress, OKXGetDepositAddressesResponse} from "../../utils/okx_api";
import {getTxForTransfer} from "../utils";
import {Asset} from "../../classes/actions";

class OkxConnectionModule implements ConnectionModule {
    private logger: ILogger

    constructor(logger: ILogger = new ConsoleLogger("0x0")) {

        this.logger = logger
    }
    async sendAsset(wallet: WalletI, from: Destination, to: Destination, asset: Asset, amount: number): Promise<boolean> {
        if (from === Destination.OKX) {

        } else if (to == Destination.OKX) {
            const addressesInfo: OKXGetDepositAddressesResponse | null = await wallet.getOKXWithdrawAddress(asset)

            if (addressesInfo === null || addressesInfo.code !== "0") {
                // TODO обработать ошибки
                this.logger.warn("Failed OKX withdraw")
                return Promise.resolve(false)
            }

            const withdrawInfo: OKXDepositAddress | undefined = addressesInfo.data.find(info => {
                return info.selected && info.chain === `${asset}-${from}`
                // TODO аккуратнее с названиями, мб сделать мапку из названий в окс названия
            })

            if (withdrawInfo === undefined) {
                // TODO обработать ошибки
                this.logger.error("Failed OKX withdraw. No address for withdraw.")
                return Promise.resolve(false)
            }

            const tx = getTxForTransfer(asset, withdrawInfo.to, amount)
            const chain = destToChain.get(from)!

            const txResult: TxResult = await wallet.sendTransaction(tx, 1, chain)
            if (txResult === TxResult.Fail) {
                console.log("Transaction failed")
                // TODO обработать
                return false
            }

        }
        return Promise.resolve(true)
    }
}

export const okxConnectionModule: OkxConnectionModule = new OkxConnectionModule()
