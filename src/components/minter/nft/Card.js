import React  from "react";
import PropTypes from "prop-types";
import { Card, Col, Badge, Stack, Row } from "react-bootstrap";
import {  Button } from "react-bootstrap";
import { truncateAddress } from "../../../utils";
import Identicon from "../../ui/Identicon";

  const NftCard = ({           
  facility,
  contractOwner,
  account,
  fundFacility,
  reList
  }) => {
  const {image, description, owner, name,index,price, properties, sold } = facility;

  return (
    <Col key={index}>
      <Card className=" h-100">
        <Card.Header>
          <Stack direction="horizontal" gap={2}>
            <Identicon address={owner} size={28} />
            <span className="font-monospace text-secondary">
              {truncateAddress(owner)}
            </span>
            <Badge bg="secondary" className="ms-auto">
              {price/ 10 ** 18} CELO
            </Badge>
          </Stack>
        </Card.Header>

        <div className=" ratio ratio-4x3">
          <img src={image} alt={description} style={{ objectFit: "cover" }} />
        </div>

        <Card.Body className="d-flex  flex-column text-center">
          <Card.Title>{name}</Card.Title>
          <Card.Text className="flex-grow-1">{description}</Card.Text>
          <div>
            <Row className="mt-2">
              {properties?.map((property) => (
                <Col key = {property.tokenId}>
                  <div className="border rounded bg-light">
                    <div className="text-secondary fw-lighter small text-capitalize">
                      {property.trait_type}
                    </div>
                    <div className="text-secondary text-capitalize font-monospace">
                      {property.value}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
          {contractOwner === account ? (
             <React.Fragment>
            <p className="text-success fw-lighter large text-capitalize">Dapp Administrator</p>
              <p className="text-primary fw-lighter large ">Use the + button to mint more eduFundNFTs</p>
              </React.Fragment>
              
          ) : !sold && contractOwner !== account? (
            <Button variant="primary" onClick={fundFacility}>
              Fund Facility
            </Button>

            ): contractOwner !== account && account !== owner && sold ? 
             (<Button variant="primary" onClick={fundFacility}>
             Re-fund Facility
           </Button>

          ) : account === owner  && sold ? 
    
          (<div>
            <Button variant="outline-success" onClick={reList}>
              Re-list
            </Button>
            </div>
          ) : (
            <Button variant="outline-danger" disabled>
              SOLD
            </Button>
          )}
        </Card.Body>
      </Card>
    </Col>
  );
};


NftCard.propTypes = {
  // props passed into this component
  facility: PropTypes.instanceOf(Object).isRequired,
};
export default NftCard;
