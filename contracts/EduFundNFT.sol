// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract EduFundNFT is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable,IERC721Receiver{

     // STATE VARIABLES
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    //CONSTRUCTOR
    constructor() ERC721("EduFundNFT", "EFNFT") {
    }

    //The following functions are overrides required by Solidity as they are declared times from the source



 function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721,ERC721Enumerable)
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
        tokenIdToFacility[_tokenId].owner = payable(to);
        _safeTransfer(from, to, _tokenId, data);
    }

    struct EduFacility {
        uint256 tokenId;
        address payable owner;
        uint256 price;
        bool sold;
    }
    mapping(uint256 => EduFacility) private tokenIdToFacility;

    event FacilityCreated(
        uint256 indexed tokenId,
        address payable owner,
        address payable seller ,
        uint256 price,
        bool sold
    );
                //MODIFIERS
    modifier canRelist(uint256 _tokenId) {
        EduFacility storage currentFacility = tokenIdToFacility[_tokenId];
        require(
            tokenIdToFacility[_tokenId].owner == payable(msg.sender) &&
            tokenIdToFacility[_tokenId].sold == true,
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

        tokenIdToFacility[newTokenId] = EduFacility(
            newTokenId,
            payable(msg.sender),
            price,
            false
        );
        safeTransferFrom(tokenIdToFacility[newTokenId].owner, address(this), newTokenId);
        emit FacilityCreated(newTokenId, payable(msg.sender),payable(msg.sender), price, false);
        return newTokenId;
    }

    /**
     * @dev allow users to buy and fund a facility by buying the NFT
     */
    function buyNFT_to_fund_Edu(uint256 _tokenId) public payable {
        EduFacility storage currentFacility = tokenIdToFacility[_tokenId];
        uint256 price = currentFacility.price;
        address payable CurrentOwner = currentFacility.owner;
        require(
            msg.value >= price,
            "Value must be equal to or greater than NFT price"
        );
       
        if(currentFacility.sold == false){
        safeTransferFrom(address(this), msg.sender, _tokenId);
        (bool success, ) = payable(Ownable.owner()).call{value: msg.value}("");
        require(success, "Transfer to contract owner failed ");
         
        }else {
             safeTransferFrom(address(this), msg.sender, _tokenId);
             (bool sent, ) = payable(CurrentOwner).call{value:(msg.value * 30)/100}("");
        require(sent, "part transfer to current Owner failed ");

          (bool celoSent, ) = payable(Ownable.owner()).call{value:(msg.value * 70)/100}("");
        require(celoSent, "part transfer to contract owner failed");
        }
         currentFacility.sold = true;
         currentFacility.owner = payable(msg.sender);
    }

    /**
     * @dev allow users to relist NFTs they bought when they funded a facility
     */
   function re_ListNFT(uint256 _tokenId, uint256 newPrice)
        public
        canRelist(_tokenId)
    {
        EduFacility storage currentFacility = tokenIdToFacility[_tokenId];
        currentFacility.price = newPrice ;
        safeTransferFrom(msg.sender, address(this), _tokenId);
        currentFacility.sold = true;
        currentFacility.owner = payable(msg.sender);
        currentFacility.price = newPrice;
       
    }

    /**
        * @dev allow the contract's owner to update and change the list price
     */
    function changeNFTPrice(uint256 _listPrice,uint256 _tokenId) public payable onlyOwner {
          EduFacility storage currentFacility = tokenIdToFacility[_tokenId];
        currentFacility.price  = _listPrice;
    }

    //GETTERS
    function getTokenPrice(uint256 _tokenId) public view returns (uint256) {
         EduFacility storage currentFacility = tokenIdToFacility[_tokenId];
        return currentFacility.price;
     
    }

    function getFacility(uint256 _tokenId)
        public
        view
        returns (EduFacility memory)
    {
        return tokenIdToFacility[_tokenId];
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


