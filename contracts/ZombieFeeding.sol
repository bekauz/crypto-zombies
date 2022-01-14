//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./ZombieFactory.sol";


abstract contract KittyInterface {
  function getKitty(uint256 _id) external view virtual returns (
    bool isGestating,
    bool isReady,
    uint256 cooldownIndex,
    uint256 nextActionAt,
    uint256 siringWithId,
    uint256 birthTime,
    uint256 matronId,
    uint256 sireId,
    uint256 generation,
    uint256 genes
  );
}


contract ZombieFeeding is ZombieFactory {
    // enable for mainnet
    // address ckAddress = 0x06012c8cf97BEaD5deAe237070F9587f8E7A266d;
    // KittyInterface kittyContract = KittyInterface(ckAddress);

    function feedAndMultiply(uint _zombieId, uint _targetDna) public {
        require(msg.sender == zombieToOwner[_zombieId]);
        Zombie storage myZombie = zombies[_zombieId];
        _targetDna = _targetDna % dnaModulus;
        uint newDna = (myZombie.dna + _targetDna) / 2;
        _createZombie("name", newDna);
    }

    function feedOnKitty(uint _zombieId, uint _kittyId) public {
        // enable for mainnet
        // uint kittyDna;
        // (,,,,,,,,,kittyDna) = kittyContract.getKitty(_kittyId);
        uint kittyDna = _generateRandomDna("temp");
        feedAndMultiply(_zombieId, kittyDna);
    }
}