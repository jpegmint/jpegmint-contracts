// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/interfaces/IERC165.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC721Metadata.sol";
import "../../access/IOwnable.sol";

/**
 * @dev Minimal implementation https://eips.ethereum.org/EIPS/eip-721[ERC721]
 * Non-Fungible Token Standard.
 *
 *  ███╗   ███╗██╗   ██╗███╗   ██╗███████╗████████╗
 *  ████╗ ████║╚██╗ ██╔╝████╗  ██║██╔════╝╚══██╔══╝
 *  ██╔████╔██║ ╚████╔╝ ██╔██╗ ██║█████╗     ██║   
 *  ██║╚██╔╝██║  ╚██╔╝  ██║╚██╗██║██╔══╝     ██║   
 *  ██║ ╚═╝ ██║   ██║   ██║ ╚████║██║        ██║   
 *  ╚═╝     ╚═╝   ╚═╝   ╚═╝  ╚═══╝╚═╝        ╚═╝   
 *                                             
 */
contract MyNFTLazy is IERC165, IERC721, IERC721Metadata, IOwnable {
    
    // Contract & token owner
    address public override owner;
    
    // Token name
    string public override name;
    
    // Token name
    string public override symbol;

    // Total supply of tokens
    uint16 public totalSupply;
    
    // Mapping of tokenIds to token metadata
    mapping(uint16 => string) private _mintedTokens;

    //    _____ ____  _   _  _____ _______ _____  _    _  _____ _______ ____  _____  
    //   / ____/ __ \| \ | |/ ____|__   __|  __ \| |  | |/ ____|__   __/ __ \|  __ \ 
    //  | |   | |  | |  \| | (___    | |  | |__) | |  | | |       | | | |  | | |__) |
    //  | |   | |  | | . ` |\___ \   | |  |  _  /| |  | | |       | | | |  | |  _  / 
    //  | |___| |__| | |\  |____) |  | |  | | \ \| |__| | |____   | | | |__| | | \ \ 
    //   \_____\____/|_| \_|_____/   |_|  |_|  \_\\____/ \_____|  |_|  \____/|_|  \_\
    //

    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` to the token collection.
     */
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
            interfaceId == type(IOwnable).interfaceId
        ;
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
    function mint(uint16 tokenId, string memory metadataURI) public virtual {
        require(msg.sender == owner && !_exists(tokenId));

        _mintedTokens[tokenId] = metadataURI;
        totalSupply++;

        emit Transfer(address(0), owner, tokenId);
    }

    function lazyMint(uint16 tokenId) public virtual {
        require(msg.sender == owner && !_exists(tokenId));
        emit Transfer(address(0), owner, tokenId);
    }

    /**
     * @dev Destroys `tokenId`.
     *
     * Emits a {Transfer} event.
     */
    function burn(uint16 tokenId) public virtual {
        require(msg.sender == owner && _exists(tokenId));

        delete _mintedTokens[tokenId];
        totalSupply--;

        emit Transfer(owner, address(0), tokenId);
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
        return _mintedTokens[uint16(tokenId)];
    }

    /**
     * @dev Updates a token's metadata URI.
     */
    function setTokenURI(uint16 tokenId, string memory metadataURI) public virtual {
        require(msg.sender == owner && _exists(tokenId));
        _mintedTokens[tokenId] = metadataURI;
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

    //   _____  ______          _____          ____  _   _ _  __     __
    //  |  __ \|  ____|   /\   |  __ \        / __ \| \ | | | \ \   / /
    //  | |__) | |__     /  \  | |  | |______| |  | |  \| | |  \ \_/ / 
    //  |  _  /|  __|   / /\ \ | |  | |______| |  | | . ` | |   \   /  
    //  | | \ \| |____ / ____ \| |__| |      | |__| | |\  | |____| |   
    //  |_|  \_\______/_/    \_\_____/        \____/|_| \_|______|_|   
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
        revert();
    }

    /**
     * @dev See {IERC721-setApprovalForAll}.
     */
    function setApprovalForAll(address, bool) public virtual override {
        revert();
    }

    /**
     * @dev See {IERC721-setApprovalForAll}.
     */
    function transferFrom(address, address, uint256) public virtual override {
        revert();
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(address, address, uint256) public virtual override {
        revert();
    }
    
    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(address, address, uint256, bytes memory) public virtual override {
        revert();
    }
}
