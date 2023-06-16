const bitcoin = require('bitcoinjs-lib');
const bip39 = require('bip39');
const axios = require('axios');

const API_URL = 'https://api.blockcypher.com/v1/btc/main?token=ed53b84bf9664100b08cc9f830eddac9';

// Function to generate a BIP39 wallet
function createWallet() {
    const mnemonic = bip39.generateMnemonic();
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const root = bitcoin.bip32.fromSeed(seed)
    const account = root.derivePath("m/44'/0'/0'/0/0");
    const { address, privateKey } = bitcoin.payments.p2pkh({ pubkey: account.publicKey });
    return { mnemonic, address, privateKey };
  }

// Function to import a BIP39 wallet from a mnemonic
function importWallet(mnemonic) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = bitcoin.bip32.fromSeed(seed);
  const account = root.derivePath("m/44'/0'/0'/0/0");
  const address = bitcoin.payments.p2pkh({ pubkey: account.publicKey }).address;
  const privateKey = account.toWIF();
  return { mnemonic, address, privateKey };
}

// Function to list all wallets
function listWallets(wallets) {
  console.log('List of wallets:');
  wallets.forEach((wallet, index) => {
    console.log(`Wallet ${index + 1}:`);
    console.log(`Address: ${wallet.address}`);
    console.log(`Private Key: ${wallet.privateKey}`);
    console.log('-----------------------');
  });
}

// Function to get the bitcoin balance of a wallet
async function getBalance(address) {
  try {
    const response = await axios.get(`${API_URL}/addrs/${address}/balance`);
    const balance = response.data.balance / 1e8;
    console.log(`Balance for ${address}: ${balance} BTC`);
  } catch (error) {
    console.log('Error:', error.message);
  }
}

// Function to get the list of bitcoin transactions of a wallet
async function getTransactions(address) {
  try {
    const response = await axios.get(`${API_URL}/addrs/${address}/full`);
    const transactions = response.data.txrefs;
    console.log(`Transactions for ${address}:`);
    transactions.forEach((tx) => {
      console.log(`TXID: ${tx.tx_hash}`);
      console.log(`Confirmations: ${tx.confirmations}`);
      console.log('-----------------------');
    });
  } catch (error) {
    console.log('Error:', error.message);
  }
}

// Function to generate an unused bitcoin address for a wallet
function generateAddress(mnemonic) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = bitcoin.bip32.fromSeed(seed);
  const account = root.derivePath("m/44'/0'/0'/0");
  const unusedAddress = bitcoin.payments.p2pkh({ pubkey: account.publicKey }).address;
  return unusedAddress;
}

// Example usage
const wallets = [];

// Creating a wallet
const wallet1 = createWallet();
wallets.push(wallet1);

// Importing a wallet
const mnemonic = 'your existing BIP39 mnemonic goes here';
const wallet2 = importWallet(mnemonic);
wallets.push(wallet2);

// Listing all wallets
listWallets(wallets);

// Getting bitcoin balance of a wallet
const address = 'your wallet address goes here';
getBalance(address);

// Getting the list of bitcoin transactions of a wallet
getTransactions(address);

// Generating an unused bitcoin address for a wallet
const unusedAddress = generateAddress(mnemonic);
console.log('Unused Address:', unusedAddress);