const hre = require("hardhat");

async function main() {

  const [owner, randomPerson] = await hre.ethers.getSigners();
  
  const zombieFeedingFactory = await hre.ethers.getContractFactory("ZombieFeeding");
  
  console.log("Deploying ZombieFeeding...");
  const zombieFeeding = await zombieFeedingFactory.deploy();
  await zombieFeeding.deployed();
  console.log("ZombieFeeding deployed to:", zombieFeeding.address);
  console.log("Setting contract address...");
  await zombieFeeding.setKittyContractAddress(`0x06012c8cf97BEaD5deAe237070F9587f8E7A266d`);
  console.log("Success");
  try {
    console.log("Setting contract address as unauthed...");
    await zombieFeeding.connect(randomPerson).setKittyContractAddress(`0x06012c8cf97BEaD5deAe237070F9587f8E7A266d`);
  } catch (e) {
    console.log("Error");
  }
  console.log("Creating a zombie...");
  await zombieFeeding.createRandomZombie("first");
  
  console.log("Feeding on a cat...");
  await zombieFeeding.feedOnKitty(0, 1);

  let zombies = await zombieFeeding.getZombies();
  console.log(`There are now ${zombies.length} zombies`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
