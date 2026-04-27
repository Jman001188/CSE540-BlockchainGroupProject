# Honest Harvest Hardhat Starter Files

This folder contains three ready-to-use files for integrating the Honest Harvest Solidity contract with Hardhat and ethers.js.

## Files

- `hardhat.config.js`
- `scripts/deploy.js`
- `src/contractConnector.js`

## Expected Contract

These files assume your Solidity contract is named:

```solidity
contract SupplyChainContract
```

And that the Solidity file is inside:

```text
contracts/SupplyChainContract.sol
```

## Setup Commands

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install ethers
npx hardhat compile
```

## Local Deployment Workflow

Terminal 1:

```bash
npx hardhat node
```

Terminal 2:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

The deploy script will generate:

```text
deployments/deployed-address.json
abi/SupplyChainContract.json
```

## Important Note

If the Hardhat local node is restarted, the local blockchain resets.

That means:

- redeploy the contract
- use the newly generated address
- keep the ABI unless the Solidity contract changed
