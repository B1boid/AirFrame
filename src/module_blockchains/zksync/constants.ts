import {EnumDictionary} from "../../utils/utils";
import {Asset} from "../../config/tokens";

// @ts-ignore
export const zkSyncTokens: EnumDictionary<Asset, string> = {
    [Asset.ETH]: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    [Asset.WETH]: "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91",
    [Asset.USDC]: "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4",
    [Asset.WMATIC]: "0x28a487240e4d45cff4a2980d334cc933b7483842",
    [Asset.WBTC]: "0xBBeB516fb02a01611cBBE0453Fe3c580D7281011",
    [Asset.BUSD]: "0x2039bb4116B4EFc145Ec4f0e2eA75012D6C0f181",
    [Asset.RETH]: "0x32Fd44bB869620C0EF993754c8a00Be67C464806",
    [Asset.LUSD]: "0x503234F203fC7Eb888EEC8513210612a43Cf6115",
    [Asset.MUTE]: "0x0e97C7a0F8B2C9885C8ac9fC6136e829CbC21d42",
    [Asset.VC]: "0x85D84c774CF8e9fF85342684b0E795Df72A24908",
    [Asset.SPACE]: "0x47260090ce5e83454d5f05a0abbb2c953835f777",
    [Asset.ZKDOGE]: "0xbFB4b5616044Eded03e5b1AD75141f0D9Cb1499b",
    [Asset.ZAT]: "0x47EF4A5641992A72CFd57b9406c9D9cefEE8e0C4",
    [Asset.IZI]: "0x16A9494e257703797D747540f01683952547EE5b",
    [Asset.DVF]: "0xBbD1bA24d589C319C86519646817F2F153c9B716",
    [Asset.SIS]: "0xdd9f72afED3631a6C85b5369D84875e6c42f1827",
    [Asset.MAV]: "0x787c09494Ec8Bcb24DcAf8659E7d5D69979eE508",
}


export const zkSyncContracts: { [id: string]: string } = {
    oneInchRouter: "0x6e2B76966cbD9cF4cC2Fa0D76d24d5241E0ABC2F",
    tevaeraId: "0xd29Aa7bdD3cbb32557973daD995A3219D307721f",
    tevaeraNft: "0x50B2b7092bCC15fbB8ac74fE9796Cf24602897Ad",
    znsIdReg: "0x8b5193BCaE3032766bEc9d07ecDB9E56aefBff0F",
    znsIdName: "0xF2372788b23DF335A260d88f349615B9d7d6918D",

    // random routers
    spaceRouter: "0xbE7D1FD1f6748bbDefC4fbaCafBb11C6Fc506d1d",
    syncSwapRouter: "0x2da10A1e27bF85cEdD8FFb1AbBe97e53391C0295",
    velocoreRouter: "0xB2CEF7f2eCF1f4f0154D129C6e111d81f68e6d03",
    iziRouter: "0x943ac2310D9BC703d6AB5e5e76876e212100f894",
    muteRouter: "0x8B791913eB07C32779a16750e3868aA8495F5964",

    syncSwapPool: "0xf2DAd89f2788a8CD54625C60b55cD3d2D0ACa7Cb"
}