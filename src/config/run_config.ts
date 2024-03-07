import {Strategy} from "../builder/common_builder";

export interface Limits {
    min: number, // in seconds
    max: number // in seconds
}

export interface RunConfig {

    strategy: Strategy,
    threads: number,
    waitInitial: Limits, // before start any actions
    waitBetweenTxs: Limits, // wait between txs in blockchain module
    waitBetweenModules: Limits, // wait between modules
}

export const TEST_CONFIG: RunConfig = {
    strategy: Strategy.TestMode,
    threads: 1,
    waitInitial: {min: 0, max: 0},
    waitBetweenTxs: {min: 0, max: 1},
    waitBetweenModules: {min: 0, max: 0}
}

export const ZKSYNC_BASIC_CONFIG: RunConfig = {
    strategy: Strategy.ZkSyncBasic,
    threads: 2,
    waitInitial: {min: 0, max: 20 * 60},
    waitBetweenTxs: {min: 30, max: 10 * 60},
    waitBetweenModules: {min: 30, max: 60}
}

export const MAINS_ZKSYNC_CONFIG: RunConfig = {
    strategy: Strategy.ZkSyncMains,
    threads: 1,
    waitInitial: {min: 0, max: 0},
    waitBetweenTxs: {min: 30, max: 5 * 60},
    waitBetweenModules: {min: 30, max: 60}
}

export const ZKSYNC_ANOTHER_CONFIG: RunConfig = {
    strategy: Strategy.ZkSyncAnother,
    threads: 2,
    waitInitial: {min: 0, max: 10 * 60},
    waitBetweenTxs: {min: 30, max: 15 * 60},
    waitBetweenModules: {min: 0, max: 5 * 60}
}

export const MEGA_CONFIG: RunConfig = {
    strategy: Strategy.MegaStrata,
    threads: 2,
    waitInitial: {min: 0, max: 60 * 60},
    waitBetweenTxs: {min: 30, max: 15 * 60},
    waitBetweenModules: {min: 0, max: 30 * 60}
}