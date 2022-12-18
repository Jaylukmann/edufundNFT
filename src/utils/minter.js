import { create as ipfsHttpClient } from "ipfs-http-client";
import {Web3Storage} from 'web3.storage/dist/bundle.esm.min.js'
import { ethers } from "ethers";
import axios from "axios";
import { Buffer } from 'buffer';

//initialize IPFS
const projectId = process.env.REACT_APP_PROJECT_ID;
const projectSecret = process.env.REACT_APP_API_KEY_SECRET ;
const auth =
	"Basic " +
	Buffer.from(
		projectId +
			":" +
    projectSecret
	).toString("base64");

const client = ipfsHttpClient({
	host: "ipfs.infura.io",
	port: 5001,
	protocol: "https",
	apiPath: "/api/v0",
	headers: {
		authorization: auth,
	},
});

export const createFacility = async (
  minterContract,
  performActions,
  { name, price, description, ipfsImage, properties}
) => {
  await performActions(async (kit) => {
    if (!name || !description || !ipfsImage ) return;
    const { defaultAccount } = kit;

    // convert NFT metadata to JSON format
    const data = JSON.stringify({
      name,
      price,
      description,
      image: ipfsImage,
      properties,
      owner: defaultAccount,
    });
    
      // save NFT metadata to IPFS
      const added = await client.add(data);
      //IPFS url for uploaded metadata
      try {
      const _price = ethers.utils.parseUnits(String(price), "ether");
      const url = `https://infura-ipfs.io/ipfs/${added.path}`
      
    
      // mint the NFT and save the IPFS url to the blockchain
      let transaction = await minterContract.methods
        .createFacility(url,_price)
        .send({ from: defaultAccount });
      return transaction;
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
   });
 };

//function to upload a file to IPFS
export const uploadToIpfs = async (file) => {
	if (!file) return;
  try {
      const cid = await client.add(file, {
          progress: (prog) => console.log(`Received file now: ${prog}`),
      });
      return `https://infura-ipfs.io/ipfs/${cid.path}`;
  } catch (error) {
      console.log("Error uploading file: ", error);
  }
};

export const uploadFileToWebStorage = async (e) => {
  // Construct with token and endpoint
  const client = new Web3Storage({token: process.env.REACT_APP_STORAGE_API_KEY})

  const file = e.target.files;
  if (!file) return;
  // Pack files into a CAR and send to web3.storage
  const rootCid = await client.put(file) // Promise<CIDString>

  // Fetch and verify files from web3.storage
  const res = await client.get(rootCid) // Promise<Web3Response | null>
  const files = await res.files() // Promise<Web3File[]>

  return `https://infura-ipfs.io/ipfs/${files[0].cid}`;
};
// get the metadata for an NFT from IPFS
export const getFacility = async (minterContract) => {
  try {
    const facilities = [];
    const facilityLength = await minterContract.methods.totalSupply().call();
    for (let i = 1; i <= Number(facilityLength); i++) {
      const nft = new Promise(async (resolve) => {
         const facility = await minterContract.methods.getFacility(i).call();
         console.log(facility);
        const res = await minterContract.methods.tokenURI(i).call();
        console.log(res);
        
        const meta = await getNftMeta(res);
        const owner = await getNftOwner(minterContract, i);
        resolve({
          tokenId: i,
          owner,
          price: facility.price,
          sold: facility.sold,
          name: meta?.data.name,
          image: meta?.data.image,
          description: meta?.data.description,
          properties: meta?.data.properties , 
        });
      });
      facilities.push(nft);
    }
    return Promise.all(facilities);
  } catch (e) {
    console.log({ e });
  }
};
// get all NFTs on the smart contract
export const getNftMeta = async (ipfsUrl) => {
  console.log(ipfsUrl);
  try {
    if (!ipfsUrl) return null;
    const meta = await axios.get(ipfsUrl);
    return meta;
  } catch (e) {
    console.log({ e });
  }
};

// get the owner address of an NFT
export const getNftOwner = async (minterContract, tokenId) => {
  try {
    return await minterContract.methods
    .ownerOf(tokenId).call();
  } catch (e) {
    console.log({ e });
  }
};

// get the address that deployed the NFT contract
export const getContractOwner = async (minterContract) => {
  try {
    let owner = await minterContract.methods
    .owner().call();
    return owner;
  } catch (e) {
    console.log({ e });
  }
};

export const fundFacility = async (
  minterContract,
  performActions,
  tokenId
) => {
  try {
    await performActions(async (kit) => {
      const { defaultAccount } = kit;
      const facility = await minterContract.methods
      .getFacility(tokenId).call();
      await minterContract.methods
        .buyNFT_to_fund_Edu(tokenId)
        .send({ from: defaultAccount, value: facility.price });
    });
    console.log("Facility funded successfully")
  } catch (error) {
    console.log({ error });
  }
};

export const reList = async (minterContract, performActions, tokenId) => {
  try {
    await performActions(async (kit) => {
      const { defaultAccount } = kit;
      const facility = await minterContract.methods
      .getFacility(tokenId).call();
       await minterContract.methods
        .re_ListNFT(tokenId,facility.price)
        .send({ from: defaultAccount});
    });
  } catch (error) {
    console.log({ error });
  }
};

