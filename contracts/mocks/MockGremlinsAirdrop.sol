// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/// @author jpegmint.xyz

import "@openzeppelin/contracts/access/Ownable.sol";
import "../gremlins/GremlinsAirdrop.sol";

contract MockGremlinsAirdrop is GremlinsAirdrop {
    
    /**
     * @dev Constructor allows dynamic edition sizing for mocking.
     */
    constructor(uint256 tokenMaxSupply) GremlinsAirdrop("MockGremlinsAirdrop", "MOCKAIRDROP", tokenMaxSupply) {}
}
