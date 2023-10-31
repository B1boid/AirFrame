pragma solidity ^0.8.0;

contract SimpleStorage {
    address immutable owner;
    constructor() {
        owner = msg.sender;
    }

    function valueOwner() view public returns (address) {
        return owner;
    }
}