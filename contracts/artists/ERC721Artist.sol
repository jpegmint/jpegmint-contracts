// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/// @author jpegmint.xyz

import "../royalties/ERC721Royalties.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

contract ERC721Artist is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Burnable, ERC721Royalties, Ownable {
    
    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

    //=========================================================================
    // MINTING
    //=========================================================================

    function mint(address to, uint256 tokenId, string memory metadataUri) public onlyOwner {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataUri);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    //=========================================================================
    // METADATA
    //=========================================================================
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function setTokenURI(uint256 tokenId, string memory metadataUri) public onlyOwner {
        _setTokenURI(tokenId, metadataUri);
    }

    //=========================================================================
    // ROYALTIES
    //=========================================================================

    function setRoyalties(address recipient, uint256 basisPoints) public override onlyOwner {
        _setRoyalties(recipient, basisPoints);
    }

    //=========================================================================
    // OTHER
    //=========================================================================

    /**
     * @dev see {IERC165-supportsInterface}
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable, ERC721Royalties) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev see {ERC721Enumerable-_beforeTokenTransfer}
     */
    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }
}
