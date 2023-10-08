import {EnumDictionary} from "../../utils/utils";
import {Asset} from "../../config/tokens";

// @ts-ignore
export const polygonTokens: EnumDictionary<Asset, string> = {
    [Asset.MATIC]: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    [Asset.WMATIC]: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    [Asset.USDC]: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    [Asset.USDT]: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
}


export const polygonContracts: { [id: string]: string } = {
    oneInchRouter: "0x1111111254eeb25477b68fb85ed929f73a960582",
    lifiRouter: "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE",
    azuroBet: "0x200bd65a3189930634af857c72281abe63c3da5e",
    azuroLP: "0x7043E4e1c4045424858ECBCED80989FeAfC11B36",
    azuroCore: "0xA40F8D69D412b79b49EAbdD5cf1b5706395bfCf7",
    azuroAffiliate: "0x9dBf5A872caceB7A4b6De7aD5A5a7b10F6ed5D6B"
}