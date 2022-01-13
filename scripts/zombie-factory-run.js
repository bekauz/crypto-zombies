const hre = require("hardhat");

async function main() {

  const zombieFactoryFactory = await hre.ethers.getContractFactory("ZombieFactory");
  
  console.log("Deploying ZombieFactory...");
  const zombieFactory = await zombieFactoryFactory.deploy();
  await zombieFactory.deployed();

  console.log("ZombieFactory deployed to:", zombieFactory.address);

  let zombies = await zombieFactory.getZombies();
  console.log("Current number of zombies: ", zombies.length);

  console.log("Creating a zombie...");
  await zombieFactory.createRandomZombie("name");

  try {
    console.log("Attempting to create another zombie...");
    await zombieFactory.createRandomZombie("should not work");
  } catch (e) {
    console.log("Failed to create... successfully");
  }

  zombies = await zombieFactory.getZombies();
  console.log("Current number of zombies: ", zombies.length);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
