# Owner-Only Contract

A Solidity smart contract that demonstrates access control using modifiers. Only the contract deployer (owner) can call specific functions.

## 📋 Features

- **Access Control**: Uses `onlyOwner` modifier to restrict function access
- **Pausable Contract**: Owner can pause/unpause contract operations
- **Ownership Transfer**: Owner can transfer ownership to another address
- **Emergency Functions**: Owner can withdraw funds and reset state
- **Event Logging**: All important actions emit events
- **Gas Optimized**: Uses custom errors for better gas efficiency

## 🔧 Contract Functions

### Owner-Only Functions

| Function | Description | Modifiers |
|----------|-------------|-----------|
| `updateSecretMessage(string)` | Updates the secret message | `onlyOwner`, `whenNotPaused` |
| `incrementCounter()` | Increments the owner-only counter | `onlyOwner`, `whenNotPaused` |
| `resetCounter()` | Resets counter to zero | `onlyOwner` |
| `pauseContract()` | Pauses the contract | `onlyOwner`, `whenNotPaused` |
| `unpauseContract()` | Unpauses the contract | `onlyOwner`, `whenPaused` |
| `transferOwnership(address)` | Transfers ownership | `onlyOwner` |
| `renounceOwnership()` | Renounces ownership | `onlyOwner` |
| `emergencyWithdraw()` | Withdraws all contract funds | `onlyOwner` |

### Public Functions

| Function | Description | Access |
|----------|-------------|--------|
| `publicFunction()` | Returns a public message | Anyone |
| `getContractInfo()` | Returns contract state | Anyone |
| `isOwner(address)` | Checks if address is owner | Anyone |
| `owner()` | Returns current owner address | Anyone |
| `secretMessage()` | Returns current secret message | Anyone |
| `ownerOnlyCounter()` | Returns counter value | Anyone |
| `contractPaused()` | Returns pause status | Anyone |

## 🛠 Usage Examples

### Deploy Contract
```javascript
const OwnerOnly = await ethers.getContractFactory("OwnerOnly");
const ownerOnly = await OwnerOnly.deploy();
await ownerOnly.deployed();
```

### Owner Operations
```javascript
// Update secret message (only owner)
await ownerOnly.updateSecretMessage("New secret message");

// Increment counter (only owner)
await ownerOnly.incrementCounter();

// Pause contract (only owner)
await ownerOnly.pauseContract();

// Transfer ownership (only owner)
await ownerOnly.transferOwnership(newOwnerAddress);
```

### Public Operations
```javascript
// Anyone can call these
const info = await ownerOnly.getContractInfo();
const isOwner = await ownerOnly.isOwner(someAddress);
const message = await ownerOnly.publicFunction();
```

## 🔒 Security Features

### Access Control Modifiers

```solidity
modifier onlyOwner() {
    if (msg.sender != owner) {
        revert NotOwner();
    }
    _;
}

modifier whenNotPaused() {
    if (contractPaused) {
        revert ContractIsPaused();
    }
    _;
}
```

### Custom Errors
- `NotOwner()` - Caller is not the owner
- `ContractIsPaused()` - Contract is currently paused
- `InvalidAddress()` - Invalid address provided
- `TransferFailed()` - ETH transfer failed

## 📊 Contract State

| Variable | Type | Description | Access |
|----------|------|-------------|--------|
| `owner` | address | Current contract owner | Public |
| `secretMessage` | string | Owner's secret message | Public |
| `ownerOnlyCounter` | uint256 | Counter only owner can modify | Public |
| `contractPaused` | bool | Contract pause status | Public |

## 🎯 Events

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
event SecretMessageUpdated(string newMessage);
event ContractPaused();
event ContractUnpaused();
event CounterIncremented(uint256 newValue);
event EmergencyWithdrawal(address indexed owner, uint256 amount);
```

## 🧪 Testing

Run the test suite:
```bash
npx hardhat test test/OwnerOnly.test.js
```

### Test Coverage
- ✅ Deployment and initialization
- ✅ Owner-only function access control
- ✅ Modifier enforcement
- ✅ Ownership transfer
- ✅ Pause/unpause functionality
- ✅ Emergency withdrawal
- ✅ Public function access
- ✅ Event emissions
- ✅ Error handling

## 🚀 Deployment

### Local Deployment
```bash
npx hardhat run scripts/deploy-owner.js --network localhost
```

### Testnet Deployment
```bash
npx hardhat run scripts/deploy-owner.js --network sepolia
```

### Verify Contract
```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

## 💡 Use Cases

1. **Administrative Contracts**: Functions that only admin should access
2. **Configuration Management**: Settings that only owner can modify
3. **Emergency Controls**: Pause mechanisms for security
4. **Fund Management**: Withdrawal functions for contract funds
5. **Access Control Learning**: Understanding Solidity modifiers

## ⚠️ Important Notes

1. **Owner Responsibility**: The owner has complete control over the contract
2. **Ownership Transfer**: Be careful when transferring ownership - verify the new owner address
3. **Renounce Ownership**: Renouncing ownership makes the contract permanently ownerless
4. **Pause Emergency**: Use pause function in case of emergency or maintenance
5. **Gas Costs**: Owner functions consume gas - ensure sufficient ETH balance

## 🔍 Security Considerations

- **Single Point of Failure**: Owner account is critical - secure it properly
- **Multi-sig Recommended**: Consider using multi-signature wallet for owner
- **Private Key Security**: Never share or expose the owner's private key
- **Regular Audits**: Review contract interactions and owner actions
- **Emergency Procedures**: Have plans for emergency situations

## 📚 Learning Objectives

This contract demonstrates:
- How to implement access control with modifiers
- Proper event emission for transparency
- Gas-efficient error handling with custom errors
- Pausable contract patterns
- Ownership transfer mechanisms
- Emergency withdrawal patterns

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is licensed under the MIT License.