export const CROC_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "authority",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "coldPath",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "pool",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "int24",
        "name": "tick",
        "type": "int24"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "isBid",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "pivotTime",
        "type": "uint32"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "feeMileage",
        "type": "uint64"
      }
    ],
    "name": "CrocKnockoutCross",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint16",
        "name": "callpath",
        "type": "uint16"
      },
      {
        "internalType": "bytes",
        "name": "cmd",
        "type": "bytes"
      },
      {
        "internalType": "bool",
        "name": "sudo",
        "type": "bool"
      }
    ],
    "name": "protocolCmd",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "slot",
        "type": "uint256"
      }
    ],
    "name": "readSlot",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "data",
        "type": "uint256"
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
        "name": "isBuy",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "inBaseQty",
        "type": "bool"
      },
      {
        "internalType": "uint128",
        "name": "qty",
        "type": "uint128"
      },
      {
        "internalType": "uint16",
        "name": "tip",
        "type": "uint16"
      },
      {
        "internalType": "uint128",
        "name": "limitPrice",
        "type": "uint128"
      },
      {
        "internalType": "uint128",
        "name": "minOut",
        "type": "uint128"
      },
      {
        "internalType": "uint8",
        "name": "reserveFlags",
        "type": "uint8"
      }
    ],
    "name": "swap",
    "outputs": [
      {
        "internalType": "int128",
        "name": "",
        "type": "int128"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint16",
        "name": "callpath",
        "type": "uint16"
      },
      {
        "internalType": "bytes",
        "name": "cmd",
        "type": "bytes"
      }
    ],
    "name": "userCmd",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint16",
        "name": "proxyIdx",
        "type": "uint16"
      },
      {
        "internalType": "bytes",
        "name": "cmd",
        "type": "bytes"
      },
      {
        "internalType": "bytes",
        "name": "conds",
        "type": "bytes"
      },
      {
        "internalType": "bytes",
        "name": "relayerTip",
        "type": "bytes"
      },
      {
        "internalType": "bytes",
        "name": "signature",
        "type": "bytes"
      }
    ],
    "name": "userCmdRelayer",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "output",
        "type": "bytes"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint16",
        "name": "proxyIdx",
        "type": "uint16"
      },
      {
        "internalType": "bytes",
        "name": "input",
        "type": "bytes"
      },
      {
        "internalType": "address",
        "name": "client",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "salt",
        "type": "uint256"
      }
    ],
    "name": "userCmdRouter",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  }
];
