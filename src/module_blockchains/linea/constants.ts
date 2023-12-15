import {EnumDictionary} from "../../utils/utils";
import {Asset} from "../../config/tokens";

// @ts-ignore
export const lineaTokens: EnumDictionary<Asset, string> = {
    [Asset.ETH]: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    [Asset.WETH]: "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f",
    [Asset.WSTETH]: "0xB5beDd42000b71FddE22D3eE8a79Bd49A568fC8F",
}


export const lineaContracts: { [id: string]: string } = {
    iziRouter: "0x032b241De86a8660f1Ae0691a4760B426EA246d7",
}