//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./ZombieHelper.sol";


contract ZombieAttack is ZombieHelper {

    uint randNonce = 0;
    uint attackVictoryProbability = 70;


    function randMod(uint _modulus) internal returns (uint) {
        // increment nonce so that no two randMod returns are the same
        randNonce++;
        return uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, randNonce))) % _modulus;
    }

    function attack(uint _zombieId, uint _targetId) external ownerOf(_zombieId) {
        Zombie storage attackingZombie = zombies[_zombieId];
        Zombie storage targetZombie = zombies[_targetId];

        uint rand = randMod(100);

        if (rand <= attackVictoryProbability) {
            attackingZombie.winCount++;
            attackingZombie.level++;
            targetZombie.lossCount++;
            feedAndMultiply(_zombieId, targetZombie.dna, "zombie");
        } else {
            attackingZombie.lossCount++;
            targetZombie.winCount++;
            _triggerCooldown(attackingZombie);
        }
    }
}