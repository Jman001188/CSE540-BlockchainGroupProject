const { ethers } = require('ethers');

/**
 * Send the chain native currency (ETH on Ethereum, etc.) from a funded wallet to a recipient.
 *
 * Env (optional auto-fund on POST /company):
 *   AUTO_FUND_NEW_COMPANY_WALLETS=true
 *   FAUCET_PRIVATE_KEY=0x...   (account that already has balance on RPC_URL chain — e.g. Hardhat #0)
 *   FAUCET_AMOUNT_ETH=10         (optional, default 10)
 */
async function sendEthToAddress(provider, faucetPrivateKey, toAddress, amountWei) {
    const value = amountWei ?? ethers.parseEther('10');
    const faucet = new ethers.Wallet(faucetPrivateKey.trim(), provider);
    const tx = await faucet.sendTransaction({ to: toAddress, value });
    const receipt = await tx.wait();
    return {
        transactionHash: receipt.hash,
        from: faucet.address,
        to: toAddress,
        valueWei: value.toString(),
    };
}

function shouldAutoFundNewCompanyWallets() {
    return (
        process.env.AUTO_FUND_NEW_COMPANY_WALLETS === 'true' &&
        !!process.env.FAUCET_PRIVATE_KEY?.trim() &&
        !!process.env.RPC_URL?.trim()
    );
}

function getFaucetAmountWei() {
    const raw = process.env.FAUCET_AMOUNT_ETH?.trim();
    if (!raw) {
        return ethers.parseEther('10');
    }
    return ethers.parseEther(raw);
}

module.exports = {
    sendEthToAddress,
    shouldAutoFundNewCompanyWallets,
    getFaucetAmountWei,
};
