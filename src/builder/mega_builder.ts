import {AnyActions, ConnectionAction, ModuleActions, Randomness, WalletActions} from "../classes/actions";
import {getAccBalance, getTxCount, hasInteractionWithEthContract} from "./features";
import {
    arbitrumChain,
    Blockchains,
    Destination,
    ethereumChain,
    optimismChain,
    scrollChain,
    zkSyncChain
} from "../config/chains";
import {Asset} from "../config/tokens";
import {Connections} from "../module_connections/connection_modules";
import {
    getActiveAddressesWithLabels,
    getMedian,
    getRandomElement,
    getRandomFloat,
    getRandomInt, getRandomKeepAmount, getRandomKeepAmountFloat,
    shuffleArray
} from "../utils/utils";
import {
    ArbActivity,
    EthereumActivity,
    OptimismActivity,
    ScrollActivity,
    ZkSyncActivity
} from "../module_blockchains/blockchain_modules";
import {globalLogger} from "../utils/logger";
import {ethers, toBigInt} from "ethers-new";


interface ExtendedFeatures {
    walletAddress: string,
    label: string,
    megaType: MegaType,
    ethTxs: number,
    zkTxs: number,
    optTxs: number,
    arbTxs: number,
    scrollTxs: number,
    zkBalance: bigint,
    scrollBalance: bigint,
    hasOffBridge: boolean
}


export async function buildMegaladona(): Promise<WalletActions[]> {
    let activeAddresses: string[][] = getActiveAddressesWithLabels()
    let accountInfos: ExtendedFeatures[] = []
    for (let [address, label] of activeAddresses){
        let features = await getAccountInfo(address, label)
        if (features === null) {
            throw new Error(`Failed to get features for ${address}`)
        }
        accountInfos.push(features)
    }
    shuffleArray(accountInfos)
    let res: WalletActions[] = []
    for (let accInfo of accountInfos) {
        res.push(generateActions(accInfo))
        console.log(res[res.length - 1])
    }
    printStats(accountInfos)

    return res
}

enum MegaType {
    CoolAcc = "CoolAcc",
    BomzhAcc = "BomzhAcc",
    VolAcc = "VolAcc"
}

function megaClassifier(label: string): MegaType {
    // label format examples: em_sub2_9, xxx_sub3_19
    let splitted = label.split("_")
    let firstPachka = splitted[0] === "em"
    let num = Number.parseInt(splitted[2])
    if (firstPachka){
        if (num % 3 !== 0){
            return MegaType.CoolAcc
        }
        if (num % 2 === 0){
            return MegaType.BomzhAcc
        }
        return MegaType.VolAcc
    } else {
        if (num % 3 === 0){
            return MegaType.CoolAcc
        }
        if (num % 4 !== 0){
            return MegaType.BomzhAcc
        }
        return MegaType.VolAcc
    }

}

async function getAccountInfo(address: string, label: string, retries: number = 1): Promise<ExtendedFeatures | null> {
    if (retries < 0) return null
    try {
        let ethTxs = await getTxCount(address, ethereumChain)
        let zkTxs = await getTxCount(address, zkSyncChain)
        let optTxs = await getTxCount(address, optimismChain)
        let arbTxs = await getTxCount(address, arbitrumChain)
        let scrollTxs = await getTxCount(address, scrollChain)
        let hasOffBridge = await hasInteractionWithEthContract(address, "0x32400084C286CF3E17e7B677ea9583e60a000324")
        let zkBal = await getAccBalance(address, zkSyncChain)
        let scrollBal = await getAccBalance(address, scrollChain)
        if (ethTxs === null || zkTxs === null || hasOffBridge === null || optTxs === null || arbTxs === null || scrollTxs === null || zkBal === null || scrollBal === null) {
            return null
        }
        let megaType = megaClassifier(label)
        return {
            walletAddress: address,
            label: label,
            megaType: megaType,
            ethTxs: ethTxs,
            zkTxs: zkTxs,
            optTxs: optTxs,
            arbTxs: arbTxs,
            scrollTxs: scrollTxs,
            zkBalance: zkBal,
            scrollBalance: scrollBal,
            hasOffBridge: hasOffBridge
        }
    } catch (e) {
        return await getAccountInfo(address, label, retries - 1)
    }
}

function printStats(accs: ExtendedFeatures[]){
    let zeroAccs = 0
    let accsWithOffBridge = 0
    let avgNonZeroEthTxs: number[] = []
    let avgNonZeroZkTxs: number[] = []
    let avgNonZeroScrollTxs: number[] = []
    for (let accInfo of accs) {
        zeroAccs += accInfo.zkTxs === 0 && accInfo.ethTxs === 0 ? 1 : 0
        accsWithOffBridge += accInfo.hasOffBridge ? 1 : 0
        if (accInfo.zkTxs > 0) {
            avgNonZeroZkTxs.push(accInfo.zkTxs)
        }
        if (accInfo.ethTxs > 0) {
            avgNonZeroEthTxs.push(accInfo.ethTxs)
        }
        if (accInfo.scrollTxs > 0) {
            avgNonZeroScrollTxs.push(accInfo.scrollTxs)
        }
    }
    globalLogger.done(
        `\nTotal accounts: ${accs.length}\nZero accounts: ${zeroAccs}\nAccs zk-off-bridge: ${accsWithOffBridge}\nAvg non-zero ethTxs: ${getMedian(avgNonZeroEthTxs)}\nAvg non-zero zkTxs: ${getMedian(avgNonZeroZkTxs)}\nAvg non-zero scrollTxs: ${getMedian(avgNonZeroScrollTxs)}`
    )
}

function generateActions(accInfo: ExtendedFeatures): WalletActions {
    let actions: AnyActions[] = []
    if (accInfo.megaType === MegaType.VolAcc){
        generateTypeVol(accInfo, actions)
    } else {
        generateTypeCoolOrBomzh(accInfo, actions)
    }

    return {
        address: accInfo.walletAddress,
        actions: actions,
        featuresLine: `${accInfo.label}, ethTxs: ${accInfo.ethTxs}, zkTxs: ${accInfo.zkTxs}, scrollTxs: ${accInfo.scrollTxs}, hasOffBridge: ${accInfo.hasOffBridge}, zkBalance: ${ethers.formatEther(accInfo.zkBalance)}, scrollBalance: ${ethers.formatEther(accInfo.scrollBalance)}, type: ${accInfo.megaType}`
    }
}

function generateTypeVol(accInfo: ExtendedFeatures, actions: AnyActions[]): void {
    const CONNECTION_OKX_TO_ZKSYNC: ConnectionAction = {
        from: Destination.OKX,
        to: Destination.ZkSync,
        asset: Asset.ETH,
        amount: getRandomFloat(0.2, 0.5, 3),
        connectionName: Connections.ExchangeOKX
    }
    actions.push(CONNECTION_OKX_TO_ZKSYNC)

    let activities = generateZkSyncRandomActivities(getRandomInt(2, 3))
    const ZKSYNC_ACTIONS: ModuleActions = {
        chainName: Blockchains.ZkSync,
        randomOrder: Randomness.Full,
        activityNames: activities
    }
    actions.push(ZKSYNC_ACTIONS)

    const BRIDGE_ORBITER_ZKSYNC_TO_SCROLL: ConnectionAction = {
        from: Destination.ZkSync,
        to: Destination.Scroll,
        asset: Asset.ETH,
        amount: -1,
        connectionName: Connections.Orbiter
    }
    actions.push(BRIDGE_ORBITER_ZKSYNC_TO_SCROLL)

    let scroll_activities: ScrollActivity[] = generateScrollActivities(getRandomInt(2, 3))
    scroll_activities.push(ScrollActivity.scrollInteractWithContract)
    const SCROLL_ACTIONS: ModuleActions = {
        chainName: Blockchains.Scroll,
        randomOrder: Randomness.Full,
        activityNames: scroll_activities
    }
    actions.push(SCROLL_ACTIONS)

    backToOkx(accInfo, actions, toBigInt(0))

}

function generateTypeCoolOrBomzh(accInfo: ExtendedFeatures, actions: AnyActions[]): void {
    let scrollAmount;
    let zksyncAmount;
    let fee = getRandomFloat(0.001, 0.002, 4);
    if (accInfo.megaType === MegaType.CoolAcc){
        scrollAmount = getRandomKeepAmountFloat() + getRandomFloat(0.0025, 0.0045, 4)
        zksyncAmount = getRandomKeepAmountFloat() + getRandomFloat(0.0025, 0.0045, 4)
    } else { //bomzhAcc
        scrollAmount = getRandomFloat(0.0025, 0.0045, 4);
        zksyncAmount = getRandomFloat(0.0025, 0.0045, 4);
    }
    let progonType; // 1(bigAm) - 20%, 2(through l2) - 20%, 3 - 60%
    let rnd = getRandomInt(1, 100)
    if (rnd < 20){
        progonType = 1;
        fee += getRandomFloat(0.2, 0.5, 3);
    } else if (rnd < 40){
        progonType = 2;
    } else {
        progonType = 3;
    }

    const CONNECTION_OKX_TO_ZKSYNC: ConnectionAction = {
        from: Destination.OKX,
        to: Destination.ZkSync,
        asset: Asset.ETH,
        amount: fee + scrollAmount + zksyncAmount,
        connectionName: Connections.ExchangeOKX
    }
    actions.push(CONNECTION_OKX_TO_ZKSYNC)

    let activities = generateZkSyncRandomActivities(getRandomInt(2, 3))
    const ZKSYNC_ACTIONS: ModuleActions = {
        chainName: Blockchains.ZkSync,
        randomOrder: Randomness.Full,
        activityNames: activities
    }
    actions.push(ZKSYNC_ACTIONS)

    if (progonType === 1 || progonType === 3) {
        const BRIDGE_ORBITER_ZKSYNC_TO_SCROLL: ConnectionAction = {
            from: Destination.ZkSync,
            to: Destination.Scroll,
            asset: Asset.ETH,
            amount: -1,
            connectionName: Connections.Orbiter,
            keepAmount: ethers.parseEther(zksyncAmount.toString())
        }
        actions.push(BRIDGE_ORBITER_ZKSYNC_TO_SCROLL)
    } else {
        const BRIDGE_ORBITER_ZKSYNC_TO_OPT: ConnectionAction = {
            from: Destination.ZkSync,
            to: Destination.Optimism,
            asset: Asset.ETH,
            amount: -1,
            connectionName: Connections.Orbiter,
            keepAmount: ethers.parseEther(zksyncAmount.toString())
        }
        actions.push(BRIDGE_ORBITER_ZKSYNC_TO_OPT)
        actions.push(generateOptimismActivities(getRandomInt(1, 3)))
        const BRIDGE_ORBITER_OPT_TO_SCROLL: ConnectionAction = {
            from: Destination.Optimism,
            to: Destination.Scroll,
            asset: Asset.ETH,
            amount: -1,
            connectionName: Connections.Orbiter,
        }
        actions.push(BRIDGE_ORBITER_OPT_TO_SCROLL)
    }

    let scroll_activities: ScrollActivity[] = generateScrollActivities(getRandomInt(2, 3))
    scroll_activities.push(ScrollActivity.scrollInteractWithContract)
    const SCROLL_ACTIONS: ModuleActions = {
        chainName: Blockchains.Scroll,
        randomOrder: Randomness.Full,
        activityNames: scroll_activities
    }
    actions.push(SCROLL_ACTIONS)

    if (progonType === 1){
        backToOkx(accInfo, actions, ethers.parseEther(scrollAmount.toString()))
    }
}


function backToOkx(accInfo: ExtendedFeatures, actions: AnyActions[], keepAmount: bigint): void {

    if (getRandomInt(0, 100) < 66){ // 66% chance to use optimism
        const BRIDGE_ORBITER_SCROLL_TO_OPTIMISM: ConnectionAction = {
            from: Destination.Scroll,
            to: Destination.Optimism,
            asset: Asset.ETH,
            amount: -1,
            connectionName: Connections.Orbiter,
            keepAmount: keepAmount
        }
        actions.push(BRIDGE_ORBITER_SCROLL_TO_OPTIMISM)
        actions.push(
            generateOptimismActivities(getRandomInt(0, 3))
        )
        const CONNECTION_OPTIMISM_TO_OKX: ConnectionAction = {
            from: Destination.Optimism,
            to: Destination.OKX,
            asset: Asset.ETH,
            amount: -1,
            connectionName: Connections.ExchangeOKX
        }
        actions.push(CONNECTION_OPTIMISM_TO_OKX)
    } else {
        const BRIDGE_ORBITER_SCROLL_TO_ARB: ConnectionAction = {
            from: Destination.Scroll,
            to: Destination.Arbitrum,
            asset: Asset.ETH,
            amount: -1,
            connectionName: Connections.Orbiter,
            keepAmount: keepAmount
        }
        actions.push(BRIDGE_ORBITER_SCROLL_TO_ARB)
        actions.push(
            generateArbitrumActivities(getRandomInt(0, 2))
        )
        const CONNECTION_ARB_TO_OKX: ConnectionAction = {
            from: Destination.Arbitrum,
            to: Destination.OKX,
            asset: Asset.ETH,
            amount: -1,
            connectionName: Connections.ExchangeOKX
        }
        actions.push(CONNECTION_ARB_TO_OKX)
    }

}


function generateZkSyncRandomActivities(activitiesNum: number): ZkSyncActivity[] {
    let availableActivities: ZkSyncActivity[] = [
        ZkSyncActivity.zkSyncDummyRandomSwapCycle, ZkSyncActivity.zkSyncDummyRandomSwapCycle, //x2
        ZkSyncActivity.zkSyncDummyRandomLending,
        ZkSyncActivity.zkSyncDummyRandomStuff, ZkSyncActivity.zkSyncDummyRandomStuff, //x2
        ZkSyncActivity.zkSyncEmptyMulticall, ZkSyncActivity.zkSyncEmptyMulticall //x2
    ]
    let res: ZkSyncActivity[] = []
    let repeatedActivities: ZkSyncActivity[] = []
    for (let i = 0; i < activitiesNum; i++) {
        let curActivity: ZkSyncActivity
        while (true) {
            curActivity = getRandomElement(availableActivities)
            if (!repeatedActivities.includes(curActivity)) {
                break
            }
        }
        if (curActivity === ZkSyncActivity.zkSyncDummyRandomLending) {
            let lendingActivities: ZkSyncActivity[] = [
                ZkSyncActivity.zkSyncReactFusionCycle, ZkSyncActivity.zkSyncEraLendCycle, ZkSyncActivity.zkSyncZerolendCycle
            ]
            res.push(getRandomElement(lendingActivities))
        } else if (curActivity === ZkSyncActivity.zkSyncDummyRandomSwapCycle) {
            let lendingActivities: ZkSyncActivity[] = [
                ZkSyncActivity.zkSyncTopSwapCycleNativeToUsdc, ZkSyncActivity.zkSyncSwapCycleNativeToUsdc
            ]
            res.push(getRandomElement(lendingActivities))
        } else if (curActivity === ZkSyncActivity.zkSyncDummyRandomStuff) {
            let lendingActivities: ZkSyncActivity[] = [
                ZkSyncActivity.zkSyncDmail, ZkSyncActivity.zkSyncCreateSafe, ZkSyncActivity.zkSyncRhinoDeposit
            ]
            res.push(getRandomElement(lendingActivities))
        } else {
            res.push(curActivity)
        }
        repeatedActivities.push(curActivity)
    }
    return res
}

function generateScrollActivities(activitiesNum: number): ScrollActivity[] {
    let availableActivities: ScrollActivity[] = [
        ScrollActivity.scrollDmail,
        ScrollActivity.scrollRandomStuff,
        ScrollActivity.scrollEmptyRouter,
        ScrollActivity.scrollDummyLendingCycle,
        ScrollActivity.scrollDummySwapCycle,
        ScrollActivity.scrollCreateSafe
    ]

    let res: ScrollActivity[] = []
    let repeatedActivities: ScrollActivity[] = []
    for (let i = 0; i < activitiesNum; i++) {
        let curActivity: ScrollActivity
        while (true) {
            curActivity = getRandomElement(availableActivities)
            if (!repeatedActivities.includes(curActivity)) {
                break
            }
        }
        if (curActivity === ScrollActivity.scrollDummySwapCycle) {
            let swapActivities: ScrollActivity[] = [
                ScrollActivity.scrollSwapCycleNativeToWsteth, ScrollActivity.scrollSwapCycleNativeToUsdc
            ]
            res.push(getRandomElement(swapActivities))
        } else if (curActivity === ScrollActivity.scrollDummyLendingCycle) {
            let lendingActivities: ScrollActivity[] = [
                ScrollActivity.scrollAaveCycle, ScrollActivity.scrollLayerbankCycle
            ]
            res.push(getRandomElement(lendingActivities))
        } else {
            res.push(curActivity)
        }

        repeatedActivities.push(curActivity)
    }
    return res
}

function generateOptimismActivities(activitiesNum: number): ModuleActions {
    let availableActivities: OptimismActivity[] = [
        OptimismActivity.optRandomStuff,
        OptimismActivity.optDummyLendingCycle,
        // OptimismActivity.optSwapCycleNativeToUsdc,
        OptimismActivity.optFakeUniExec,
        OptimismActivity.optMoveDustGas,
        OptimismActivity.optRandomApprove,
        OptimismActivity.optOptimismDelegate
    ]

    let res: OptimismActivity[] = []
    let repeatedActivities: OptimismActivity[] = []
    for (let i = 0; i < activitiesNum; i++) {
        let curActivity: OptimismActivity
        while (true) {
            curActivity = getRandomElement(availableActivities)
            if (!repeatedActivities.includes(curActivity)) {
                break
            }
        }
        if (curActivity === OptimismActivity.optDummyLendingCycle) {
            let lendingActivities: OptimismActivity[] = [
                OptimismActivity.optAaveCycle, OptimismActivity.optAaveCycle, OptimismActivity.optGranaryCycle
            ]
            res.push(getRandomElement(lendingActivities))
        } else {
            res.push(curActivity)
        }
        repeatedActivities.push(curActivity)
    }
    return {
        chainName: Blockchains.Optimism,
        randomOrder: Randomness.Full,
        activityNames: res
    }
}

function generateArbitrumActivities(activitiesNum: number): ModuleActions {
    let availableActivities: ArbActivity[] = [
        ArbActivity.arbRandomStuff,
        ArbActivity.arbAaveCycle,
        // ArbActivity.arbSwapCycleNativeToUsdc,
        ArbActivity.arbRandomApprove,
        ArbActivity.arbArbitrumDelegate,
        ArbActivity.arbFakeUniExec,
        ArbActivity.arbMoveDustGas,
        ArbActivity.arbFriendsTech,
    ]

    let res: ArbActivity[] = []
    let repeatedActivities: ArbActivity[] = []
    for (let i = 0; i < activitiesNum; i++) {
        let curActivity: ArbActivity
        while (true) {
            curActivity = getRandomElement(availableActivities)
            if (!repeatedActivities.includes(curActivity)) {
                break
            }
        }
        res.push(curActivity)
        repeatedActivities.push(curActivity)
    }
    return {
        chainName: Blockchains.Arbitrum,
        randomOrder: Randomness.Full,
        activityNames: res
    }
}
