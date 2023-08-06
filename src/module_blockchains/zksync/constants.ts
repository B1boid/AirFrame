import {EnumDictionary} from "../../utils/utils";
import {Asset} from "../../config/tokens";

// @ts-ignore
export const zkSyncTokens: EnumDictionary<Asset, string> = {
    [Asset.ETH]: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    [Asset.WETH]: "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91",
    [Asset.USDC]: "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4",
}


export const zkSyncContracts: { [id: string]: string } = {
    oneInchRouter: "0x6e2B76966cbD9cF4cC2Fa0D76d24d5241E0ABC2F"
}