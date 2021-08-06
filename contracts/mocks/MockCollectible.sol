// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

/// @author jpegmint.xyz

import "@openzeppelin/contracts/access/Ownable.sol";
import "../collectibles/ERC721PresetCollectible.sol";

contract MockCollectible is ERC721PresetCollectible, Ownable {
    using Strings for uint256;

    /**
     * @dev Starts paused and initializes metadata.
     */
    constructor(
        uint256 tokenMaxSupply,
        uint256 tokenPrice,
        uint256 tokenMaxPerTxn,
        uint256 tokenMaxReserved
    ) ERC721PresetCollectible(
        "MockCollectible",
        "MockCollectible",
        tokenMaxSupply,
        tokenPrice,
        tokenMaxPerTxn,
        tokenMaxReserved
    ) {}

    function startSale() external override onlyOwner {
        _unpause();
    }

    function pauseSale() external override onlyOwner {
        _pause();
    }

    function reserveCollectibles() external onlyOwner {
        _reserveCollectibles();
    }

    function withdraw() external override onlyOwner {
        _withdraw();
    }
}
