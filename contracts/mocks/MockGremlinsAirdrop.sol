// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

/// @author jpegmint.xyz

import "../gremlins/GremlinsAirdrop.sol";

contract MockGremlinsAirdrop is GremlinsAirdrop {

    uint256 public seedOverride;

    /**
     * @dev Constructor allows dynamic edition sizing for mocking.
     */
    constructor(uint256 tokenMaxSupply)
    GremlinsAirdrop("MockGremlinsAirdrop", "MOCKAIRDROP", tokenMaxSupply) {}

    /**
     * @dev Override random num generator to provide predictable chaos.
     */
    function _generateRandomNum(uint256 seed) internal view override returns (uint256) {
        return uint256(keccak256(abi.encodePacked(seedOverride != 0 ? seedOverride : seed)));
    }

    function setSeedOverride(uint256 newSeed) public {
        seedOverride = newSeed;
    }
}
