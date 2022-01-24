//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./ZombieAttack.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract ZombieOwnership is ERC721, ZombieAttack {

    mapping (uint => address) zombieApprovals;

    constructor() ERC721("CryptoZombie", "CTZ") {}

    function balanceOf(address _owner) public view override returns (uint256) {
        return ownerZombieCount[_owner];
    }

    function ownerOf(uint256 _tokenId) public view override returns (address) {
        return zombieToOwner[_tokenId];
    }

    function _transfer(address _from, address _to, uint256 _tokenId) internal override {
        ownerZombieCount[_to]++;
        ownerZombieCount[_from]--;
        zombieToOwner[_tokenId] = _to;
        emit Transfer(_from, _to, _tokenId);
    }

    function transferFrom(address _from, address _to, uint256 _tokenId) public override {
        require (
            (zombieToOwner[_tokenId] == msg.sender || zombieApprovals[_tokenId] == msg.sender), 
            "Unauthorized to transfer the token."
        );
        _transfer(_from, _to, _tokenId);
    }

    function approve(address _approved, uint256 _tokenId) public onlyOwnerOf(_tokenId) override {
        zombieApprovals[_tokenId] = _approved;
        emit Approval(msg.sender, _approved, _tokenId);
    }
}