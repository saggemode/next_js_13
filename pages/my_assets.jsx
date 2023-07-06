/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useContext } from "react";
import RESELL from "../engine/abi/RESELL.json";
import MARKET from "../engine/abi/MARKET.json";
import { ethers } from "ethers";
import axios from "axios";
import Web3Modal from "web3modal";

import Image from "next/image";

import { NFTContext } from "../context/NFTContext";
import { Loader, NFTCard, Banner, SearchBar } from "../components";
import images from "../assets";
import { shortenAddress } from "../utils/shortenAddress";

import { Layout } from "../components";
import {
  mmmarketAddress,
  mmnftAddress,
  mmmresellAddress,
} from "../engine/config";

const Casset = () => {
  const { currentAccount, fetchMyNFTsOrListedNFTA } = useContext(NFTContext);
  const [nfts, setNfts] = useState([]);
  const [nftsCopy, setNftsCopy] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSelect, setActiveSelect] = useState("Recently Added");

  const [modal, setModal] = useState(false);
  const [sellNFTInfo, setSellNFT] = useState("");
  const [priceSell, setPriceSell] = useState("");

  useEffect(() => {
    fetchMyNFTsOrListedNFTA().then((items) => {
      setNfts(items);
      setNftsCopy(items);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    const sortedNfts = [...nfts];

    switch (activeSelect) {
      case "Price (low to high)":
        setNfts(sortedNfts.sort((a, b) => a.price - b.price));
        break;
      case "Price (high to low)":
        setNfts(sortedNfts.sort((a, b) => b.price - a.price));
        break;
      case "Recently Added":
        setNfts(sortedNfts.sort((a, b) => b.tokenId - a.tokenId));
        break;
      default:
        setNfts(nfts);
        break;
    }
  }, [activeSelect]);

  if (isLoading) {
    return (
      <div className="flexStart min-h-screen">
        <Loader />
      </div>
    );
  }

  const onHandleSearch = (value) => {
    const filteredNfts = nfts.filter(({ name }) =>
      name.toLowerCase().includes(value.toLowerCase())
    );

    if (filteredNfts.length) {
      setNfts(filteredNfts);
    } else {
      setNfts(nftsCopy);
    }
  };

  const onClearSearch = () => {
    if (nfts.length && nftsCopy.length) {
      setNfts(nftsCopy);
    }
  };

  async function sellNFT(nft) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const price = ethers.utils.parseUnits(priceSell, "ether");
    const marketContract = new ethers.Contract(mmmarketAddress, MARKET, signer);
    const listingPrice = await marketContract.getListingPrice();

    const tx = await marketContract.putItemToResell(
      mmnftAddress,
      nft.itemId - 1,
      ethers.utils.parseUnits(priceSell, "ether"),
      { value: listingPrice }
    );

    await tx.wait();

    fetchMyNFTsOrListedNFTA();
  }

  return (
    <Layout>
      <div className="w-full flex justify-start items-center flex-col min-h-screen">
        <div className="w-full flexCenter flex-col">
          <Banner
            name="Your creative NFT's section."
            childStyles="text-center mb-4"
            parentStyles="h-80 justify-center"
          />

          <div className="flexCenter flex-col -mt-20 z-0">
            <div className="flexCenter w-40 h-40 sm:w-36 sm:h-36 p-1 dark:bg-nft-black-4 bg-white rounded-full">
              <Image
                src={images.creator1}
                className="rounded-full object-cover"
                objectFit="cover"
                alt="no img"
              />
            </div>
            <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-2xl mt-6">
              {shortenAddress(currentAccount)}
            </p>
          </div>
        </div>

        {/* {!isLoading && !nfts.length && !nftsCopy.length ? (
        <div className="flexCenter sm:p-4 p-16">
          <h1 className="font-poppins dark:text-white text-nft-black-1 font-extrabold text-3xl">No NFTs Owned!</h1>
        </div>
      ) : (
        <div className="sm:px-4 p-12 w-full minmd:w-4/5 flexCenter flex-col">
          <div className="flex-1 w-full flex flex-row sm:flex-col px-4 xs:px-0 minlg:px-8">
            <SearchBar
              activeSelect={activeSelect}
              setActiveSelect={setActiveSelect}
              handleSearch={onHandleSearch}
              clearSearch={onClearSearch}
            />
          </div>
          <div className="mt-3 w-full flex flex-wrap">
            {nfts.map((nft) => (
              <NFTCard
                key={nft.token}
                nft={nft}
                onProfilePage
              />
            ))}
          </div>
        </div>
      )} */}

        <div className="flex ">
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {nfts?.map((nft, i) => (
                <>
                  {nft.image ? (
                    <div
                      key={i}
                      class="max-w-sm  overflow-hidden shadow-lg border-purple-700 	rounded"
                      style={{
                        boxShadow:
                          "rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset",
                      }}
                    >
                      <img
                        class="w-full"
                        src={nft.image}
                        style={{ height: "15.625rem" }}
                        alt="Sunset in the mountains"
                      />
                      <div class="px-6 py-4">
                        <div class=" text-white font-bold text-xl mb-2">
                          {nft.name}
                        </div>
                        <p class="text-white text-base">{nft.description}</p>
                      </div>
                      <div class="px-6 py-4">
                        <div class=" text-white font-bold text-xl mb-2">
                          {" "}
                          Price
                        </div>
                        <p
                          class="font-bold text-base"
                          style={{ color: "#984dc4" }}
                        >
                          {nft.price} Matic
                        </p>
                      </div>

                      <button
                        className="bg-purple-600	 hover:bg-purple-900 w-full text-white font-bold py-2 px-12 rounded-t-md "
                        onClick={() => {
                          setModal(true);
                          setSellNFT({
                            image: nft.image,
                            price: nft.price,
                            itemId: nft.tokenId,
                          });
                        }}
                      >
                        Sell
                      </button>
                    </div>
                  ) : (
                    <></>
                  )}
                </>
              ))}
            </div>
          </div>
          {modal ? (
            <div
              class="fixed z-10 inset-0 overflow-y-auto"
              aria-labelledby="modal-title"
              role="dialog"
              aria-modal="true"
            >
              <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div
                  class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                  aria-hidden="true"
                ></div>

                <span
                  class="hidden sm:inline-block sm:align-middle sm:h-screen"
                  aria-hidden="true"
                >
                  &#8203;
                </span>

                <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div class="sm:flex sm:items-start">
                      <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <svg
                          class="h-6 w-6 text-red-600"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                      </div>
                      <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3
                          class="text-lg leading-6 font-medium text-gray-900"
                          id="modal-title"
                        >
                          Sell NFT
                        </h3>
                        <div class="mt-4">
                          <input
                            placeholder="Asset Price in Matic"
                            className="mt-2 border rounded p-4"
                            type="number"
                            min="0.1"
                            onChange={(e) => setPriceSell(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      disabled={!priceSell}
                      onClick={() => {
                        sellNFT(sellNFTInfo);
                        setModal(false);
                      }}
                      type="button"
                      class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Sell
                    </button>
                    <button
                      onClick={() => {
                        setModal(false);
                      }}
                      type="button"
                      class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Casset;
