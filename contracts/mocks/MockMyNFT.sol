// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

/// @author jpegmint.xyz

import "../token/ERC721/MyNFT.sol";

contract MockMyNFT is MyNFT {
    constructor() MyNFT("MockMyNFT", "MockMyNFT") {}
}
