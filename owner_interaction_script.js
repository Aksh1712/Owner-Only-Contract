const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🔗 OwnerOnly Contract Interaction Script\n");

    // Contract address (update with your deployed contract address)
    const CONTRACT_ADDRESS = process.env.OWNER_CONTRACT_ADDRESS || "YOUR_CONTRACT_ADDRESS_HERE";
    
    if (CONTRACT_ADDRESS === "YOUR_CONTRACT_ADDRESS_HERE") {
        console.log("❌ Please set OWNER_CONTRACT_ADDRESS in your .env file");
        process.exit(1);
    }

    // Get signer
    const [signer] = await ethers.getSigners();
    console.log("👤 Interacting as:", signer.address);
    
    // Check balance
    const balance = await signer.getBalance();
    console.log("💰 Account balance:", ethers.utils.formatEther(balance), "ETH\n");

    try {
        // Get contract instance
        const ownerOnly = await ethers.getContractAt("OwnerOnly", CONTRACT_ADDRESS);
        console.log("📋 Contract loaded at:", CONTRACT_ADDRESS);

        // Display current contract state
        console.log("\n📊 Current Contract State:");
        const info = await ownerOnly.getContractInfo();
        console.log("👤 Owner:", info.currentOwner);
        console.log("🔐 Secret Message:", info.currentMessage);
        console.log("🔢 Counter:", info.currentCounter.toString());
        console.log("⏸️  Is Paused:", info.isPaused);
        console.log("💰 Contract Balance:", ethers.utils.formatEther(info.contractBalance), "ETH");

        // Check if current signer is owner
        const isOwner = await ownerOnly.isOwner(signer.address);
        console.log("🔑 Is current account owner:", isOwner);

        if (!isOwner) {
            console.log("\n⚠️  Current account is not the owner. Only read operations available.");
            
            // Test public function
            console.log("\n🔍 Testing Public Functions:");
            const publicResult = await ownerOnly.publicFunction();
            console.log("📢 Public function result:", publicResult);
            
            return;
        }

        console.log("\n✅ Owner detected! Demonstrating owner-only functions:");

        // Test 1: Update secret message
        console.log("\n🔒 Test 1: Updating Secret Message");
        const newMessage = `Updated at ${new Date().toISOString()}`;
        const tx1 = await ownerOnly.updateSecretMessage(newMessage);
        await tx1.wait();
        console.log("✅ Secret message updated:", newMessage);

        // Test 2: Increment counter
        console.log("\n🔢 Test 2: Incrementing Counter");
        const tx2 = await ownerOnly.incrementCounter();
        await tx2.wait();
        const newCounter = await ownerOnly.ownerOnlyCounter();
        console.log("✅ Counter incremented to:", newCounter.toString());

        // Test 3: Pause contract
        console.log("\n⏸️  Test 3: Pausing Contract");
        const tx3 = await ownerOnly.pauseContract();
        await tx3.wait();
        console.log("✅ Contract paused");

        // Test 4: Try to update message while paused (should fail)
        console.log("\n❌ Test 4: Trying to Update Message While Paused");
        try {
            await ownerOnly.updateSecretMessage("This should fail");
        } catch (error) {
            console.log("✅ Expected error caught:", error.reason || error.message);
        }

        // Test 5: Unpause contract
        console.log("\n▶️  Test 5: Unpausing Contract");
        const tx4 = await ownerOnly.unpauseContract();
        await tx4.wait();
        console.log("✅ Contract unpaused");

        // Test 6: Reset counter
        console.log("\n🔄 Test 6: Resetting Counter");
        const tx5 = await ownerOnly.resetCounter();
        await tx5.wait();
        const resetCounter = await ownerOnly.ownerOnlyCounter();
        console.log("✅ Counter reset to:", resetCounter.toString());

        // Test 7: Send some ETH to contract and withdraw
        console.log("\n💰 Test 7: Emergency Withdrawal");
        
        // Send ETH to contract
        const sendTx = await signer.sendTransaction({
            to: CONTRACT_ADDRESS,
            value: ethers.utils.parseEther("0.01")
        });
        await sendTx.wait();
        console.log("📤 Sent 0.01 ETH to contract");

        // Check contract balance
        const contractBalance = await ethers.provider.getBalance(CONTRACT_ADDRESS);
        console.log("💰 Contract balance:", ethers.utils.formatEther(contractBalance), "ETH");

        // Withdraw funds
        const withdrawTx = await ownerOnly.emergencyWithdraw();
        await withdrawTx.wait();
        console.log("✅ Emergency withdrawal completed");

        // Display final state
        console.log("\n📊 Final Contract State:");
        const finalInfo = await ownerOnly.getContractInfo();
        console.log("👤 Owner:", finalInfo.currentOwner);
        console.log("🔐 Secret Message:", finalInfo.currentMessage);
        console.log("🔢 Counter:", finalInfo.currentCounter.toString());
        console.log("⏸️  Is Paused:", finalInfo.isPaused);
        console.log("💰 Contract Balance:", ethers.utils.formatEther(finalInfo.contractBalance), "ETH");

        console.log("\n🎉 All owner-only functions tested successfully!");

        // Optional: Demonstrate ownership transfer (commented out for safety)
        /*
        console.log("\n🔄 Test: Ownership Transfer (Commented out for safety)");
        // const newOwner = "0x..."; // Replace with actual address
        // const transferTx = await ownerOnly.transferOwnership(newOwner);
        // await transferTx.wait();
        // console.log("✅ Ownership transferred to:", newOwner);
        */

    } catch (error) {
        console.error("\n❌ Error during interaction:", error.message);
        
        if (error.message.includes("NotOwner")) {
            console.log("💡 This error occurs when non-owner tries to call owner-only functions");
        } else if (error.message.includes("ContractIsPaused")) {
            console.log("💡 This error occurs when calling functions while contract is paused");
        }
    }
}

// Execute the interaction script
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = main;