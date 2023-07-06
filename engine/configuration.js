/*
Private Key Encryption
Replace hhraw with your contract 
owner wallet private key "0xPRIVATEKEY"
*/

import SimpleCrypto from "simple-crypto-js"
const cipherKey = "#ffg3$dvcv4rtkljjkh38dfkhhjgt"
const hhraw = "bdf849abd9f7001ff5bffe6117d904532efcd8eecb1bc59585a145cd7c8ca38b";
export const simpleCrypto = new SimpleCrypto(cipherKey)
export const cipherEth = simpleCrypto.encrypt(hhraw)
export const cipherHH = simpleCrypto.encrypt(hhraw)

/*
MARKET AND NFT CONTRACTS
*/
export var hhresell = "0x1B2cc1A8541bd42C24D69e441423daBe1780d529";
export var hhnftcol = "0xe3AC0395bCF534fa85416c4a8A539705fB540Ec6";
export var hhnftaddress = "0xc709A12005Eff166f3Ba50D539361f43F7Abcf49";
export var hhmarketaddress = "0x9Aed9590AC77983C39c5e8D1626AD11Fd4a2e88e";
export var hhrpc = "https://polygon-mumbai.g.alchemy.com/v2/_N2T74yygUy1yEG7v2B_mbU2ML1bKWW9";
/*
NETWORK RPC ADDRESSES, Choose one then 
change the value of "hhrpc" below.
*/
var mumbai = 'https://matic-mumbai.chainstacklabs.com';
var goerli = 'https://rpc.ankr.com/eth_goerli';
var rinkeby = 'https://rpc.ankr.com/eth_rinkeby';

/*
CHANGE THIS TO YOUR PREFERRED TESTNET
*/
var hhrpc = goerli;
/*
Global Parameters
*/
export var mainnet = hhrpc

/*
DON'T FORGET TO SAVE!
*/