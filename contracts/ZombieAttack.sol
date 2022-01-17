pragma solidity ^0.8.0;

import "./ZombieHelper.sol";

contract ZombieAttack is ZombieHelper {

    uint randNonce = 0;

    function randMod(uint _modulus) internal returns (uint) {
        // increment nonce so that no two randMod returns are the same
        randNonce++;
        return uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, randNonce))) % _modulus;
    }
}