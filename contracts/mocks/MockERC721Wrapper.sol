// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

/// @author jpegmint.xyz

import "../wrapper/ERC721Wrapper.sol";

contract MockERC721Wrapper is ERC721Wrapper {
    
    constructor() ERC721("MockERC721Wrapper", "wMOCK") {}

    function updateApprovedTokenRanges(address contract_, uint256 minTokenId, uint256 maxTokenId) public override {
        _updateApprovedTokenRanges(contract_, minTokenId, maxTokenId);
    }
}
