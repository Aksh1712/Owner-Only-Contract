# OwnerOnly Contract Deployment Guide

## 📋 Prerequisites

- Node.js (v14+)
- Hardhat development environment
- MetaMask wallet with test ETH
- Infura/Alchemy API key (for testnet deployment)

## 🛠 Setup Instructions

### 1. Install Dependencies
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts
```

### 2. Environment Configuration
Create `.env` file in project root:
```env
PRIVATE_KEY=your_private_key_here
INFURA_PROJECT_ID=your_infura_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 3. Hardhat Configuration
Update `hardhat.config.js`:
```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [process.env.PRIVATE_KEY]
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
```

## 🚀 Deployment Steps

### Local Deployment
```bash
# Start local node
npx hardhat node

# Deploy to local network
npx hardhat run scripts/deploy-owner.js --network localhost
```

### Testnet Deployment (Sepolia)
```bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy-owner.js --network sepolia
```

### Mainnet Deployment
```bash
# Deploy to Ethereum mainnet (use with caution)
npx hardhat run scripts/deploy-owner.js --network mainnet
```

## 📊 Deployment Information

### Contract Details
- **Contract Name**: OwnerOnly
- **Solidity Version**: ^0.8.19
- **License**: MIT
- **Optimization**: Enabled (200 runs)

### Gas Estimates
| Function | Gas Estimate |
|----------|--------------|
| Deploy | ~800,000 |
| updateSecretMessage | ~30,000 |
| incrementCounter | ~25,000 |
| pauseContract | ~25,000 |
| transferOwnership | ~30,000 |

### Network Deployment Addresses

#### Ethereum Sepolia Testnet
- **Contract Address**: `0x...` (Update after deployment)
- **Transaction Hash**: `0x...` (Update after deployment)
- **Block Number**: `...` (Update after deployment)
- **Deployer**: `0x...` (Update after deployment)
- **Gas Used**: `...` (Update after deployment)
- **Etherscan**: [View Contract](https://sepolia.etherscan.io/address/CONTRACT_ADDRESS)

#### Ethereum Goerli Testnet
- **Contract Address**: `0x...` (Update after deployment)
- **Transaction Hash**: `0x...` (Update after deployment)
- **Block Number**: `...` (Update after deployment)
- **Deployer**: `0x...` (Update after deployment)
- **Gas Used**: `...` (Update after deployment)
- **Etherscan**: [View Contract](https://goerli.etherscan.io/address/CONTRACT_ADDRESS)

## ✅ Post-Deployment Verification

### 1. Contract Verification
```bash
# Verify on Etherscan
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

### 2. Basic Functionality Tests
```javascript
// Get contract instance
const ownerOnly = await ethers.getContractAt("OwnerOnly", "DEPLOYED_ADDRESS");

// Test owner functions
await ownerOnly.updateSecretMessage("Hello World!");
await ownerOnly.incrementCounter();
console.log(await ownerOnly.getContractInfo());
```

### 3. Interaction Examples
```javascript
// Connect to deployed contract
const contractAddress = "DEPLOYED_CONTRACT_ADDRESS";
const abi = [...]; // Contract ABI
const contract = new ethers.Contract(contractAddress, abi, signer);

// Owner operations
await contract.updateSecretMessage("New message");
await contract.incrementCounter();
await contract.pauseContract();

// Public operations
const info = await contract.getContractInfo();
const isOwner = await contract.isOwner(address);
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Insufficient Gas
```
Error: Transaction reverted: out of gas
```
**Solution**: Increase gas limit in deployment script

#### 2. Insufficient Funds
```
Error: insufficient funds for intrinsic transaction cost
```
**Solution**: Add more ETH to deployer account

#### 3. Nonce Too High
```
Error: nonce too high
```
**Solution**: Reset MetaMask account or wait for pending transactions

#### 4. Network Connection Issues
```
Error: could not detect network
```
**Solution**: Check Infura/Alchemy URL and API key

### Debug Commands
```bash
# Check account balance
npx hardhat run scripts/check-balance.js --network sepolia

# Get transaction receipt
npx hardhat run scripts/get-receipt.js --network sepolia

# Verify contract manually
npx hardhat verify --network sepolia ADDRESS CONSTRUCTOR_ARGS
```

## 🛡️ Security Checklist

### Pre-Deployment
- [ ] Code reviewed and audited
- [ ] All tests passing
- [ ] Gas optimization verified
- [ ] Owner address confirmed
- [ ] Network configuration correct

### Post-Deployment
- [ ] Contract verified on Etherscan
- [ ] Basic functions tested
- [ ] Owner access confirmed
- [ ] Emergency functions tested
- [ ] Documentation updated

## 📈 Monitoring

### Contract Events
Monitor these events after deployment:
- `OwnershipTransferred`
- `SecretMessageUpdated`
- `ContractPaused`/`ContractUnpaused`
- `CounterIncremented`
- `EmergencyWithdrawal`

### Recommended Tools
- [Etherscan](https://etherscan.io) - Transaction monitoring
- [Tenderly](https://tenderly.co) - Contract debugging
- [OpenZeppelin Defender](https://defender.openzeppelin.com) - Contract security

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review Hardhat documentation
3. Join Ethereum development communities
4. Submit issues to the repository

## 📄 Deployment Logs

### Latest Deployment
```
Date: [Update with actual date]
Network: Sepolia
Deployer: 0x...
Contract: 0x...
Gas Used: ...
Status: ✅ Success
```

### Deployment History
| Date | Network | Address | Status |
|------|---------|---------|--------|
| - | - | - | - |

---

**Note**: Update this file with actual deployment addresses and details after each deployment.