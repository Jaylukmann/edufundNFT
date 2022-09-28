// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import "hardhat/console.sol";

contract EduFundNFT is ERC721URIStorage,Ownable,IERC721Receiver{

  //CONSTRUCTOR
    constructor() ERC721("EduFundNFT", "EFNFT") {}

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
   function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }
    //The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal override
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view override
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view override
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
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

    function buyNFT_to_fund_Edu(address _nftContractAddress,uint256 _tokenId) public payable {
        uint price = facility[_tokenId].price;
        require(msg.value >= price, "Value must be equal to NFT price");
        require(facility[_tokenId].isForResale == false," NFT is for resale");
        IERC721(_nftContractAddress).safeTransferFrom(address(this),msg.sender, _tokenId);
         facility[_tokenId].sold = true;
        facility[_tokenId].owner = payable(msg.sender); 
        facility[_tokenId].seller = payable(address(0));
        (bool done, ) = payable(Ownable.owner()).call{value:(msg.value)}("");
        require (done,"Cannot send value to the contract owner"); 
        facility[_tokenId].isForResale = true;     
    }

        function buyResaleNFT(address _nftContractAddress,uint256 _tokenId) public payable {
        uint price = facility[_tokenId].price;
        require(msg.value >= price, "Value must be equal to NFT price");
        require(facility[_tokenId].isForResale == true, "NFT is not for resale");
        IERC721(_nftContractAddress).safeTransferFrom(address(this),msg.sender, _tokenId);
            address seller = facility[_tokenId].seller;
            (bool send, ) = payable(seller).call{value: (msg.value * 70)/100}("");
        require(send, "Cannot send value to the new NFT owner");
         (bool etherSent, ) = payable(Ownable.owner()).call{value: (msg.value * 30)/100}("");
        require(etherSent, "Cannot send value to the contract owner");
         facility[_tokenId].owner = payable(msg.sender); 
         facility[_tokenId].sold = true;
         facility[_tokenId].isForResale = true;
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
//contract 0x8d9198Bdef669Bf2aa0266B6fc7Bd73B39cC11a8
//https://edufundnft.infura-ipfs.io/QmWBzgZ6n9kPLjJ8KspUDxjXDmge2Ghu7qaKLVi2rhqDPs