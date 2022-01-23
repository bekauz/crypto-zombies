import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("CryptoZombies contracts", function () {

  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  this.beforeEach(async function () {

    [owner, addr1, addr2] = await ethers.getSigners();

  });

  describe("ZombieFactory contract", function () {

    it("Should allow one signer to create one zombie", async function () {

      const zombieFactoryFactory: ContractFactory = await ethers.getContractFactory("ZombieFactory");
      const zombieFactory: Contract = await zombieFactoryFactory.deploy();

      await zombieFactory.deployed();
      // no zombies after deployment
      expect(await zombieFactory.getZombies()).to.eql([]);

      await zombieFactory.createRandomZombie("test-1");
      expect((await zombieFactory.getZombies()).length).to.equal(1);

      // should only allow creation of 1
      await expect(zombieFactory.createRandomZombie("test-2"))
        .to.be.revertedWith("msg.sender already owns a zombie");

      expect((await zombieFactory.getZombies()).length).to.equal(1);
    });
  });

  describe("ZombieFeeding contract", function () {

    let zombieFeedingFactory: ContractFactory;
    let zombieFeeding: Contract;

    this.beforeEach(async () => {
      zombieFeedingFactory = await ethers.getContractFactory("ZombieFeeding");
      zombieFeeding = await zombieFeedingFactory.deploy();
      await zombieFeeding.deployed();
    });


    it("Should allow the owner to set the contract address", async function () {

      await zombieFeeding.setKittyContractAddress(
        ethers.utils.getAddress('0x06012c8cf97BEaD5deAe237070F9587f8E7A266d')
      );

      await expect(zombieFeeding.connect(addr2).setKittyContractAddress(
        ethers.utils.getAddress('0x06012c8cf97BEaD5deAe237070F9587f8E7A266d')
      )).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should fail to feedAndMultiply if cooldown is active", async function () {
      await zombieFeeding.setKittyContractAddress(
        ethers.utils.getAddress('0x06012c8cf97BEaD5deAe237070F9587f8E7A266d')
      );

      await zombieFeeding.createRandomZombie("test-1");
      expect((await zombieFeeding.getZombies()).length).to.equal(1);
      await expect(zombieFeeding.feedOnKitty(0, 1)).to.be.revertedWith("Zombie still on cooldown");
    });

    it("Should successfully feedOnMultiply when reading from another contract", async function () {

      await zombieFeeding.setKittyContractAddress(
        ethers.utils.getAddress('0x06012c8cf97BEaD5deAe237070F9587f8E7A266d')
      );

      await zombieFeeding.createRandomZombie("test-1");
      expect((await zombieFeeding.getZombies()).length).to.equal(1);

      const now = (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;
      const time = now + 86400
      // inc next block timestamp inc by 86400, mine it
      await ethers.provider.send('evm_setNextBlockTimestamp', [time]);
      await ethers.provider.send('evm_mine', []);

      await zombieFeeding.feedOnKitty(0, 1);
      expect((await zombieFeeding.getZombies()).length).to.equal(2);
    });
  });

  describe("ZombieFeeding contract", function () {

    let zombieHelperFactory: ContractFactory;
    let zombieHelper: Contract;

    this.beforeEach(async () => {
      zombieHelperFactory = await ethers.getContractFactory("ZombieHelper");
      zombieHelper = await zombieHelperFactory.deploy();
      await zombieHelper.deployed();
    });


  });

  describe("ZombieAttack contract", function () {

    let zombieAttackFactory: ContractFactory;
    let zombieAttack: Contract;

    this.beforeEach(async () => {
      zombieAttackFactory = await ethers.getContractFactory("ZombieAttack");
      zombieAttack = await zombieAttackFactory.deploy();
      await zombieAttack.deployed();
    });

    it("Should fail to attack if msg.sender is not the owner", async function () {
      await zombieAttack.connect(owner).createRandomZombie("test-1");
      await expect(zombieAttack.connect(addr1).attack(0, 0))
        .to.be.revertedWith("msg.sender is not the owner of zombie");
    });

    it("Should attack and level up on victory", async function () {
      await zombieAttack.createRandomZombie("test-1");
      await zombieAttack.connect(addr1).createRandomZombie("test-2");

      let zombies = await zombieAttack.getZombies();
      expect(zombies[0].level).to.deep.equal(1);
      expect(zombies[1].level).to.deep.equal(1);

      const now = (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;
      const time = now + 86400
      // inc next block timestamp inc by 86400, mine it
      await ethers.provider.send('evm_setNextBlockTimestamp', [time]);
      await ethers.provider.send('evm_mine', []);

      await zombieAttack.connect(addr1).attack(1, 0);
      zombies = await zombieAttack.getZombies();

       expect([zombies[0].level, zombies[1].level]).to.include(2);
    });
  });

  describe("ZombieOwnership contract", function () {

    let zombieOwnershipFactory: ContractFactory;
    let zombieOwnership: Contract;

    this.beforeEach(async () => {
      zombieOwnershipFactory = await ethers.getContractFactory("ZombieOwnership");
      zombieOwnership = await zombieOwnershipFactory.deploy();
      await zombieOwnership.deployed();
    });

    it("Should return balance for owner address", async function () {
      expect(await zombieOwnership.balanceOf(owner.getAddress()))
      .to.equal(ethers.BigNumber.from(0));
      await zombieOwnership.connect(owner).createRandomZombie("test-1");
      expect(await zombieOwnership.balanceOf(owner.getAddress()))
        .to.equal(ethers.BigNumber.from(1));
    });

    it("Should return owner of tokenId", async function () {
      expect(await zombieOwnership.ownerOf(0)).to.equal('0x0000000000000000000000000000000000000000');
      await zombieOwnership.connect(owner).createRandomZombie("test-1");
      expect(await zombieOwnership.ownerOf(0)).to.equal(await owner.getAddress());
    });

    it("Should successfully transfer token to another owner", async function () {
      await zombieOwnership.connect(owner).createRandomZombie("test-1");
      await zombieOwnership.transferFrom(await owner.getAddress(), await addr1.getAddress(), 0);
      expect(await zombieOwnership.ownerOf(0)).to.equal(await addr1.getAddress());
      expect(await zombieOwnership.balanceOf(await owner.getAddress()))
        .to.equal(ethers.BigNumber.from(0));
      expect(await zombieOwnership.balanceOf(await addr1.getAddress()))
        .to.equal(ethers.BigNumber.from(1));

    });

    it("Should approve another address and emit Approval event", async function () {
      await zombieOwnership.connect(owner).createRandomZombie("test-1");
      await expect(zombieOwnership.approve(addr1.getAddress(), 0))
        .to.emit(zombieOwnership, "Approval")
        .withArgs(await owner.getAddress(), await addr1.getAddress(), 0);
    });

    it("Should not allow unapproved address to take the token", async function () {
      await zombieOwnership.connect(owner).createRandomZombie("test-1");
      expect(await zombieOwnership.ownerOf(0)).to.be.equal(await owner.getAddress());
      await expect(zombieOwnership.connect(addr1).transferFrom(owner.getAddress(), addr1.getAddress(), 0))
        .to.be.revertedWith("Unauthorized to transfer the token.");
    });

    it("Should approve another address and allow that address to take the token", async function () {
      await zombieOwnership.connect(owner).createRandomZombie("test-1");
      await zombieOwnership.connect(owner).approve(addr1.getAddress(), 0);
      await zombieOwnership.transferFrom(owner.getAddress(), addr1.getAddress(), 0);

      expect(await zombieOwnership.balanceOf(owner.getAddress())).to.equal(ethers.BigNumber.from(0));
      expect(await zombieOwnership.balanceOf(addr1.getAddress())).to.equal(ethers.BigNumber.from(1));
      expect(await zombieOwnership.ownerOf(0)).to.equal(await addr1.getAddress());
    });
  });

});
