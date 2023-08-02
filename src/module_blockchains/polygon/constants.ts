import {EnumDictionary} from "../../utils/utils";
import {Asset} from "../../config/tokens";

// @ts-ignore
export const polygonTokens: EnumDictionary<Asset, string> = {
    [Asset.WMATIC]: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
}


export const polygonContracts = {
    oneInchRouter: "0x1111111254fb6c44bAC0beD2854e76F90643097d"
}