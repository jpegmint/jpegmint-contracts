// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

/// @author jpegmint.xyz

import "@openzeppelin/contracts/access/Ownable.sol";
import "../collectibles/ERC721Collectible.sol";

contract MockCollectible is Ownable, ERC721Collectible {
    using Strings for uint256;

    /**
     * @dev Constructor allows dynamic edition sizing for mocking.
     */
    constructor(
        uint256 tokenMaxSupply,
        uint256 tokenPrice,
        uint256 tokenMaxPerTxn
    ) ERC721Collectible(
        "MockCollectible",
        "MOCKCOLLECTIBLE",
        tokenMaxSupply,
        tokenPrice,
        tokenMaxPerTxn
    ) {}

    function mintCollectibles(uint256 howMany) external {
        _purchase(howMany);
    }
}
