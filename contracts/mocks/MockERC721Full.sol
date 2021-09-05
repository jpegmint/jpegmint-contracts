// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/// @author jpegmint.xyz

import "../token/ERC721/ERC721Full.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockERC721Full is ERC721Full, Ownable {
    
    constructor() ERC721Full("MockERC721Full", "MockERC721Full") {}

    function mint(address to, uint256 tokenId) public onlyOwner {
        _mint(to, tokenId);
    }
}
 