// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

/// @author jpegmint.xyz

import "../token/ERC721/ERC721Virtual.sol";

contract MockERC721Virtual is ERC721Virtual {
    
    constructor() ERC721Virtual("MockERC721Virtual", "MockERC721Virtual") {}

    function mint() public {
        address to = msg.sender;
        uint256 tokenId = uint256(uint160(to));
        _mint(to, tokenId);
    }
}
