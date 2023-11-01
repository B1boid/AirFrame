export const QUERY_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "dex",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "dex_",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "base",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "quote",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "poolIdx",
        "type": "uint256"
      }
    ],
    "name": "queryAmbientPosition",
    "outputs": [
      {
        "internalType": "uint128",
        "name": "seeds",
        "type": "uint128"
      },
      {
        "internalType": "uint32",
        "name": "timestamp",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "base",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "quote",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "poolIdx",
        "type": "uint256"
      }
    ],
    "name": "queryAmbientTokens",
    "outputs": [
      {
        "internalType": "uint128",
        "name": "liq",
        "type": "uint128"
      },
      {
        "internalType": "uint128",
        "name": "baseQty",
        "type": "uint128"
      },
      {
        "internalType": "uint128",
        "name": "quoteQty",
        "type": "uint128"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "base",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "quote",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "poolIdx",
        "type": "uint256"
      },
      {
        "internalType": "int24",
        "name": "lowerTick",
        "type": "int24"
      },
      {
        "internalType": "int24",
        "name": "upperTick",
        "type": "int24"
      }
    ],
    "name": "queryConcRewards",
    "outputs": [
      {
        "internalType": "uint128",
        "name": "liqRewards",
        "type": "uint128"
      },
      {
        "internalType": "uint128",
        "name": "baseRewards",
        "type": "uint128"
      },
      {
        "internalType": "uint128",
        "name": "quoteRewards",
        "type": "uint128"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "base",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "quote",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "poolIdx",
        "type": "uint256"
      }
    ],
    "name": "queryCurve",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint128",
            "name": "priceRoot_",
            "type": "uint128"
          },
          {
            "internalType": "uint128",
            "name": "ambientSeeds_",
            "type": "uint128"
          },
          {
            "internalType": "uint128",
            "name": "concLiq_",
            "type": "uint128"
          },
          {
            "internalType": "uint64",
            "name": "seedDeflator_",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "concGrowth_",
            "type": "uint64"
          }
        ],
        "internalType": "struct CurveMath.CurveState",
        "name": "curve",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "base",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "quote",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "poolIdx",
        "type": "uint256"
      }
    ],
    "name": "queryCurveTick",
    "outputs": [
      {
        "internalType": "int24",
        "name": "",
        "type": "int24"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "base",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "quote",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "poolIdx",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isBid",
        "type": "bool"
      },
      {
        "internalType": "int24",
        "name": "tick",
        "type": "int24"
      }
    ],
    "name": "queryKnockoutMerkle",
    "outputs": [
      {
        "internalType": "uint160",
        "name": "root",
        "type": "uint160"
      },
      {
        "internalType": "uint32",
        "name": "pivot",
        "type": "uint32"
      },
      {
        "internalType": "uint64",
        "name": "fee",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "base",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "quote",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "poolIdx",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isBid",
        "type": "bool"
      },
      {
        "internalType": "int24",
        "name": "tick",
        "type": "int24"
      }
    ],
    "name": "queryKnockoutPivot",
    "outputs": [
      {
        "internalType": "uint96",
        "name": "lots",
        "type": "uint96"
      },
      {
        "internalType": "uint32",
        "name": "pivot",
        "type": "uint32"
      },
      {
        "internalType": "uint16",
        "name": "range",
        "type": "uint16"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "base",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "quote",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "poolIdx",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "pivot",
        "type": "uint32"
      },
      {
        "internalType": "bool",
        "name": "isBid",
        "type": "bool"
      },
      {
        "internalType": "int24",
        "name": "lowerTick",
        "type": "int24"
      },
      {
        "internalType": "int24",
        "name": "upperTick",
        "type": "int24"
      }
    ],
    "name": "queryKnockoutPos",
    "outputs": [
      {
        "internalType": "uint96",
        "name": "lots",
        "type": "uint96"
      },
      {
        "internalType": "uint64",
        "name": "mileage",
        "type": "uint64"
      },
      {
        "internalType": "uint32",
        "name": "timestamp",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "base",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "quote",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "poolIdx",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "pivot",
        "type": "uint32"
      },
      {
        "internalType": "bool",
        "name": "isBid",
        "type": "bool"
      },
      {
        "internalType": "int24",
        "name": "lowerTick",
        "type": "int24"
      },
      {
        "internalType": "int24",
        "name": "upperTick",
        "type": "int24"
      }
    ],
    "name": "queryKnockoutTokens",
    "outputs": [
      {
        "internalType": "uint128",
        "name": "liq",
        "type": "uint128"
      },
      {
        "internalType": "uint128",
        "name": "baseQty",
        "type": "uint128"
      },
      {
        "internalType": "uint128",
        "name": "quoteQty",
        "type": "uint128"
      },
      {
        "internalType": "bool",
        "name": "knockedOut",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "base",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "quote",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "poolIdx",
        "type": "uint256"
      },
      {
        "internalType": "int24",
        "name": "tick",
        "type": "int24"
      }
    ],
    "name": "queryLevel",
    "outputs": [
      {
        "internalType": "uint96",
        "name": "bidLots",
        "type": "uint96"
      },
      {
        "internalType": "uint96",
        "name": "askLots",
        "type": "uint96"
      },
      {
        "internalType": "uint64",
        "name": "odometer",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "base",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "quote",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "poolIdx",
        "type": "uint256"
      }
    ],
    "name": "queryLiquidity",
    "outputs": [
      {
        "internalType": "uint128",
        "name": "",
        "type": "uint128"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "base",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "quote",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "poolIdx",
        "type": "uint256"
      }
    ],
    "name": "queryPrice",
    "outputs": [
      {
        "internalType": "uint128",
        "name": "",
        "type": "uint128"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "queryProtocolAccum",
    "outputs": [
      {
        "internalType": "uint128",
        "name": "",
        "type": "uint128"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "base",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "quote",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "poolIdx",
        "type": "uint256"
      },
      {
        "internalType": "int24",
        "name": "lowerTick",
        "type": "int24"
      },
      {
        "internalType": "int24",
        "name": "upperTick",
        "type": "int24"
      }
    ],
    "name": "queryRangePosition",
    "outputs": [
      {
        "internalType": "uint128",
        "name": "liq",
        "type": "uint128"
      },
      {
        "internalType": "uint64",
        "name": "fee",
        "type": "uint64"
      },
      {
        "internalType": "uint32",
        "name": "timestamp",
        "type": "uint32"
      },
      {
        "internalType": "bool",
        "name": "atomic",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "base",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "quote",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "poolIdx",
        "type": "uint256"
      },
      {
        "internalType": "int24",
        "name": "lowerTick",
        "type": "int24"
      },
      {
        "internalType": "int24",
        "name": "upperTick",
        "type": "int24"
      }
    ],
    "name": "queryRangeTokens",
    "outputs": [
      {
        "internalType": "uint128",
        "name": "liq",
        "type": "uint128"
      },
      {
        "internalType": "uint128",
        "name": "baseQty",
        "type": "uint128"
      },
      {
        "internalType": "uint128",
        "name": "quoteQty",
        "type": "uint128"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "querySurplus",
    "outputs": [
      {
        "internalType": "uint128",
        "name": "surplus",
        "type": "uint128"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "tracker",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "salt",
        "type": "uint256"
      }
    ],
    "name": "queryVirtual",
    "outputs": [
      {
        "internalType": "uint128",
        "name": "surplus",
        "type": "uint128"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

