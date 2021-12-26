// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

/// @author jpegmint.xyz

import "../token/ERC721/MiNFTProxy.sol";

contract MockMiNFT is MiNFTProxy {
    constructor() MiNFTProxy("MockMiNFT", "MockMiNFT") {}
}
