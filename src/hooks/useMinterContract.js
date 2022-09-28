import { useContract } from "./useContract";
import EduFundNFTAbi from "../contracts/EduFundNFT.json";
import EduFundNFTAddress from "../contracts/EduFundNFT-address.json";

// export interface for smart contract
export const useMinterContract = () =>
  useContract(EduFundNFTAbi.abi, EduFundNFTAddress.EduFundNFT);
