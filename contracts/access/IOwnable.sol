// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

/// @author jpegmint.xyz

/**
 * @dev External interface of AccessControl declared to support ERC165 detection.
 */
interface IOwnable {

    /// EVENTS ///
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() external view returns (address);
}
