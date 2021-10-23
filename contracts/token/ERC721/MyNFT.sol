// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/interfaces/IERC165.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC721Metadata.sol";
import "../../access/IOwnable.sol";

/**
 * @dev Minimal implementation https://eips.ethereum.org/EIPS/eip-721[ERC721] Non-Fungible Token Standard.
 */
contract MyNFT is IERC165, IERC721, IERC721Metadata, IOwnable {

    /// VARIABLES ///
    address public override owner;
    string public override name;
    string public override symbol;
    string public baseURI;
    uint16 public totalSupply;

    /// MAPPINGS ///
    mapping(uint16 => string) private _mintedTokens;

    /// CONSTRUCTOR ///
    constructor(string memory name_, string memory symbol_) {
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
            interfaceId == type(IOwnable).interfaceId;
    }
    
    //   __  __ _____ _   _ _______ _____ _   _  _____ 
    //  |  \/  |_   _| \ | |__   __|_   _| \ | |/ ____|
    //  | \  / | | | |  \| |  | |    | | |  \| | |  __ 
    //  | |\/| | | | | . ` |  | |    | | | . ` | | |_ |
    //  | |  | |_| |_| |\  |  | |   _| |_| |\  | |__| |
    //  |_|  |_|_____|_| \_|  |_|  |_____|_| \_|\_____|
    //                                                

    /**
     * @dev Mints `tokenId` and transfers it to `owner()`.
     *
     * Emits a {Transfer} event.
     */
    function mint(uint16 tokenId, string memory metadataURI) public onlyOwner {
        require(!_exists(tokenId));
        require(bytes(metadataURI).length > 0);

        _mintedTokens[tokenId] = metadataURI;
        totalSupply++;

        emit Transfer(address(0), owner, tokenId);
    }

    /**
     * @dev Destroys `tokenId`.
     *
     * Emits a {Transfer} event.
     */
    function burn(uint16 tokenId) public onlyOwner {
        require(_exists(tokenId));

        delete _mintedTokens[tokenId];
        totalSupply--;

        emit Transfer(owner, address(0), tokenId);
    }

    /**
     * @dev Returns whether `tokenId` exists.
     *
     * Tokens start existing when they are minted (`_mint`),
     * and stop existing when they are burned (`_burn`).
     */
    function _exists(uint256 tokenId) internal view virtual returns (bool) {
        return bytes(_mintedTokens[uint16(tokenId)]).length > 0;
    }
    
    //   __  __ ______ _______       _____       _______       
    //  |  \/  |  ____|__   __|/\   |  __ \   /\|__   __|/\    
    //  | \  / | |__     | |  /  \  | |  | | /  \  | |  /  \   
    //  | |\/| |  __|    | | / /\ \ | |  | |/ /\ \ | | / /\ \  
    //  | |  | | |____   | |/ ____ \| |__| / ____ \| |/ ____ \ 
    //  |_|  |_|______|  |_/_/    \_\_____/_/    \_\_/_/    \_\
    //

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId));

        string memory _tokenURI = _mintedTokens[uint16(tokenId)];
        return (bytes(baseURI).length == 0 ? _tokenURI : string(abi.encodePacked(baseURI, _tokenURI)));
    }

    function setBaseURI(string memory newBaseURI) public virtual onlyOwner {
        baseURI = newBaseURI;
    }

    function setTokenURI(uint16 tokenId, string memory metadataURI) public virtual onlyOwner {
        require(_exists(tokenId));
        _mintedTokens[tokenId] = metadataURI;
    }

    /**
     * @dev See {IERC721-balanceOf}.
     */
    function balanceOf(address wallet) public view virtual override returns (uint256) {
        require(wallet != address(0));
        return (wallet == owner ? totalSupply : 0);
    }

    /**
     * @dev See {IERC721-ownerOf}.
     */
    function ownerOf(uint256 tokenId) public view virtual override returns (address) {
        require(_exists(tokenId));
        return owner;
    }

    //    ______          ___   _          ____  _      ______ 
    //   / __ \ \        / / \ | |   /\   |  _ \| |    |  ____|
    //  | |  | \ \  /\  / /|  \| |  /  \  | |_) | |    | |__   
    //  | |  | |\ \/  \/ / | . ` | / /\ \ |  _ <| |    |  __|  
    //  | |__| | \  /\  /  | |\  |/ ____ \| |_) | |____| |____ 
    //   \____/   \/  \/   |_| \_/_/    \_\____/|______|______|
    //                                                         

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner == msg.sender);
        _;
    }
    
    /**
     * @dev Prevent use of renounceOwnership to ensure burn/mint is always possible.
     */
    function renounceOwnership() external virtual override onlyOwner {
        revert();
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) external virtual override onlyOwner {
        require(newOwner != address(0));
        
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    //   _______ _____            _   _  _____ ______ ______ _____   _____ 
    //  |__   __|  __ \     /\   | \ | |/ ____|  ____|  ____|  __ \ / ____|
    //     | |  | |__) |   /  \  |  \| | (___ | |__  | |__  | |__) | (___  
    //     | |  |  _  /   / /\ \ | . ` |\___ \|  __| |  __| |  _  / \___ \ 
    //     | |  | | \ \  / ____ \| |\  |____) | |    | |____| | \ \ ____) |
    //     |_|  |_|  \_\/_/    \_\_| \_|_____/|_|    |______|_|  \_\_____/ 
    //                                                                     
                                                                    
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
     * https://eips.ethereum.org/EIPS/eip-721 Read only NFT registry
     */
    function approve(address, uint256) public virtual override {
        revert();
    }

    /**
     * @dev See {IERC721-setApprovalForAll}.
     * https://eips.ethereum.org/EIPS/eip-721 Read only NFT registry
     */
    function setApprovalForAll(address, bool) public virtual override {
        revert();
    }

    /**
     * @dev See {IERC721-setApprovalForAll}.
     * https://eips.ethereum.org/EIPS/eip-721 Read only NFT registry
     */
    function transferFrom(address, address, uint256) public virtual override {
        revert();
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     * https://eips.ethereum.org/EIPS/eip-721 Read only NFT registry
     */
    function safeTransferFrom(address, address, uint256) public virtual override {
        revert();
    }
    
    /**
     * @dev See {IERC721-safeTransferFrom}.
     * https://eips.ethereum.org/EIPS/eip-721 Read only NFT registry
     */
    function safeTransferFrom(address, address, uint256, bytes memory) public virtual override {
        revert();
    }
}
