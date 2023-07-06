import { useState, useEffect, useContext } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import axios from "axios";
import { NFTContext } from "../context/NFTContext";
import { Loader, NFTCard, NFTCardSold } from "../components";
import { Layout } from "../components";
import { mmmarketAddress, mmnftAddress } from "../engine/config";
import NFT from "../engine/abi/NFT.json";
import MARKET from "../engine/abi/MARKET.json";
const CreatorDashboard = () => {
  const { fetchMyNFTsOrListedNFTA } = useContext(NFTContext);
  const [nfts, setNfts] = useState([]);
  const [sold, setSold] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   fetchMyNFTsOrListedNFTA("fetchItemsCreated").then((items) => {
  //     setNfts(items);
  //     setIsLoading(false);
  //   });
  // }, []);

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const marketContract = new ethers.Contract(mmmarketAddress, MARKET, signer);
    const tokenContract = new ethers.Contract(mmnftAddress, NFT, provider);
    const data = await marketContract.fetchItemsCreated();

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
    setSold(soldItems);

    setNfts(items);
    setIsLoading(false);
  }

  if (isLoading) {
    return (
      <div className="flexStart min-h-screen">
        <Loader />
      </div>
    );
  }

  if (!isLoading && nfts.length === 0) {
    return (
      <div className="flexCenter sm:p-4 p-16 min-h-screen">
        <h1 className="font-poppins dark:text-white text-nft-black-1 text-3xl font-extrabold">
          No NFTs Listed for Sale!
        </h1>
      </div>
    );
  }
  return (
    <Layout>
      <div className="flex justify-center sm:px-4 p-12 min-h-screen">
        <div className="w-full minmd:w-4/5 pt-65">
          <div className="mt-4">
            <div className="flex justify-center sm:px-4 p-12 min-h-screen">
              <div className="w-full minmd:w-4/5">
                <div className="mt-4">
                  <h2 className="font-poppins dark:text-white text-nft-black-1 text-2xl font-semibold mt-2 ml-4 sm:ml-2">
                    Listed NFTs for Sale
                  </h2>
                  <div className="mt-3 w-full flex flex-wrap justify-start md:justify-center">
                    {nfts.map((nft) => (
                      <NFTCard key={nft.tokenId} nft={nft} />
                    ))}
                  </div>
                </div>

                

                <div className="mt-4">
                  {Boolean(sold.length) && (
                    <div>
                      <h2 className="text-2xl py-2 text-white">Items sold</h2>
                      <div className="mt-3 w-full flex flex-wrap justify-start md:justify-center">
                      {sold?.map((nft) => (
                      <NFTCardSold key={nft.tokenId} nft={nft} />
                    ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreatorDashboard;
