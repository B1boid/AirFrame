import { BigNumber } from "ethers";

export type RawEventData = {
  data: string;
  topics: string[];
};

export type Event = {
  address: string;
  blockHash: string;
  blockNumber: number;
  event?: unknown;
  id: string;
  logIndex: number;
  raw: RawEventData;
  removed: boolean;
  returnValues: unknown;
  signature: unknown;
  transactionHash: string;
  transactionIndex: number;
};

type Events = {
  0: Event;
  1: Event;
};

export type EthersEvent = {
  address: string;
  blockHash: string;
  blockNumber: number;
  data: string;
  getBlock?: unknown;
  getTransaction?: unknown;
  getTransactionReceipt?: unknown;
  // event?: unknown;
  // id: string;
  logIndex: number;
  topics: string[];
  // removed: boolean;
  // returnValues: unknown;
  // signature: unknown;
  transactionHash: string;
  transactionIndex: number;
};

type EthersEvents = EthersEvent[];

export type Web3Receipt = {
  blockHash: string;
  blockNumber: number;
  contractAddress?: string | null;
  cumulativeGasUsed: number;
  effectiveGasPrice: string;
  events: Events;
  from: string;
  gasUsed: number;
  logsBloom: string;
  status: boolean;
  to: string;
  transactionHash: string;
  transactionIndex: number;
  type: string;
};

export type EthersTokenReceipt = {
  blockHash: string;
  blockNumber: number;
  byzantium: boolean;
  confirmations: number;
  contractAddress?: string | null;
  cumulativeGasUsed: BigNumber;
  effectiveGasPrice: BigNumber;
  events: EthersEvents;
  from: string;
  // gasUsed: { type: string; hex: string };
  gasUsed: BigNumber;
  logs: EthersEvents;
  logsBloom: string;
  status: number;
  to: string;
  transactionHash: string;
  transactionIndex: number;
  type: number;
};

export type EthersNativeReceipt = {
  blockHash: string;
  blockNumber: number;
  byzantium: boolean;
  confirmations: number;
  contractAddress?: string | null;
  cumulativeGasUsed: BigNumber;
  effectiveGasPrice: BigNumber;
  events: EthersEvents;
  from: string;
  // gasUsed: { type: string; hex: string };
  gasUsed: BigNumber;
  logs: EthersEvents;
  logsBloom: string;
  status: number;
  to: string;
  transactionHash: string;
  transactionIndex: number;
  type: number;
};