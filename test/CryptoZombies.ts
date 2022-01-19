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
  });
});
