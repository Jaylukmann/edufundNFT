import React from "react";
import PropTypes from "prop-types";
import { Card, Col, Badge, Stack, Row } from "react-bootstrap";
import {  Button } from "react-bootstrap";
import { truncateAddress } from "../../../utils";
import Identicon from "../../ui/Identicon";

  const NftCard = ({
  facility,
  account,
  contractOwner,
  fundFacility,
  fundRelistFacility,
  reList,
  }) => {
  const{image, description, owner, name, index, price, properties, sold } = facility;

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
              {price / 10 ** 18} CELO
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
              {properties.map((property,key) => (
                <Col key={key}>
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
            <h2>Administrator</h2>
          ) : !sold ? (
            <Button variant="primary" onClick={fundFacility}>
              Fund Educational Facility
            </Button>)
            
             (<Button variant="primary" onClick={ fundRelistFacility}>
             Re-fund NFT
           </Button>
          ) : account === owner ? (
            <Button variant="outline-danger" onClick={reList}>
            RE-LIST
            </Button>
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
  nft: PropTypes.instanceOf(Object).isRequired,
};
export default NftCard;
