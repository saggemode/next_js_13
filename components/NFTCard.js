/* eslint-disable @next/next/no-img-element */
import { useContext, useState } from "react";
import Router from "next/router";
import { NFTContext } from "../context/NFTContext";
import { BiHeart } from "react-icons/bi";

import images from "../assets";
import { shortenAddress } from "../utils/shortenAddress";
import { shortenName } from "../utils/shortenName";


const NFTCard = ({ nft, onProfilePage }) => {
  const { nftCurrency } = useContext(NFTContext);
  const [isListed, setIsListed] = useState(false);


  return (
    <div
      className="bg-[#303339] flex-auto w-[14rem] h-[22rem] my-10 mx-5 rounded-2xl overflow-hidden cursor-pointer"
      onClick={() => {
        Router.push({
          pathname: "/nft-details",
          query: nft,
        });
      }}
    >
      {/* <Link href={{ pathname: "/nft-details", query: nft }}></Link> */}
      <div className="h-2/3 w-full overflow-hidden flex justify-center items-center">
        <img
          src={nft.image || images[`nft${nft.i}`]}
          alt={`nft${nft.i}`}
          className="w-full object-cover hover:scale-110 transition-all duration-500"
        />
      </div>
      <div className="p-3">
        <div className="flex justify-between text-[#e4e8eb] drop-shadow-xl">
          <div className="flex-0.6 flex-wrap">
            <div className="font-semibold text-sm text-[#8a939b]">
            {shortenName(nft.name)}
            </div>
            <div className="font-bold text-lg mt-2">
            <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-sm minlg:text-lg">
              {shortenName(nft.price)}{" "}
              <span className="normal">{nftCurrency}</span>
            </p>
            <p className="font-poppins dark:text-white text-nft-black-1 text-xs minlg:text-lg">
              {shortenAddress(onProfilePage ? nft.owner : nft.seller)}
            </p>
            </div>
          </div>
          {isListed && (
            <div className="flex-0.4 text-right">
              <div className="font-semibold text-sm text-[#8a939b]">Price</div>
              <div className="flex items-center text-xl font-bold mt-2">
                <img
                  src="https://storage.opensea.io/files/6f8e2979d428180222796ff4a33ab929.svg"
                  alt="eth"
                  className="h-5 mr-2"
                />
                {price}
              </div>
            </div>
          )}
        </div>
        <div className="text-[#8a939b] font-bold flex items-center w-full justify-end mt-3">
          <span className="text-xl mr-2">
            <BiHeart />
          </span>{" "}
          {nft.likes}
        </div>
      </div>
    </div>
  );
};

export default NFTCard;
