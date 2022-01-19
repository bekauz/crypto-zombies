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

    it("Should allow the owner to set the contract address", async function () {

      const zombieFeedingFactory: ContractFactory = await ethers.getContractFactory("ZombieFeeding");
      const zombieFeeding: Contract = await zombieFeedingFactory.deploy();
      await zombieFeeding.deployed();

      await zombieFeeding.setKittyContractAddress(
        ethers.utils.getAddress('0x06012c8cf97BEaD5deAe237070F9587f8E7A266d')
      );

      await expect(zombieFeeding.connect(addr2).setKittyContractAddress(
        ethers.utils.getAddress('0x06012c8cf97BEaD5deAe237070F9587f8E7A266d')
      )).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should set the external contract address and successfully call it", async function () {

      const zombieFeedingFactory: ContractFactory = await ethers.getContractFactory("ZombieFeeding");
      const zombieFeeding: Contract = await zombieFeedingFactory.deploy();
      await zombieFeeding.deployed();

      await zombieFeeding.setKittyContractAddress(
        ethers.utils.getAddress('0x06012c8cf97BEaD5deAe237070F9587f8E7A266d')
      );

      await zombieFeeding.createRandomZombie("test-1");
      expect((await zombieFeeding.getZombies()).length).to.equal(1);
      await expect(zombieFeeding.feedOnKitty(0, 1)).to.be.revertedWith('Zombie still on cooldown');

      const now = (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;
      const time = now + 86400
      // inc next block timestamp inc by 86400, mine it
      await ethers.provider.send('evm_setNextBlockTimestamp', [time]);
      await ethers.provider.send('evm_mine', []);

      await zombieFeeding.feedOnKitty(0, 1);
      expect((await zombieFeeding.getZombies()).length).to.equal(2);

    });
  });

});
