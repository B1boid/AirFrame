import {EnumDictionary} from "../../utils/utils";
import {Asset} from "../../config/tokens";

// @ts-ignore
export const baseTokens: EnumDictionary<Asset, string> = {
    [Asset.ETH]: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    [Asset.WETH]: "0x4200000000000000000000000000000000000006"
}


export const baseContracts: { [id: string]: string } = {
    iziRouter: "0x032b241De86a8660f1Ae0691a4760B426EA246d7",
}