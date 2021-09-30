// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/// @author jpegmint.xyz

import "../artists/ERC721Artist.sol";

contract MockERC721Artist is ERC721Artist {
    constructor() ERC721Artist("MockERC721Artist", "MockERC721Artist") {}
}
