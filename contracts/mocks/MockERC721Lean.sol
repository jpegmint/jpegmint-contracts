// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/// @author jpegmint.xyz

import "../token/ERC721/ERC721Lean.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockERC721Lean is ERC721Lean, Ownable {
    
    constructor() ERC721Lean("MockERC721Lean", "MockERC721Lean") {}

    function mint(address to, uint16 tokenId) public onlyOwner {
        _mint(to, tokenId);
    }
}
 