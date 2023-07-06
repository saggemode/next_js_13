import SimpleCrypto from "simple-crypto-js"
const cipherKey = "#ffg3$dvcv4rtkljjkh38dfkhhjgt"
const ethraw = "bdf849abd9f7001ff5bffe6117d904532efcd8eecb1bc59585a145cd7c8ca38b";
const hhraw = "bdf849abd9f7001ff5bffe6117d904532efcd8eecb1bc59585a145cd7c8ca38b";
export const simpleCrypto = new SimpleCrypto(cipherKey)
export const cipherEth = simpleCrypto.encrypt(ethraw)
export const cipherHH = simpleCrypto.encrypt(hhraw)


export var mmnftAddress = "0x9C148D3D575Fc899ffe8C5Afc43D6eDbCa1A6805";
export var mmmarketAddress = "0x25A9EE2C6DdcEFFEB1B2079611f213633771e1BC";

export var mmmresellAddress = "0xb5bbE08F31F74BCbBff28aFE9076DbF1B484FacB";
export var mmmnftcol = "0x75C34c53494BCa7a80B677CF50eCF9BcA6b35D79";

export var mainnet = "https://polygon-mumbai.g.alchemy.com/v2/_N2T74yygUy1yEG7v2B_mbU2ML1bKWW9";

