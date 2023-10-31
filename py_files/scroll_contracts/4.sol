// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Switch {
    address immutable owner;
    bool private switchOn; // switch is off
    bytes4 immutable public publicSelector = bytes4(keccak256("turnSwitchOff()"));

    constructor() {
        owner = msg.sender;
    }

     modifier onlyThis() {
        require(msg.sender == address(this), "Only the contract can call this");
        _;
    }

    modifier onlyOff() {
        // we use a complex data type to put in memory
        bytes32[1] memory selector;
        // check that the calldata at position 68 (location of _data)
        assembly {
            calldatacopy(selector, 68, 4) // grab function selector from calldata
        }
        require(
            selector[0] == publicSelector,
            "Can only call the turnOffSwitch function"
        );
        _;
    }

    function flipSwitch(bytes memory _data) public onlyOff {
        switchOn = abi.decode(_data, (bool));
    }

    function turnSwitchOn() public onlyThis {
        switchOn = true;
    }

    function turnSwitchOff() public onlyThis {
        switchOn = false;
    }

}