// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

/// @author jpegmint.xyz

import "../royalties/ERC721Royalties.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MockERC721Royalties is ERC721, ERC721Royalties, Ownable {

    constructor() ERC721("MockERC721Royalties", "MockERC721Royalties") {}

    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }

    function setRoyalties(address recipient, uint256 basisPoints) public override onlyOwner {
        _setRoyalties(recipient, basisPoints);
    }

    /**
     * @dev see {IERC165-supportsInterface}
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721Royalties) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
