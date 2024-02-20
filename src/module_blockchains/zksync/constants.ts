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
    [Asset.WSTETH]: "0x703b52F2b28fEbcB60E1372858AF5b18849FE867",
}


export const zkSyncContracts: { [id: string]: string } = {
    tevaeraId: "0xd29Aa7bdD3cbb32557973daD995A3219D307721f",
    tevaeraNft: "0x50B2b7092bCC15fbB8ac74fE9796Cf24602897Ad",
    znsIdReg: "0x8b5193BCaE3032766bEc9d07ecDB9E56aefBff0F",
    znsIdName: "0xF2372788b23DF335A260d88f349615B9d7d6918D",
    dmail: "0x981F198286E40F9979274E0876636E9144B8FB8E",

    zkEraLendInit: "0xC955d5fa053d88E7338317cc6589635cD5B2cf09",
    zkEraLendEth: "0x22D8b71599e14F20a49a397b88c1C878c86F5579",

    reactFusionInit: "0x23848c28Af1C3AA7B999fA57e6b6E8599C17F3f2",
    reactFusionEth: "0xC5db68F30D21cBe0C9Eac7BE5eA83468d69297e6",

    paraspace: "0x07765123EAF3cF6dd2f7b5ab717385b43B18765c",
    paraspaceWithdraw: "0x05254db23880E93f597480A29B7A75f8434D9536",

    oneInchRouter: "0x6e2B76966cbD9cF4cC2Fa0D76d24d5241E0ABC2F",
    spaceRouter: "0xbE7D1FD1f6748bbDefC4fbaCafBb11C6Fc506d1d",
    syncSwapRouter: "0x2da10A1e27bF85cEdD8FFb1AbBe97e53391C0295",
    velocoreRouter: "0xd999E16e68476bC749A28FC14a0c3b6d7073F50c",
    iziRouter: "0x943ac2310D9BC703d6AB5e5e76876e212100f894",
    muteRouter: "0x8B791913eB07C32779a16750e3868aA8495F5964",
    odosRouter: "0x4bBa932E9792A2b917D47830C93a9BC79320E4f7",
    lifiRouter: "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE",
    woofiRouter: "0xfd505702b37Ae9b626952Eb2DD736d9045876417",

    maverickRouter: "0x39E098A153Ad69834a9Dac32f0FCa92066aD03f4",
    maverickPoolInfo: "0x57D47F505EdaA8Ae1eFD807A860A79A28bE06449",

    pancakeRouter: "0xf8b59f3c3Ab33200ec80a8A58b2aA5F5D2a8944C",
    pancakeFactory: "0x1BB72E0CbbEA93c08f535fc7856E0338D7F7a8aB",
    pancakeQuoter: "0x3d146FcE6c1006857750cBe8aF44f76a28041CCc",

    syncSwapPool: "0xf2DAd89f2788a8CD54625C60b55cD3d2D0ACa7Cb",
    synFuturesMint1: "0xa6E5e7DDcd6e7C5959f4AdE9aEd97594346436aF",
    synFuturesMint2: "0xB2578E4D0f94c76Cde665a884b86fb4EE16CBFB8",
    rhinoDeposit: "0x1fa66e2B38d0cC496ec51F81c3e05E6A6708986F",

    safeGnosisDeploy: "0xDAec33641865E4651fB43181C6DB6f7232Ee91c2",
    safeGnosisSingleton: "0x1727c2c531cf966f902E5927b98490fDFb3b2b70",
    safeGnosisArg: "0x2f870a80647BbC554F3a0EBD093f11B4d2a7492A",

    zerolendDepo: "0x767b4A087c11d7581Ac95eaFfc1FeBFA26bad3d2",
    zerolendPool: "0x4d9429246EA989C9CeE203B43F6d1C7D83e3B8F8",
    zerolendWrapped: "0x9002ecb8a06060e3b56669c6B8F18E1c3b119914",

}