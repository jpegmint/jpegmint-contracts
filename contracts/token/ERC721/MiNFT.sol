// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "../../access/IOwnable.sol";
import "@openzeppelin/contracts/interfaces/IERC165.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC721Metadata.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

/**
 * @dev Minimal implementation https://eips.ethereum.org/EIPS/eip-721[ERC721]
 * Non-Fungible Token Standard.
 *
 * ███╗   ███╗██╗███╗   ██╗███████╗████████╗
 * ████╗ ████║██║████╗  ██║██╔════╝╚══██╔══╝
 * ██╔████╔██║██║██╔██╗ ██║█████╗     ██║   
 * ██║╚██╔╝██║██║██║╚██╗██║██╔══╝     ██║   
 * ██║ ╚═╝ ██║██║██║ ╚████║██║        ██║   
 * ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝        ╚═╝   
 *                                             
 */
contract MiNFT is Initializable, IERC165, IERC721, IERC721Metadata, IOwnable {
    
    // Contract & token owner
    address public override owner;
    
    // Token name
    string public override name;
    
    // Token name
    string public override symbol;

    // Optional base URI
    string public baseURI;

    // Total supply of tokens
    uint16 public totalSupply;
    
    // Mapping of tokenIds to token metadata
    mapping(uint16 => string) private _mintedTokens;

    //  ██████╗ ██████╗ ███╗   ██╗███████╗████████╗██████╗ ██╗   ██╗ ██████╗████████╗ ██████╗ ██████╗ 
    // ██╔════╝██╔═══██╗████╗  ██║██╔════╝╚══██╔══╝██╔══██╗██║   ██║██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗
    // ██║     ██║   ██║██╔██╗ ██║███████╗   ██║   ██████╔╝██║   ██║██║        ██║   ██║   ██║██████╔╝
    // ██║     ██║   ██║██║╚██╗██║╚════██║   ██║   ██╔══██╗██║   ██║██║        ██║   ██║   ██║██╔══██╗
    // ╚██████╗╚██████╔╝██║ ╚████║███████║   ██║   ██║  ██║╚██████╔╝╚██████╗   ██║   ╚██████╔╝██║  ██║
    //  ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝  ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝

    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` to the token collection.
     */
    constructor() initializer {
        owner = msg.sender;
    }

    function initialize(string memory name_, string memory symbol_) public initializer {
        owner = msg.sender;
        name = name_;
        symbol = symbol_;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return
            interfaceId == type(IERC165).interfaceId ||
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            interfaceId == type(IOwnable).interfaceId
        ;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, 'X');
        _;
    }

    
    // ███╗   ███╗██╗███╗   ██╗████████╗██╗███╗   ██╗ ██████╗ 
    // ████╗ ████║██║████╗  ██║╚══██╔══╝██║████╗  ██║██╔════╝ 
    // ██╔████╔██║██║██╔██╗ ██║   ██║   ██║██╔██╗ ██║██║  ███╗
    // ██║╚██╔╝██║██║██║╚██╗██║   ██║   ██║██║╚██╗██║██║   ██║
    // ██║ ╚═╝ ██║██║██║ ╚████║   ██║   ██║██║ ╚████║╚██████╔╝
    // ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝   ╚═╝   ╚═╝╚═╝  ╚═══╝ ╚═════╝ 

    /**
     * @dev Mints `tokenId` and transfers it to `owner()`.
     *
     * Emits a {Transfer} event.
     */
    function mint(uint16 tokenId, string memory metadataURI) public onlyOwner {
        require(!_exists(tokenId), '?');
        require(bytes(metadataURI).length > 0, '0');

        _mintedTokens[tokenId] = metadataURI;
        totalSupply += 1;

        emit Transfer(address(0), owner, tokenId);
    }

    /**
     * @dev Destroys `tokenId`.
     *
     * Emits a {Transfer} event.
     */
    function burn(uint16 tokenId) public onlyOwner {
        require(_exists(tokenId), '?');

        delete _mintedTokens[tokenId];
        totalSupply -= 1;

        emit Transfer(owner, address(0), tokenId);
    }

    
    // ███╗   ███╗███████╗████████╗ █████╗ ██████╗  █████╗ ████████╗ █████╗ 
    // ████╗ ████║██╔════╝╚══██╔══╝██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗
    // ██╔████╔██║█████╗     ██║   ███████║██║  ██║███████║   ██║   ███████║
    // ██║╚██╔╝██║██╔══╝     ██║   ██╔══██║██║  ██║██╔══██║   ██║   ██╔══██║
    // ██║ ╚═╝ ██║███████╗   ██║   ██║  ██║██████╔╝██║  ██║   ██║   ██║  ██║
    // ╚═╝     ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), '?');
        
        string memory metadataURI;
        string memory _tokenURI = _mintedTokens[uint16(tokenId)];

        if (bytes(baseURI).length == 0) {
            metadataURI = _tokenURI;
        } else {
            metadataURI = string(abi.encodePacked(baseURI, _tokenURI));
        }

        return metadataURI;
    }

    /**
     * @dev Updates a token's metadata URI.
     */
    function setTokenURI(uint16 tokenId, string memory metadataURI) public onlyOwner {
        require(_exists(tokenId), '?');
        _mintedTokens[tokenId] = metadataURI;
    }

    /**
     * @dev Updates contract base URI.
     */
    function setBaseURI(string memory newURI) public onlyOwner {
        baseURI = newURI;
    }

    /**
     * @dev See {IERC721-balanceOf}.
     */
    function balanceOf(address wallet) public view virtual override returns (uint256) {
        require(wallet != address(0));
        return wallet == owner ? totalSupply : 0;
    }

    /**
     * @dev See {IERC721-ownerOf}.
     */
    function ownerOf(uint256 tokenId) public view virtual override returns (address) {
        require(_exists(tokenId));
        return owner;
    }

    /**
     * @dev Returns whether `tokenId` exists.
     *
     * Tokens start existing when they are minted (`mint`),
     * and stop existing when they are burned (`burn`).
     */
    function _exists(uint256 tokenId) internal view virtual returns (bool) {
        return bytes(_mintedTokens[uint16(tokenId)]).length > 0;
    }


    // ██████╗ ███████╗ █████╗ ██████╗        ██████╗ ███╗   ██╗██╗  ██╗   ██╗
    // ██╔══██╗██╔════╝██╔══██╗██╔══██╗      ██╔═══██╗████╗  ██║██║  ╚██╗ ██╔╝
    // ██████╔╝█████╗  ███████║██║  ██║█████╗██║   ██║██╔██╗ ██║██║   ╚████╔╝ 
    // ██╔══██╗██╔══╝  ██╔══██║██║  ██║╚════╝██║   ██║██║╚██╗██║██║    ╚██╔╝  
    // ██║  ██║███████╗██║  ██║██████╔╝      ╚██████╔╝██║ ╚████║███████╗██║   
    // ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝        ╚═════╝ ╚═╝  ╚═══╝╚══════╝╚═╝   
    //
    //  https://eips.ethereum.org/EIPS/eip-721 Read only NFT registry.

    /**
     * @dev See {IERC721-getApproved}.
     */
    function getApproved(uint256) public view virtual override returns (address) {
        return address(0);
    }

    /**
     * @dev See {IERC721-isApprovedForAll}.
     */
    function isApprovedForAll(address, address) public view virtual override returns (bool) {
        return false;
    }

    /**
     * @dev See {IERC721-approve}.
     */
    function approve(address, uint256) public virtual override {
        revert('X');
    }

    /**
     * @dev See {IERC721-setApprovalForAll}.
     */
    function setApprovalForAll(address, bool) public virtual override {
        revert('X');
    }

    /**
     * @dev See {IERC721-setApprovalForAll}.
     */
    function transferFrom(address, address, uint256) public virtual override {
        revert('X');
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(address, address, uint256) public virtual override {
        revert('X');
    }
    
    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(address, address, uint256, bytes memory) public virtual override {
        revert('X');
    }
}
