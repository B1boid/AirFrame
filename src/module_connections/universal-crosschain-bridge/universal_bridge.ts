
import axios from 'axios';
import {ConnectionModule} from "../../classes/connection";
import { WalletI } from '../../classes/wallet';
import { Destination } from '../../config/chains';
import { Asset } from '../../config/tokens';
import { getChainBalance } from '../../utils/utils';
import { destToChain } from '../../module_blockchains/blockchain_modules';
import { ethers } from 'ethers-new';

import { orbiterConnectionModule } from '../orbiter/connection_orbiter';
import { nitroConnectionModule } from '../nitro/connection_nitro';
import { globalLogger } from '../../utils/logger';

const NITRO_PAPOCHKA_ADDRESS = "0x00051d55999c7cd91B17Af7276cbecD647dBC000"
const NITRO_ETH_TRESHOLD = 3

class UniversalConnectionModule implements ConnectionModule {
    async sendAsset(wallet: WalletI, from: Destination, to: Destination, asset: Asset, amount: number, keepAmount: number): Promise<[boolean, number]> {
        const useNitroRes = await this.useNitro(wallet, from, to, asset)

        if (useNitroRes) {
            try {
                return nitroConnectionModule.sendAsset(wallet, from, to, asset, amount, keepAmount)
            } catch {
                globalLogger.connect(wallet.getAddress(), destToChain(from)).warn(`Failed to transfer with Nitro ${from} -> ${to}. Fallback to orbiter.`)
                return orbiterConnectionModule.sendAsset(wallet, from, to, asset, amount, keepAmount)
            }
        } else {
            return orbiterConnectionModule.sendAsset(wallet, from, to, asset, amount, keepAmount)
        }
    }

    async useNitro(wallet: WalletI, from: Destination, to: Destination, asset: Asset): Promise<boolean> {
        const balance = await getChainBalance(NITRO_PAPOCHKA_ADDRESS, destToChain(to))
        const normalized = Number(ethers.formatEther(balance))
        return normalized > NITRO_ETH_TRESHOLD
    }
}

export const universalConnectionModule: UniversalConnectionModule = new UniversalConnectionModule()