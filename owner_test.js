const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OwnerOnly Contract", function () {
    let ownerOnly;
    let owner;
    let addr1;
    let addr2;
    let addrs;

    beforeEach(async function () {
        // Get the ContractFactory and Signers
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        // Deploy the contract
        const OwnerOnly = await ethers.getContractFactory("OwnerOnly");
        ownerOnly = await OwnerOnly.deploy();
        await ownerOnly.deployed();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await ownerOnly.owner()).to.equal(owner.address);
        });

        it("Should set initial secret message", async function () {
            expect(await ownerOnly.secretMessage()).to.equal("Initial secret message");
        });

        it("Should set initial counter to 0", async function () {
            expect(await ownerOnly.ownerOnlyCounter()).to.equal(0);
        });

        it("Should set contract as not paused", async function () {
            expect(await ownerOnly.contractPaused()).to.equal(false);
        });
    });

    describe("Owner-only functions", function () {
        describe("updateSecretMessage", function () {
            it("Should allow owner to update secret message", async function () {
                const newMessage = "New secret message";
                await expect(ownerOnly.updateSecretMessage(newMessage))
                    .to.emit(ownerOnly, "SecretMessageUpdated")
                    .withArgs(newMessage);
                
                expect(await ownerOnly.secretMessage()).to.equal(newMessage);
            });

            it("Should revert when non-owner tries to update message", async function () {
                await expect(
                    ownerOnly.connect(addr1).updateSecretMessage("Unauthorized message")
                ).to.be.revertedWithCustomError(ownerOnly, "NotOwner");
            });

            it("Should revert when contract is paused", async function () {
                await ownerOnly.pauseContract();
                await expect(
                    ownerOnly.updateSecretMessage("Message when paused")
                ).to.be.revertedWithCustomError(ownerOnly, "ContractIsPaused");
            });
        });

        describe("incrementCounter", function () {
            it("Should allow owner to increment counter", async function () {
                await expect(ownerOnly.incrementCounter())
                    .to.emit(ownerOnly, "CounterIncremented")
                    .withArgs(1);
                
                expect(await ownerOnly.ownerOnlyCounter()).to.equal(1);
            });

            it("Should revert when non-owner tries to increment", async function () {
                await expect(
                    ownerOnly.connect(addr1).incrementCounter()
                ).to.be.revertedWithCustomError(ownerOnly, "NotOwner");
            });

            it("Should increment multiple times correctly", async function () {
                await ownerOnly.incrementCounter();
                await ownerOnly.incrementCounter();
                await ownerOnly.incrementCounter();
                
                expect(await ownerOnly.ownerOnlyCounter()).to.equal(3);
            });
        });

        describe("resetCounter", function () {
            it("Should allow owner to reset counter", async function () {
                await ownerOnly.incrementCounter();
                await ownerOnly.incrementCounter();
                expect(await ownerOnly.ownerOnlyCounter()).to.equal(2);
                
                await expect(ownerOnly.resetCounter())
                    .to.emit(ownerOnly, "CounterIncremented")
                    .withArgs(0);
                
                expect(await ownerOnly.ownerOnlyCounter()).to.equal(0);
            });

            it("Should revert when non-owner tries to reset", async function () {
                await expect(
                    ownerOnly.connect(addr1).resetCounter()
                ).to.be.revertedWithCustomError(ownerOnly, "NotOwner");
            });
        });

        describe("Pause functionality", function () {
            it("Should allow owner to pause contract", async function () {
                await expect(ownerOnly.pauseContract())
                    .to.emit(ownerOnly, "ContractPaused");
                
                expect(await ownerOnly.contractPaused()).to.equal(true);
            });

            it("Should allow owner to unpause contract", async function () {
                await ownerOnly.pauseContract();
                
                await expect(ownerOnly.unpauseContract())
                    .to.emit(ownerOnly, "ContractUnpaused");
                
                expect(await ownerOnly.contractPaused()).to.equal(false);
            });

            it("Should revert when non-owner tries to pause", async function () {
                await expect(
                    ownerOnly.connect(addr1).pauseContract()
                ).to.be.revertedWithCustomError(ownerOnly, "NotOwner");
            });

            it("Should revert when trying to pause already paused contract", async function () {
                await ownerOnly.pauseContract();
                
                await expect(ownerOnly.pauseContract())
                    .to.be.revertedWithCustomError(ownerOnly, "ContractIsPaused");
            });
        });

        describe("Ownership transfer", function () {
            it("Should allow owner to transfer ownership", async function () {
                await expect(ownerOnly.transferOwnership(addr1.address))
                    .to.emit(ownerOnly, "OwnershipTransferred")
                    .withArgs(owner.address, addr1.address);
                
                expect(await ownerOnly.owner()).to.equal(addr1.address);
            });

            it("Should revert when transferring to zero address", async function () {
                await expect(
                    ownerOnly.transferOwnership(ethers.constants.AddressZero)
                ).to.be.revertedWithCustomError(ownerOnly, "InvalidAddress");
            });

            it("Should revert when non-owner tries to transfer ownership", async function () {
                await expect(
                    ownerOnly.connect(addr1).transferOwnership(addr2.address)
                ).to.be.revertedWithCustomError(ownerOnly, "NotOwner");
            });

            it("Should allow new owner to use owner-only functions", async function () {
                await ownerOnly.transferOwnership(addr1.address);
                
                await expect(ownerOnly.connect(addr1).updateSecretMessage("New owner message"))
                    .to.emit(ownerOnly, "SecretMessageUpdated")
                    .withArgs("New owner message");
            });
        });

        describe("renounceOwnership", function () {
            it("Should allow owner to renounce ownership", async function () {
                await expect(ownerOnly.renounceOwnership())
                    .to.emit(ownerOnly, "OwnershipTransferred")
                    .withArgs(owner.address, ethers.constants.AddressZero);
                
                expect(await ownerOnly.owner()).to.equal(ethers.constants.AddressZero);
            });

            it("Should revert when non-owner tries to renounce", async function () {
                await expect(
                    ownerOnly.connect(addr1).renounceOwnership()
                ).to.be.revertedWithCustomError(ownerOnly, "NotOwner");
            });
        });
    });

    describe("Public functions", function () {
        it("Should allow anyone to call public function", async function () {
            const result = await ownerOnly.connect(addr1).publicFunction();
            expect(result).to.equal("This function can be called by anyone");
        });

        it("Should return correct contract info", async function () {
            const info = await ownerOnly.getContractInfo();
            expect(info.currentOwner).to.equal(owner.address);
            expect(info.currentMessage).to.equal("Initial secret message");
            expect(info.currentCounter).to.equal(0);
            expect(info.isPaused).to.equal(false);
            expect(info.contractBalance).to.equal(0);
        });

        it("Should correctly identify owner", async function () {
            expect(await ownerOnly.isOwner(owner.address)).to.equal(true);
            expect(await ownerOnly.isOwner(addr1.address)).to.equal(false);
        });
    });

    describe("Emergency withdrawal", function () {
        beforeEach(async function () {
            // Send some ETH to the contract
            await owner.sendTransaction({
                to: ownerOnly.address,
                value: ethers.utils.parseEther("1.0")
            });
        });

        it("Should allow owner to withdraw all funds", async function () {
            const initialBalance = await ethers.provider.getBalance(owner.address);
            const contractBalance = await ethers.provider.getBalance(ownerOnly.address);
            
            const tx = await ownerOnly.emergencyWithdraw();
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);
            
            const finalBalance = await ethers.provider.getBalance(owner.address);
            const finalContractBalance = await ethers.provider.getBalance(ownerOnly.address);
            
            expect(finalContractBalance).to.equal(0);
            expect(finalBalance).to.equal(initialBalance.add(contractBalance).sub(gasUsed));
        });

        it("Should emit emergency withdrawal event", async function () {
            const contractBalance = await ethers.provider.getBalance(ownerOnly.address);
            
            await expect(ownerOnly.emergencyWithdraw())
                .to.emit(ownerOnly, "EmergencyWithdrawal")
                .withArgs(owner.address, contractBalance);
        });

        it("Should revert when non-owner tries to withdraw", async function () {
            await expect(
                ownerOnly.connect(addr1).emergencyWithdraw()
            ).to.be.revertedWithCustomError(ownerOnly, "NotOwner");
        });
    });

    describe("Receive and Fallback functions", function () {
        it("Should receive ETH", async function () {
            const amount = ethers.utils.parseEther("0.5");
            
            await expect(
                owner.sendTransaction({
                    to: ownerOnly.address,
                    value: amount
                })
            ).to.changeEtherBalance(ownerOnly, amount);
        });

        it("Should handle fallback calls", async function () {
            const amount = ethers.utils.parseEther("0.1");
            
            await expect(
                owner.sendTransaction({
                    to: ownerOnly.address,
                    value: amount,
                    data: "0x1234"
                })
            ).to.changeEtherBalance(ownerOnly, amount);
        });
    });

    describe("Modifiers", function () {
        it("Should properly enforce onlyOwner modifier", async function () {
            const functions = [
                "updateSecretMessage",
                "incrementCounter",
                "resetCounter",
                "pauseContract",
                "transferOwnership",
                "renounceOwnership",
                "emergencyWithdraw"
            ];

            // Test each function throws NotOwner error for non-owner
            for (const func of functions) {
                if (func === "transferOwnership") {
                    await expect(
                        ownerOnly.connect(addr1)[func](addr2.address)
                    ).to.be.revertedWithCustomError(ownerOnly, "NotOwner");
                } else if (func === "updateSecretMessage") {
                    await expect(
                        ownerOnly.connect(addr1)[func]("test")
                    ).to.be.revertedWithCustomError(ownerOnly, "NotOwner");
                } else {
                    await expect(
                        ownerOnly.connect(addr1)[func]()
                    ).to.be.revertedWithCustomError(ownerOnly, "NotOwner");
                }
            }
        });

        it("Should properly enforce whenNotPaused modifier", async function () {
            await ownerOnly.pauseContract();
            
            await expect(
                ownerOnly.updateSecretMessage("test")
            ).to.be.revertedWithCustomError(ownerOnly, "ContractIsPaused");
            
            await expect(
                ownerOnly.incrementCounter()
            ).to.be.revertedWithCustomError(ownerOnly, "ContractIsPaused");
        });
    });
});