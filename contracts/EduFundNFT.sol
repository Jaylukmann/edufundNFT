// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";


import "hardhat/console.sol";


contract EduFundNFT is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable {
    //CONSTRUCTOR
    constructor() ERC721("EduFundNFT", "EFNFT") {}

    //The following functions are overrides required by Solidity as they are declared times from the source

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev See {IERC721-transferFrom}.
     * Changes is made to transferFrom to keep track of the new owner of the facility
     */
    function transferFrom(
        address from,
        address to,
        uint256 _tokenId
    ) public override(ERC721) {
        facility[_tokenId].owner = payable(to);
        super.transferFrom(from, to, _tokenId);
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     * Changes is made to safeTransferFrom to keep track of the new owner of the facility
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 _tokenId,
        bytes memory data
    ) public override(ERC721) {
        facility[_tokenId].owner = payable(to);
        _safeTransfer(from, to, _tokenId, data);
    }

    // STATE VARIABLES
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    uint256 listPrice;

    struct EduFacility {
        uint256 tokenId;
        address payable owner;
        uint256 price;
        bool sold;
    }
    mapping(uint256 => EduFacility) private facility;

    event FacilityCreated(
        uint256 indexed tokenId,
        address payable owner,
        uint256 price,
        bool sold
    );

    modifier canRelist(uint256 _tokenId) {
        require(
            facility[_tokenId].owner == payable(msg.sender),
            "Only new NFT owner Can Relist"
        );
        _;
    }

    /**
     * @dev allow the contract's owner to create new NFTs representing facilities that needs funding
     */
    function createFacility(string calldata _tokenURI, uint256 price)
        public
        payable
        onlyOwner
        returns (uint256)
    {
        require(price > 0, "Price must be greater than zero");
        _tokenIdCounter.increment();
        uint256 newTokenId = _tokenIdCounter.current();

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);

        facility[newTokenId] = EduFacility(
            newTokenId,
            payable(msg.sender),
            price,
            false
        );
        safeTransferFrom(facility[newTokenId].owner, address(this), newTokenId);
        emit FacilityCreated(newTokenId, payable(msg.sender), price, false);
        return newTokenId;
    }

    /**
     * @dev allow users to buy and fund a facility by buying the NFT
     */
    function buyNFT_to_fund_Edu(uint256 _tokenId) public payable {
        EduFacility storage currentFacility = facility[_tokenId];
        uint256 price = currentFacility.price;
        address payable owner = currentFacility.owner;
        require(
            msg.value == price,
            "Value must be equal to or greater than NFT price"
        );
        require(currentFacility.sold == false, " NFT is not for sale");
        currentFacility.sold = true;
        currentFacility.owner = payable(msg.sender);
        _transfer(address(this), msg.sender, _tokenId);
        (bool success, ) = payable(owner).call{value: price}("");
        require(success, "Transfer failed");
    }

    /**
     * @dev allow users to relist NFTs they bought when they funded a facility
     */
    function re_ListNFT(uint256 _tokenId, uint256 newPrice)
        public
        payable
        canRelist(_tokenId)
    {
        require(msg.value == listPrice);
        EduFacility storage currentFacility = facility[_tokenId];
        _transfer(msg.sender, address(this), _tokenId);
        currentFacility.sold = false;
        currentFacility.owner = payable(msg.sender);
        currentFacility.price = newPrice;
        (bool success, ) = payable(owner()).call{value: msg.value}("");
        require(success, "Transfer failed");
    }

    /**
        * @dev allow the contract's owner to update and change the list price
     */
    function changeNFTPrice(uint256 _listPrice) public payable onlyOwner {
        listPrice = _listPrice;
    }

    //GETTERS
    function getListPrice() public view returns (uint256) {
        return listPrice;
    }

    function getFacility(uint256 _tokenId)
        public
        view
        returns (EduFacility memory)
    {
        return facility[_tokenId];
    }

    function getTotalFacility() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
      // onERC721Received function helps the smart contract to receive NFT
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
//EduFundNFT  0xd9bD3a52BC33064eEDe5F331173B9B6FB50411f8