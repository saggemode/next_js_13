import React, { useEffect, useState, useMemo , createContext} from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import axios from "axios";
import { create as ipfsHttpClient } from "ipfs-http-client";
import NFT from "../engine/abi/NFT.json";
import MARKET from "../engine/abi/MARKET.json";
import RESELL from "../engine/abi/RESELL.json";
import {
  mmnftAddress,
  mmmarketAddress,
  mmmresellAddress,
  mainnet,
  cipherHH,
  simpleCrypto,
} from "../engine/config";

import { MarketAddress, MarketAddressABI } from "./constants";

const subdomainName = "polyplace";
const projectId = "2DZ5SclLb6YJBoDvir5Rh96PAVt";
const projectSecret = "d44b2bde4d2bb227907264225330c102";

const authorization = `Basic ${Buffer.from(
  `${projectId}:${projectSecret}`
).toString("base64")}`;

const endpointBasePath = `https://${subdomainName}.infura-ipfs.io/ipfs/`;

const client = ipfsHttpClient({
  url: "https://ipfs.infura.io:5001/api/v0",
  headers: {
    authorization,
  },
});

const fetchContract = (signerOrProvider) =>
  new ethers.Contract(MarketAddress, MarketAddressABI, signerOrProvider);

const fetchContractNFT = (signerOrProvider) =>
  new ethers.Contract(mmnftAddress, NFT, signerOrProvider);

const fetchContractMarket = (signerOrProvider) =>
  new ethers.Contract(mmmarketAddress, MARKET, signerOrProvider);

export const NFTContext = createContext();
export const NFTProvider = ({ children }) => {
  const nftCurrency = "MATIC";
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoadingNFT, setIsLoadingNFT] = useState(false);

  const checkIfWalletIsConnect = async () => {
    if (!window.ethereum) return alert("Please install MetaMask.");

    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (accounts.length) {
      setCurrentAccount(accounts[0]);
    } else {
      console.log("No accounts found");
    }
  };

  useEffect(() => {
    checkIfWalletIsConnect();
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask.");

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setCurrentAccount(accounts[0]);
    window.location.reload();
  };

  const uploadToIPFS = async (file) => {
    try {
      const added = await client.add({ content: file });

      const url = endpointBasePath + added.path;

      console.log(`Upload to IPFS url: ${url}`);

      return url;
    } catch (error) {
      console.log("error uploading file");
    }
  };

  const createSale = async (url, formInputPrice, isReselling, id) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const price = ethers.utils.parseUnits(formInputPrice, "ether");
    const contract = fetchContract(signer);
    const listingPrice = await contract.getListingPrice();

    const transaction = !isReselling
      ? await contract.createToken(url, price, {
          value: listingPrice.toString(),
        })
      : await contract.resellToken(id, price, {
          value: listingPrice.toString(),
        });

    setIsLoadingNFT(true);
    await transaction.wait();
    let tx = await transaction.wait();

    console.log("Transaction: ", tx);
  };

  const createNFT = async (formInput, fileUrl, router) => {
    const { name, description, price } = formInput;

    if (!name || !description || !price || !fileUrl) return;

    const data = JSON.stringify({ name, description, image: fileUrl });

    try {
      const added = await client.add(data);
      const url = endpointBasePath + added.path;

      console.log(`Created NFT url: ${url}`);

      await createSale(url, price);

      router.push("/");
    } catch (error) {
      console.log("error uploading file");
    }
  };

  const fetchNFTs = async () => {
    setIsLoadingNFT(false);
    const provider = new ethers.providers.JsonRpcProvider(mainnet);
    const contract = fetchContract(provider);
    const data = await contract.fetchMarketItems();

    const items = await Promise.all(
      data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
        const tokenURI = await contract.tokenURI(tokenId);
        const {
          data: { image, name, description },
        } = await axios.get(tokenURI);
        const price = ethers.utils.formatUnits(
          unformattedPrice.toString(),
          "ether"
        );

        return {
          price,
          tokenId: tokenId.toNumber(),
          seller,
          owner,
          image,
          name,
          description,
          tokenURI,
        };
      })
    );

    return items;
  };

  const fetchMyNFTsOrListedNFTs = async (type) => {
    setIsLoadingNFT(false);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = fetchContract(signer);
    const data =
      type === "fetchItemsListed"
        ? await contract.fetchItemsListed()
        : await contract.fetchMyNFTs();

    const items = await Promise.all(
      data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
        const tokenURI = await contract.tokenURI(tokenId);
        const {
          data: { image, name, description },
        } = await axios.get(tokenURI);
        const price = ethers.utils.formatUnits(
          unformattedPrice.toString(),
          "ether"
        );

        return {
          price,
          tokenId: tokenId.toNumber(),
          seller,
          owner,
          image,
          name,
          description,
          tokenURI,
        };
      })
    );
    return items;
  };

  const buyNfts = async (nft) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      MarketAddress,
      MarketAddressABI,
      signer
    );

    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
    const transaction = await contract.createMarketSale(nft.tokenId, {
      value: price,
    });

    setIsLoadingNFT(true);
    await transaction.wait();
    setIsLoadingNFT(false);
  };

  // this is where another code goes to

  const buyNft = async (nft) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    //sign the transaction
    const signer = provider.getSigner();
    const contract = new ethers.Contract(mmmarketAddress, MARKET, signer);

    //set the price
    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");

    //make the sale
    const transaction = await contract.createMarketSale(
      mmnftAddress,
      nft.tokenId,
      {
        value: price,
      }
    );
    setIsLoadingNFT(true);
    await transaction.wait();
    setIsLoadingNFT(false);
  };

  const uploadMarketItem = async (url, formInputPrice) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    let contract = fetchContractNFT(signer);
    let transaction = await contract.createToken(url);
    let tx = await transaction.wait();
    let event = tx.events[0];
    let value = event.args[2];
    let tokenId = value.toNumber();
    const price = ethers.utils.parseUnits(formInputPrice, "ether");
    contract = fetchContractMarket(signer);
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();
    transaction = await contract.createMarketItem(
      mmnftAddress,
      tokenId,
      price,
      { value: listingPrice }
    );
    setIsLoadingNFT(true);
    await transaction.wait();
  };

  const createMarketItem = async (formInput, fileUrl, router) => {
    const { name, description, price } = formInput;

    if (!name || !description || !price || !fileUrl) return;

    const data = JSON.stringify({ name, description, image: fileUrl });

    try {
      const added = await client.add(data);
      const url = endpointBasePath + added.path;

      console.log(`Created NFT url: ${url}`);

      await uploadMarketItem(url, price);

      router.push("/");
    } catch (error) {
      console.log("error uploading file: " + error);
    }
  };

  const mintNFT = async (url) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    let contract = new ethers.Contract(mmnftAddress, NFT, signer);
    let cost = await contract.cost();
    let transaction = await contract.createToken(url, { value: cost });
    setIsLoadingNFT(true);
    await transaction.wait();
  };

  const mintKeepNFT = async (formInput, fileUrl, router) => {
    const { name, description, price } = formInput;

    if (!name || !description || !price || !fileUrl) return;

    const data = JSON.stringify({ name, description, image: fileUrl });

    try {
      const added = await client.add(data);
      const url = endpointBasePath + added.path;

      console.log(`Created NFT url: ${url}`);

      await mintNFT(url, price);

      router.push("/");
    } catch (error) {
      console.log("error uploading file: " + error);
    }
  };

  const loadNFTs = async () => {
    setIsLoadingNFT(false);
    const hhPrivkey = simpleCrypto.decrypt(cipherHH);
    const provider = new ethers.providers.JsonRpcProvider(mainnet);
    const wallet = new ethers.Wallet(hhPrivkey, provider);
    const tokenContract = new ethers.Contract(mmnftAddress, NFT, wallet);
    const marketContract = new ethers.Contract(mmmarketAddress, MARKET, wallet);
    const data = await marketContract.fetchMarketItems();

    const items = await Promise.all(
      data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
        const tokenURI = await tokenContract.tokenURI(tokenId);
        const {
          data: { image, name, description },
        } = await axios.get(tokenURI);
        const price = ethers.utils.formatUnits(
          unformattedPrice.toString(),
          "ether"
        );

        return {
          price,
          tokenId: tokenId.toNumber(),
          seller,
          owner,
          image,
          name,
          description,
          tokenURI,
        };
      })
    );

    return items;
  };

  const fetchMyNFTsOrListedNFTA = async (type) => {
    setIsLoadingNFT(false);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const marketContract = new ethers.Contract(mmmarketAddress, MARKET, signer);
    const tokenContract = new ethers.Contract(mmnftAddress, NFT, provider);

    const data =
      type === "fetchItemsCreated"
        ? await marketContract.fetchItemsCreated()
        : await marketContract.fetchMyNFTs();

    const items = await Promise.all(
      data.map(async ({ tokenId, seller,sold, owner, price: unformattedPrice }) => {
        const tokenURI = await tokenContract.tokenURI(tokenId);
        const {
          data: { image, name, description },
        } = await axios.get(tokenURI);
        const price = ethers.utils.formatUnits(
          unformattedPrice.toString(),
          "ether"
        );

        return {
          price,
          tokenId: tokenId.toNumber(),
          sold,
          seller,
          owner,
          image,
          name,
          description,
          tokenURI,
        };
      })
    );
   
    return items
 
  
  };

  const createSaleA = async (formInputPrice, nft, isReselling, id) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const price = ethers.utils.parseUnits(formInputPrice, "ether");

    const marketContract = new ethers.Contract(mmmarketAddress, MARKET, signer);
    const listingPrice = await marketContract.getListingPrice();

    const transaction = !isReselling
      ? await marketContract.createToken(url, price, {
          value: listingPrice.toString(),
        })
      : await marketContract.putItemToResell(id, price, {
          value: listingPrice.toString(),
        });
    setIsLoadingNFT(true);
    await transaction.wait();
    let tx = await transaction.wait();

    console.log("Transaction: ", tx);
  };

  const fetchMyNFTsOrListedNFTB = async (type) => {
    setIsLoadingNFT(false);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const marketContract = new ethers.Contract(mmmarketAddress, MARKET, signer);
    const tokenContract = new ethers.Contract(mmnftAddress, NFT, provider);

    const data =
      type === "fetchItemsCreated"
        ? await marketContract.fetchItemsCreated()
        : await marketContract.fetchMyNFTs();

        const items = await Promise.all(
          data.map(async (i) => {
            const tokenUri = await tokenContract.tokenURI(i.tokenId);
            const meta = await axios.get(tokenUri);
            let price = ethers.utils.formatUnits(i.price.toString(), "ether");
    
            let item = {
              price,
              tokenId: i.tokenId.toNumber(),
              seller: i.seller,
              owner: i.owner,
              sold: i.sold,
              image: meta.data.image,
              name: meta.data.name,
              description: meta.data.description,
            };
            return item;
          })
        );
        /* create a filtered array of items that have been sold */
        const soldItems = items.filter((i) => i.sold);
        return soldItems;
  
  };

  return (
    <NFTContext.Provider
      value={{
        nftCurrency,
        connectWallet,
        currentAccount,
        uploadToIPFS,
        createNFT,
        fetchNFTs,
        fetchMyNFTsOrListedNFTs,
        buyNft,
        createSale,
        isLoadingNFT,

        mintKeepNFT,
        loadNFTs,
        fetchMyNFTsOrListedNFTA,
        fetchMyNFTsOrListedNFTB,
        createSaleA,

        // this is the second testing
        createMarketItem,
      }}
    >
      {children}
    </NFTContext.Provider>
  );
};
