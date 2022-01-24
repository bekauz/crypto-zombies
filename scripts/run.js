const hre = require("hardhat");

async function main() {
    
  const zombieOwnershipFactory = await hre.ethers.getContractFactory("ZombieOwnership");
  const zombieOwnership = await zombieOwnershipFactory.deploy();
  await zombieOwnership.deployed();

  await zombieOwnership.createRandomZombie("test-name");

  console.log(await zombieOwnership.getZombies());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
