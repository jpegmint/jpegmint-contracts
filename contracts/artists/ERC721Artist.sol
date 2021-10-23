// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

/// @author jpegmint.xyz

import "../access/MultiOwnable.sol";
import "../royalties/ERC721Royalties.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ERC721Artist is ERC721, ERC721Royalties, MultiOwnable {

    /// VARIABLES ///
    uint256 public totalSupply;
    
    /// MAPPINGS ///
    mapping(uint256 => TokenMetadata) private _tokenMetadata;

    struct TokenMetadata {
        string name;
        string description;
        string image;
        string animation;
    }
    
    /// CONSTRUCTOR ///
    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

    /// ERC165 INTERFACES ///
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Royalties, MultiOwnable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    //   __  __ _____ _   _ _______ _____ _   _  _____ 
    //  |  \/  |_   _| \ | |__   __|_   _| \ | |/ ____|
    //  | \  / | | | |  \| |  | |    | | |  \| | |  __ 
    //  | |\/| | | | | . ` |  | |    | | | . ` | | |_ |
    //  | |  | |_| |_| |\  |  | |   _| |_| |\  | |__| |
    //  |_|  |_|_____|_| \_|  |_|  |_____|_| \_|\_____|
    //                                                
                                         
    /**
     * @dev Mint a token.
     *
     * @param to      Address to mint to.
     * @param tokenId Desired tokenId.
     */
    function mint(address to, uint256 tokenId) public onlyOwner {

        _safeMint(to, tokenId);

        totalSupply++;
    }

    /**
     * @dev Burn a token. Allows re-minting same tokenId after burn.
     *
     * @param tokenId The tokenId to burn.
     */
    function burn(uint256 tokenId) public virtual {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721Burnable: caller is not owner nor approved");
        
        _burn(tokenId);
        delete _tokenMetadata[tokenId];

        totalSupply--;
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
        _requireExistingToken(tokenId);
        return getTokenMetadata(tokenId);
    }

    function setTokenMetadata(
        uint256 tokenId,
        string memory tokenName,
        string memory tokenDescription,
        string memory tokenImage,
        string memory tokenAnimation
    ) external onlyOwner {
        _requireExistingToken(tokenId);
        _tokenMetadata[tokenId] = TokenMetadata(
            tokenName,
            tokenDescription,
            tokenImage,
            tokenAnimation
        );
    }
    
    function setTokenName(uint256 tokenId, string memory tokenName) external onlyOwner {
        _requireExistingToken(tokenId);
        _tokenMetadata[tokenId].name = tokenName;
    }
    
    function setTokenDescription(uint256 tokenId, string memory tokenDescription) external onlyOwner {
        _requireExistingToken(tokenId);
        _tokenMetadata[tokenId].description = tokenDescription;
    }
    
    function setTokenImage(uint256 tokenId, string memory tokenImage) external onlyOwner {
        _requireExistingToken(tokenId);
        _tokenMetadata[tokenId].image = tokenImage;
    }
    
    function setTokenAnimation(uint256 tokenId, string memory tokenAnimation) external onlyOwner {
        _requireExistingToken(tokenId);
        _tokenMetadata[tokenId].animation = tokenAnimation;
    }

    function getTokenMetadata(uint256 tokenId) public view returns (string memory) {
        _requireExistingToken(tokenId);
        TokenMetadata memory metadata = _tokenMetadata[tokenId];

        bytes memory byteString = 'data:application/json;utf8,{';
        
        byteString = abi.encodePacked(byteString, '"name": "', metadata.name, '",');
        byteString = abi.encodePacked(byteString, '"image": "', metadata.image, '",');
        byteString = abi.encodePacked(byteString, '"image_uri": "', metadata.image, '",');

        if (keccak256(bytes(metadata.animation)) != keccak256(bytes(''))) {
            byteString = abi.encodePacked(byteString, '"animation": "', metadata.animation, '",');
            byteString = abi.encodePacked(byteString, '"animation_url": "', metadata.animation, '",');
        }

        byteString = abi.encodePacked(byteString, '"description": "', metadata.description, '"');
        byteString = abi.encodePacked(byteString, '}');

        return string(byteString);
    }

    function _requireExistingToken(uint256 tokenId) internal view {
        require(_exists(tokenId), "ERC721URIStorage: Metadata set of nonexistent token");
    }

    //   _____   ______     __      _   _______ _____ ______  _____ 
    //  |  __ \ / __ \ \   / //\   | | |__   __|_   _|  ____|/ ____|
    //  | |__) | |  | \ \_/ //  \  | |    | |    | | | |__  | (___  
    //  |  _  /| |  | |\   // /\ \ | |    | |    | | |  __|  \___ \ 
    //  | | \ \| |__| | | |/ ____ \| |____| |   _| |_| |____ ____) |
    //  |_|  \_\\____/  |_/_/    \_\______|_|  |_____|______|_____/ 
    //                                                             

    /**
     * @dev Sets the contract roylaties for all tokens.
     *
     * @param recipient The royalty recipient's address.
     * @param basisPoints The royalty bps. 100% is 10,000, 10% is 1,000, 0% is 0.
     */
    function setRoyalties(address recipient, uint256 basisPoints) public override onlyOwner {
        _setRoyalties(recipient, basisPoints);
    }
}
