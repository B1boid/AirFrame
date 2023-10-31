// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract Token {
  address immutable owner;
  mapping(address => uint) balances;
  uint public totalSupply;

  constructor() public {
    owner = msg.sender;
    balances[msg.sender] = totalSupply = 10 ether;
  }

  function transfer(address _to, uint _value) public returns (bool) {
    require(balances[msg.sender] - _value >= 0);
    balances[msg.sender] -= _value;
    balances[_to] += _value;
    return true;
  }

  function balanceOf(address _owner) public view returns (uint balance) {
    return balances[_owner];
  }
}