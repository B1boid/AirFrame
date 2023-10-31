import fs from "fs";
import {WalletI} from "../classes/wallet";
import {InterfaceAbi} from "ethers-new";


const solc = require("solc")

export type InputType = {
    internalType: string,
    name: string,
    type: string
}
export type AbiType = {
    inputs: [InputType]
    name: string | undefined,
    outputs: any
    stateMutability: any,
    type: string
}


export function scrollGetBytecodeAndAbiForAddress(wallet: WalletI): [string, [AbiType]] {
    const path = `scroll_meta/scroll_gen_res/${wallet.getAddress()}.sol`;

    const code = fs.readFileSync(path, 'utf8')
    const input = {
        language: 'Solidity',
        sources: {
            'Contract.sol': {
                content: code
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    };
    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    const name = Object.keys(output.contracts['Contract.sol'])[0]
    const bytecode = output.contracts['Contract.sol'][name].evm.bytecode.object
    const abi = output.contracts['Contract.sol'][name].abi

    return [bytecode, abi]
}