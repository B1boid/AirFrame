import {EnumDictionary} from "../../utils/utils";
import {Asset} from "../../config/tokens";

// @ts-ignore
export const polygonTokens: EnumDictionary<Asset, string> = {
    [Asset.MATIC]: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    [Asset.WMATIC]: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    [Asset.USDC]: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
}


export const polygonContracts: { [id: string]: string } = {
    oneInchRouter: "0x1111111254eeb25477b68fb85ed929f73a960582",
    lifiRouter: "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE",
}