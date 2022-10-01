/* eslint-disable react/jsx-filename-extension */
import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form, FloatingLabel } from "react-bootstrap";
import { uploadFileToWebStorage } from "../../../utils/minter";

// basic properties that can be added to NFT
const TYPE = ["For Basic Schools", "For Secondary Schools"," For Tertiary Institutions"];
const NEEDS = ["Classrooms","Computers","Furniture", "Laboratory", "Library","Toilet","Books","Online course Access","Toys","School building","marker board","Interractive board"];


const AddNfts = ({ save, address }) => {
  const [name, setName] = useState("");
  const [ipfsImage, setIpfsImage] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("")

  //store properties of an NFT
  const [properties, setProperties] = useState([]);
  const [show, setShow] = useState(false);


  // check if all form data has been filled
  const isFormFilled = () =>{
   return name && price && ipfsImage && description && properties.length > 1;
  }
      

  // close the popup modal
  const handleClose = () => {
    setShow(false);
    setProperties([]);
  };

  // display the popup modal
  const handleShow = () => setShow(true);

  // add a property to an NFT
  const setPropertiesFunc = (e, trait_type) => {
    const {value} = e.target;
    const propertyObject = {
      trait_type,
      value,
    };
    const arr = properties;

    // check if property already exists
    const index = arr.findIndex((el) => el.trait_type === trait_type);

    if (index >= 0) {

      // update the existing properties
      arr[index] = {
        trait_type,
        value,
      };
      setProperties(arr);
      return;
    }

    // add a new attribute
    setProperties((oldArray) => [...oldArray, propertyObject]);
  };

  return (
    <>
      <Button
        onClick={handleShow}
        variant="dark"
        className="rounded-pill px-0"
        style={{ width: "38px" }}
      >
        <i className="bi bi-plus-square-fill"></i>
      </Button>

      {/* Modal */}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create EduFundNFT</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <FloatingLabel
              controlId="inputLocation"
              label="Name"
              className="mb-3"
            >
              <Form.Control
                type="text"
                placeholder="Name of NFT"
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </FloatingLabel>

            <FloatingLabel
              controlId="inputDescription"
              label="Description"
              className="mb-3"
            >
              <Form.Control
                as="textarea"
                placeholder="description"
                style={{ height: "80px" }}
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
              />
            </FloatingLabel>
            <FloatingLabel
              controlId="inputLocation"
              label="Price"
              className="mb-3"
            >
              <Form.Control
                type="number"
                placeholder="Price of NFT"
                onChange={(e) => {
                  setPrice(e.target.value);
                }}
              />
            </FloatingLabel>

            <Form.Control
              type="file"
              className={"mb-3"}
              onChange={async (e) => {
                const imageUrl = await uploadFileToWebStorage(e);
                if (!imageUrl) {
                  alert("failed to upload image");
                  return;
                }
                setIpfsImage(imageUrl);
              }}
              placeholder="EduFund name"
            ></Form.Control>
            <Form.Label>
              <h5>Properties</h5>
            </Form.Label>
         

            <Form.Control
              as="select"
              className={"mb-3"}
              onChange={async (e) => {
                setPropertiesFunc(e, "need");
              }}
              placeholder="Need"
            >
              <option hidden>Need</option>
              {NEEDS.map((need) => (
                <option
                  key={`need-${need.toLowerCase()}`}
                  value={need.toLowerCase()}
                >
                  {need}
                </option>
              ))}
            </Form.Control>
            <Form.Control
              as="select"
              className={"mb-3"}
              onChange={async (e) => {
                setPropertiesFunc(e, "type");
              }}
              placeholder="Type"
            >
              <option hidden>Type</option>
              {TYPE.map((type) => (
                <option
                  key={`type-${type.toLowerCase()}`}
                  value={type.toLowerCase()}
                >
                  {type}
                </option>
              ))}
            </Form.Control>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="outline-secondary"
            disabled={!isFormFilled()}
            onClick={() => {
              save({
                name,
                price,
                ipfsImage,
                description,
                ownerAddress: address,
                properties,
              });
              handleClose();
            }}
          >
            Create NFT
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

 AddNfts.propTypes = {

  // props passed into this component
  save: PropTypes.func.isRequired,
  address: PropTypes.string.isRequired,
};

export default AddNfts;


