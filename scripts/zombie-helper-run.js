const hre = require("hardhat");

async function main() {
    
  const zombieHelperFactory = await hre.ethers.getContractFactory("ZombieHelper");
  
  console.log("Deploying ZombieHelper...");
  const zombieHelper = await zombieHelperFactory.deploy();
  await zombieHelper.deployed();

  console.log(await zombieHelper.withdraw());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
