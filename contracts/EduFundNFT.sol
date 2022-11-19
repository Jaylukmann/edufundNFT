// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import "hardhat/console.sol";

contract EduFundNFT is ERC721URIStorage,ERC721Enumerable,Ownable,IERC721Receiver{

  //CONSTRUCTOR
    constructor() ERC721("EduFundNFT", "EFNFT") {}
   //The following functions are overrides required by Solidity as they are declared times from the source

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
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
    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

  // STATE VARIABLES
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    uint256 listPrice;

    struct EduFacility {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
        bool isForResale;
    }
    mapping(uint256 => EduFacility) public facility;

    event FacilityCreated (
        uint256 indexed tokenId,
        address payable seller,
        address payable owner,
        uint256 price,
        bool sold
    );

       modifier canRelist(uint256 _tokenId) {
        require(facility[_tokenId].owner == payable(msg.sender), 
        "Only new NFT owner Can Relist");
        _;
    }
   
    function createFacility(string memory _tokenURI, uint256 price) public onlyOwner
     payable returns (uint) {
        _tokenIdCounter.increment();
        uint256 newTokenId = _tokenIdCounter.current();

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);
        listNFT(newTokenId, price);
        return newTokenId;
    }

    function listNFT(
        uint256 _tokenId,
        uint256 price
    ) public onlyOwner{
        require (price > 0,"Price must be greater than zero");

        facility[_tokenId] = EduFacility(
            _tokenId,
            payable(msg.sender),
            payable(msg.sender),
            price,
            false,
            false
        );
        safeTransferFrom(
            facility[_tokenId].owner,
            address(this),
            _tokenId
        );
        emit FacilityCreated(
            _tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            false
        );
    }

    function buyNFT_to_fund_Edu(uint256 _tokenId) public payable {
        uint price = facility[_tokenId].price;
        address payable  owner = facility[_tokenId].owner;
        address payable seller = facility[_tokenId].seller;
        require(msg.value >= price, "Value must be equal to or greater than NFT price");
        require(facility[_tokenId].isForResale == false," NFT is for resale");
         facility[_tokenId].sold = true;
        facility[_tokenId].owner = payable(msg.sender); 
        facility[_tokenId].seller = payable(address(0));
        facility[_tokenId].isForResale = true; 

         if(facility[_tokenId].isForResale){
            payable(owner).transfer(price);
         }  
          payable(seller).transfer(price);
    }

    function getNftOwner(uint index) public view returns (address) {
        return facility[index].owner;
    }

    function getContractOwner()public view returns (address){
        return Ownable.owner();
    }

    function re_ListNFT(uint256 _tokenId,uint256 newPrice) public payable canRelist(_tokenId) returns(uint){
        safeTransferFrom(
            msg.sender,
            address(this),
            _tokenId
        );
        facility[_tokenId].sold = false;
        facility[_tokenId].seller = payable(msg.sender);
        facility[_tokenId].owner = payable(msg.sender);
        facility[_tokenId].isForResale = true;   
        return newPrice; 
    }

     function changeNFTPrice(uint _listPrice) public payable onlyOwner {
        listPrice = _listPrice;
    }
                        //GETTERS
    function getListPrice() public view returns (uint256) {
        return listPrice;
    }

    function getFacility(uint256 _tokenId) public view returns (EduFacility memory) {
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
    ) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }

}
//EduFundNFT  0xd9bD3a52BC33064eEDe5F331173B9B6FB50411f8
// // "deploy": "npx hardhat run --network alfajores scripts/deploy.js",