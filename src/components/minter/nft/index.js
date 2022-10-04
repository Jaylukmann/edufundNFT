import { useContractKit } from "@celo-tools/use-contractkit";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import AddNfts from "./Add";
import Nft from "./Card";
import Loader from "../../ui/Loader";
import { NotificationSuccess, NotificationError } from "../../ui/Notifications";
import {
  getFacility,
  fundFacility,
  reList,
  createFacility,
  getContractOwner,
} from "../../../utils/minter";
import { Row } from "react-bootstrap";

const NftList = ({ minterContract, name }) => {
  /* performActions : used to run smart contract interactions in order
   *  address : fetch the address of the connected wallet
   */
  const { performActions, address, kit } = useContractKit();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nftOwner, setNftOwner] = useState(null);
  const { defaultAccount } = kit;
  const getTotalFacility = useCallback(async () => {
    try {
      setLoading(true);

      // fetch all nfts from the smart contract
      const allFacility = await  getFacility(minterContract);
      if (!allFacility) return;
      setFacilities(allFacility);
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  }, [minterContract]);

  const addNft = async (data) => {
    try {
      setLoading(true);

      // create an nft functionality
      await createFacility(minterContract, performActions, data);
      toast(<NotificationSuccess text="Updating NFT list...." />);
      getTotalFacility();
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text="Failed to create an NFT." />);
    } finally {
      setLoading(false);
    }
  };

  const fund = async (index, tokenId) => {
    try {
      setLoading(true);
      await fundFacility(minterContract, index, tokenId, performActions);
      toast(<NotificationSuccess text="Funding an EduFundNFT...." />);
      getTotalFacility();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const listAgain = async (index) => {
    try {
      setLoading(true);
      await reList(minterContract, index, performActions);
      toast(<NotificationSuccess text="Re-listing an EdufundNFT...." />);
      getTotalFacility();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };


  const getOwner = useCallback(async (minterContract) => {
    // get the address that deployed the NFT contract
    const _address = await getContractOwner(minterContract);
    setNftOwner(_address);
  }, []);

  useEffect(() => {
    try {
      if (address && minterContract) {
        getTotalFacility();
        getOwner(minterContract);
      }
    } catch (error) {
      console.log({ error });
    }
  }, [minterContract, address, getTotalFacility, getOwner]);
  if (address) {
    return (
      <>
      {console.log(nftOwner, address)}
        {!loading ? (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="fs-4 fw-bold mb-0">{name}</h1>

              {nftOwner === address ? (
                <AddNfts save={addNft} address={address} />
              ) : null}
            </div>
            <Row xs={1} sm={2} lg={3} className="g-3  mb-5 g-xl-4 g-xxl-5">
              {/* display all NFTs */}
              {facilities.map((facility) => (
                <Nft
                  key={facility.index}
                  account={defaultAccount}
                  contractOwner={nftOwner}
                  fundFacility={() => fund(facility.index, facility.tokenId)}
                  listAgain={() => listAgain(facility.tokenId)}
                  facility={{
                    ...facility,
                  }}
                />
              ))}
            </Row>
          </>
        ) : (
          <Loader />
        )}
      </>
    );
  }
  return null;
};

NftList.propTypes = {
  // props passed into this component
  minterContract: PropTypes.instanceOf(Object),
  updateBalance: PropTypes.func.isRequired,
};

NftList.defaultProps = {
  minterContract: null,
};

export default NftList;