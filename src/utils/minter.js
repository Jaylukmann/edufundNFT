import {Web3Storage} from "web3.storage/dist/bundle.esm.min.js";
import { ethers } from "ethers";
import axios from "axios";
import { Buffer } from 'buffer';


// initialize IPFS
const ipfsClient = require('ipfs-http-client');
const projectId = '2FMpjpUwR5R1PBvgXsQUVqLn5i6';
const projectSecret = 'dece04dd53bda492e7c135420fc72bed' ;
const auth =
'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const client = ipfsClient.create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  apiPath: '/api/v0',
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
      owner: defaultAccount
    });
    
  
    try {
      // save NFT metadata to IPFS
      const added = await client.add(data);
      // IPFS url for uploaded metadata
      const url = `https://edufundnft.infura-ipfs.io/${added.path}`
      const _price = ethers.utils.parseUnits(String(price), "ether");
    
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

// function to upload a file to IPFS
export const uploadToIpfs = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
      const added = await client.add(file, {
          progress: (prog) => console.log(`received: ${prog}`),
      });
      return `https://edufundnft.infura-ipfs.io/${added.path}`;
  } catch (error) {
      console.log("Error uploading file: ", error);
  }
};

// function to upload a file to IPFS
 
export const uploadFileToWebStorage = async (e) => {
  // Construct with token and endpoint
 const client = new Web3Storage({token: process.env.REACT_APP_STORAGE_API_KEY});
  const file = e.target.files;
  if (!file) return;
  // Pack files into a CAR and send to web3.storage
  const rootCid = await client.put(file) // Promise<CIDString>
  console.log("uploading file");

  // Fetch and verify files from web3.storage
  const res = await client.get(rootCid) // Promise<Web3Response | null>
  const files = await res.files() // Promise<Web3File[]>

  return `https://edufundnft.infura-ipfs.io/${files[0].cid}`;
};
// get the metadata for an NFT from IPFS
export const getFacility = async (minterContract) => {
  try {
    const facilities = [];
    const facilitiesLength = await minterContract.methods.getTotalFacility().call();
    for (let i = 1; i <= Number(facilitiesLength); i++) {
      const facility = new Promise(async (resolve) => {
        const facility = await minterContract.methods.getFacility(i).call();
        console.log(facility);
        const res = await minterContract.methods.tokenURI(i).call();
        const meta = await getNftMeta(res);
        const owner = await getNftOwner(minterContract, i);
        resolve({
          index: i,
          tokenId: i,
          owner,
          name: meta.data.name,
          price: facility.price,
          description: meta.data.description,
          properties: meta.data.properties ,
          image: meta.data.image,
          sold: facility.sold
        });
      });
      facilities.push(facility);
    }
    return Promise.all(facilities);
  } catch (e) {
    console.log({ e });
  }
};
// get all NFTs on the smart contract
export const getNftMeta = async () => {
  const ipfsUrl = 'https://edufundnft.infura-ipfs.io/QmeWZ2bKgeQwLaLDj5sZV521ND8P2uUHtDzmo2uDJdkZRR'
  try {
    if (!ipfsUrl) return null;
    const meta = await axios.get(ipfsUrl);
    return meta;
  } catch (e) {
    console.log({ e });
  }
};

// get the owner address of an NFT
export const getNftOwner = async (minterContract, index) => {
  try {
    return await minterContract.methods
    .getNftOwner(index).call();
  } catch (e) {
    console.log({ e });
  }
};

// get the address that deployed the NFT contract
export const getContractOwner = async (minterContract) => {
  try {
    let owner = await minterContract.methods
    .getContractOwner().call();
    return owner;
  } catch (e) {
    console.log({ e });
  }
};



export const fundFacility = async (
  minterContract,
  index,
  tokenId,
  performActions
) => {
  try {
    await performActions(async (kit) => {
      const { defaultAccount } = kit;
      const getFacility = await minterContract.methods
      .getFacility(index).call();
      await minterContract.methods
        .buyNFT_to_fund_Edu(tokenId)
        .send({ from: defaultAccount, value: getFacility.price });
    });
  } catch (error) {
    console.log({ error });
  }
};

export const reList = async (minterContract, tokenId, performActions) => {
  try {
    await performActions(async (kit) => {
      const { defaultAccount } = kit;
      const getListPrice = await minterContract.methods
      .getListPrice().call();
      console.log(getListPrice);
      await minterContract.methods
        .re_ListNFT(tokenId,minterContract)
        .send({ from: defaultAccount, value: getListPrice });
    });
  } catch (error) {
    console.log({ error });
  }
};

export const fundRelistFacility = async (
  minterContract,
  index,
  tokenId,
  performActions
) => {
  try {
    await performActions(async (kit) => {
      const { defaultAccount } = kit;
      const getFacility = await minterContract.methods.getFacility(index).call();
      await minterContract.methods
        .buyResaleNFT(tokenId,minterContract)
        .send({ from: defaultAccount, value: getFacility.price });
    });
  } catch (error) {
    console.log({ error });
  }
};
