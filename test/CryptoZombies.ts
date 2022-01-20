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
    let zombieFeedingFactory: ContractFactory;
    let zombieFeeding: Contract;

    this.beforeEach(async () => {
      zombieAttackFactory = await ethers.getContractFactory("ZombieAttack");
      zombieAttack = await zombieAttackFactory.deploy();
      await zombieAttack.deployed();
      zombieFeedingFactory = await ethers.getContractFactory("ZombieFeeding");
      zombieFeeding = await zombieFeedingFactory.deploy();
      await zombieFeeding.deployed();
    });

    it("Should fail to attack if msg.sender is not the owner", async function () {
      await zombieFeeding.connect(owner).createRandomZombie("test-1");
      await expect(zombieAttack.connect(addr1).attack(0, 0))
        .to.be.revertedWith("msg.sender is not the owner of zombie");
    });

  });

});
