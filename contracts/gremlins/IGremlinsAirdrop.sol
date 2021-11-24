// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

/// @author jpegmint.xyz

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IGremlinsAirdrop is IERC165 {

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    function beforeMintStorage(address) external returns(uint256);

    function afterMintStorage(address to, uint256 tokenId) external;
}
