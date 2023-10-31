import { ethers, BytesLike } from "ethers";

/* Determines the EVM storage slot for a given ambient liquidity postion. Can be used
* to uniquely identify LP positions.
* 
* @param owner The owner of the ambient LP (usually msg.sender)
* @param base The address of the base token in the pool
* @param quote The address of the quote token in the pool
* @param poolType The pool type index number
* @return The EVM slot hash that the position is stored at in the contract.  */
export function ambientPosSlot (owner: string,  base: string, quote: string, poolType: number): BytesLike {
    const encoder = new ethers.utils.AbiCoder()
    const poolHash = ethers.utils.keccak256(encoder.encode
        (["address", "address", "uint256"], [base, quote, poolType]))
    
    const posKey = ethers.utils.solidityKeccak256(["address", "bytes32"], [owner, poolHash])
    return ethers.utils.solidityKeccak256(["bytes32", "uint256"], [posKey, AMBIENT_POS_SLOT])
}

/* Determines the EVM storage slot for a given ambient liquidity postion. Can be used
* to uniquely identify LP positions.
* 
* @param owner The owner of the ambient LP (usually msg.sender)
* @param base The address of the base token in the pool
* @param quote The address of the quote token in the pool
* @param poolType The pool type index number
* @return The EVM slot hash that the position is stored at in the contract.  */
export function concPosSlot (owner: string,  base: string, quote: string, 
    lowerTick: number, upperTick: number, poolType: number): BytesLike {
    const encoder = new ethers.utils.AbiCoder()
    const poolHash = ethers.utils.keccak256(encoder.encode
        (["address", "address", "uint256"], [base, quote, poolType]))

    const posKey = ethers.utils.solidityKeccak256(["address", "bytes32", "int24", "int24"], 
        [owner, poolHash, lowerTick, upperTick])
    return ethers.utils.solidityKeccak256(["bytes32", "uint256"], 
        [posKey, CONC_POS_SLOT])
}

// Based on the slots of the current contract layout
const AMBIENT_POS_SLOT = 65550
const CONC_POS_SLOT = 65549
