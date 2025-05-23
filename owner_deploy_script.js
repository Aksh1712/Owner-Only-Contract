const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("🚀 Starting OwnerOnly Contract Deployment...\n");

    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deployer address:", deployer.address);
    
    // Check deployer balance
    const balance = await deployer.getBalance();
    console.log("💰 Deployer balance:", ethers.utils.formatEther(balance), "ETH\n");

    if (balance.lt(ethers.utils.parseEther("0.01"))) {
        console.log("⚠️  Warning: Low balance. Make sure you have enough ETH for deployment.");
    }

    try {
        // Get the contract factory
        console.log("📦 Getting OwnerOnly contract factory...");
        const OwnerOnly = await ethers.getContractFactory("OwnerOnly");

        // Deploy the contract
        console.log("🏗️  Deploying OwnerOnly contract...");
        const ownerOnly = await OwnerOnly.deploy();

        // Wait for deployment to be confirmed
        console.log("⏳ Waiting for deployment confirmation...");
        await ownerOnly.deployed();

        console.log("\n✅ OwnerOnly Contract Deployed Successfully!");
        console.log("📍 Contract Address:", ownerOnly.address);
        console.log("🔗 Transaction Hash:", ownerOnly.deployTransaction.hash);
        console.log("⛽ Gas Used:", ownerOnly.deployTransaction.gasLimit.toString());

        // Verify initial state
        console.log("\n📊 Verifying Initial Contract State:");
        const owner = await ownerOnly.owner();
        const secretMessage = await ownerOnly.secretMessage();
        const counter = await ownerOnly.ownerOnlyCounter();
        const isPaused = await ownerOnly.contractPaused();

        console.log("👤 Owner:", owner);
        console.log("🔐 Secret Message:", secretMessage);
        console.log("🔢 Counter:", counter.toString());
        console.log("⏸️  Is Paused:", isPaused);

        // Test owner-only function
        console.log("\n🧪 Testing Owner-Only Function:");
        try {
            const tx = await ownerOnly.updateSecretMessage("Hello from deployment!");
            await tx.wait();
            console.log("✅ Successfully updated secret message");
            
            const newMessage = await ownerOnly.secretMessage();
            console.log("📝 New message:", newMessage);
        } catch (error) {
            console.log("❌ Failed to update secret message:", error.message);
        }

        // Save deployment info
        const deploymentInfo = {
            contractName: "OwnerOnly",
            contractAddress: ownerOnly.address,
            transactionHash: ownerOnly.deployTransaction.hash,
            deployer: deployer.address,
            deploymentTime: new Date().toISOString(),
            network: network.name,
            gasUsed: ownerOnly.deployTransaction.gasLimit.toString(),
            initialState: {
                owner: owner,
                secretMessage: secretMessage,
                counter: counter.toString(),
                isPaused: isPaused
            }
        };

        // Create deployment directory if it doesn't exist
        const deploymentDir = path.join(__dirname, '..', 'deployments');
        if (!fs.existsSync(deploymentDir)) {
            fs.mkdirSync(deploymentDir, { recursive: true });
        }

        // Save deployment info to file
        const deploymentFile = path.join(deploymentDir, 'owner-only-deployment.json');
        fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
        console.log("\n💾 Deployment info saved to:", deploymentFile);

        // Create contract interaction examples
        console.log("\n📚 Contract Interaction Examples:");
        console.log("// Get contract instance");
        console.log(`const ownerOnly = await ethers.getContractAt("OwnerOnly", "${ownerOnly.address}");`);
        console.log("\n// Owner-only functions:");
        console.log(`await ownerOnly.updateSecretMessage("New secret message");`);
        console.log(`await ownerOnly.incrementCounter();`);
        console.log(`await ownerOnly.pauseContract();`);
        console.log("\n// Public functions:");
        console.log(`await ownerOnly.publicFunction();`);
        console.log(`await ownerOnly.getContractInfo();`);

        // Network-specific instructions
        if (network.name === "sepolia") {
            console.log("\n🔍 Etherscan Verification:");
            console.log(`npx hardhat verify --network sepolia ${ownerOnly.address}`);
            console.log(`\n🌐 View on Etherscan: https://sepolia.etherscan.io/address/${ownerOnly.address}`);
        } else if (network.name === "goerli") {
            console.log("\n🔍 Etherscan Verification:");
            console.log(`npx hardhat verify --network goerli ${ownerOnly.address}`);
            console.log(`\n🌐 View on Etherscan: https://goerli.etherscan.io/address/${ownerOnly.address}`);
        }

        console.log("\n🎉 Deployment completed successfully!");
        
        return {
            contract: ownerOnly,
            address: ownerOnly.address,
            deployer: deployer.address
        };

    } catch (error) {
        console.error("\n❌ Deployment failed:", error.message);
        
        if (error.message.includes("insufficient funds")) {
            console.log("\n💡 Solution: Add more ETH to your deployer account");
        } else if (error.message.includes("nonce too high")) {
            console.log("\n💡 Solution: Reset your MetaMask account or wait for pending transactions");
        }
        
        throw error;
    }
}

// Handle script execution
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = main;