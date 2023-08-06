import {EnumDictionary} from "../../utils/utils";
import {Asset} from "../../config/tokens";

// @ts-ignore
export const zkSyncTokens: EnumDictionary<Asset, string> = {
    [Asset.ETH]: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    [Asset.WETH]: "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91",
    [Asset.USDC]: "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4",
}


export const zkSyncContracts: { [id: string]: string } = {
    oneInchRouter: "0x6e2B76966cbD9cF4cC2Fa0D76d24d5241E0ABC2F",
    tevaeraId: "0xd29Aa7bdD3cbb32557973daD995A3219D307721f",
    tevaeraNft: "0x50B2b7092bCC15fbB8ac74fE9796Cf24602897Ad",
    znsIdReg: "0x8b5193BCaE3032766bEc9d07ecDB9E56aefBff0F",
    znsIdName: "0xF2372788b23DF335A260d88f349615B9d7d6918D"
}