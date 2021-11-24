// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

/// @author jpegmint.xyz

import "./IGremlinsAirdrop.sol";

abstract contract GremlinsAirdrop is IGremlinsAirdrop {

    /// Interface IDs
    bytes4 private constant _INTERFACE_ID_ERC165 = 0x01ffc9a7;
    bytes4 private constant _INTERFACE_ID_ERC721 = 0x80ac58cd;
    bytes4 private constant _INTERFACE_ID_ERC721_METADATA = 0x5b5e139f;

    /// Function IDs
    bytes4 private constant _FUNCTION_ID_INITIALIZE = 0x4cd88b76;              // bytes4(keccak256("initialize(string,string)"))
    bytes4 private constant _FUNCTION_ID_NAME = 0x06fdde03;                    // bytes4(keccak256("name()"))
    bytes4 private constant _FUNCTION_ID_SYMBOL = 0x95d89b41;                  // bytes4(keccak256("symbol()"))
    bytes4 private constant _FUNCTION_ID_BALANCE_OF = 0x70a08231;              // bytes4(keccak256("balanceOf(address)"))
    bytes4 private constant _FUNCTION_ID_OWNER_OF = 0x6352211e;                // bytes4(keccak256("ownerOf(uint256)"))
    bytes4 private constant _FUNCTION_ID_TRANSFER_FROM = 0x23b872dd;           // bytes4(keccak256("transferFrom(address,address,uint256)"))
    bytes4 private constant _FUNCTION_ID_SAFE_TRANSFER_FROM = 0x42842e0e;      // bytes4(keccak256("safeTransferFrom(address,address,uint256)"))
    bytes4 private constant _FUNCTION_ID_SAFE_TRANSFER_FROM_DATA = 0xb88d4fde; // bytes4(keccak256("safeTransferFrom(address,address,uint256,bytes)"))
    bytes4 private constant _FUNCTION_ID_APPROVE = 0x095ea7b3;                 // bytes4(keccak256("approve(address,uint256)"))
    bytes4 private constant _FUNCTION_ID_GET_APPROVED = 0x081812fc;            // bytes4(keccak256("getApproved(uint256)"))
    bytes4 private constant _FUNCTION_ID_SET_APPROVAL_FOR_ALL = 0xa22cb465;    // bytes4(keccak256("setApprovalForAll(address,bool)"))
    bytes4 private constant _FUNCTION_ID_IS_APPROVED_FOR_ALL = 0xe985e9c5;     // bytes4(keccak256("isApprovedForAll(address,address)"))
    bytes4 private constant _FUNCTION_ID_OWNER = 0x8da5cb5b;                   // bytes4(keccak256("owner()"))
    bytes4 private constant _FUNCTION_ID_TRANSFER_OWNERSHIP = 0xf2fde38b;      // bytes4(keccak256("transferOwnership(address)"))

    // Gremlins Contract
    address private constant _GREMLINS_CONTRACT = 0x59b9076BBb9Ea20D50C65419F46a4b8fc1f41033;

    constructor(string memory name_, string memory symbol_) {
        bytes memory data = abi.encodeWithSelector(_FUNCTION_ID_INITIALIZE, name_, symbol_);
    }
    
    /// ERC165 Interfaces
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return
            interfaceId == _INTERFACE_ID_ERC721 ||
            interfaceId == _INTERFACE_ID_ERC165 ||
            interfaceId == _INTERFACE_ID_ERC721_METADATA
        ;
    }

    modifier onlyGremlins {
        require(msg.sender == _GREMLINS_CONTRACT, "X");
        _;
    }

    /**
     * @dev Fallback function that delegates calls to the address returned by `_implementation()`. Will run if no other
     * function in the contract matches the call data.
     */
    fallback() external {

        bool isKnownFunction =
            msg.sig == _FUNCTION_ID_INITIALIZE ||
            msg.sig == _FUNCTION_ID_NAME ||
            msg.sig == _FUNCTION_ID_SYMBOL ||
            msg.sig == _FUNCTION_ID_BALANCE_OF ||
            msg.sig == _FUNCTION_ID_OWNER_OF ||
            msg.sig == _FUNCTION_ID_TRANSFER_FROM ||
            msg.sig == _FUNCTION_ID_SAFE_TRANSFER_FROM ||
            msg.sig == _FUNCTION_ID_SAFE_TRANSFER_FROM_DATA ||
            msg.sig == _FUNCTION_ID_APPROVE ||
            msg.sig == _FUNCTION_ID_GET_APPROVED ||
            msg.sig == _FUNCTION_ID_SET_APPROVAL_FOR_ALL ||
            msg.sig == _FUNCTION_ID_IS_APPROVED_FOR_ALL ||
            msg.sig == _FUNCTION_ID_OWNER ||
            msg.sig == _FUNCTION_ID_TRANSFER_OWNERSHIP
        ;

        require(isKnownFunction, 'X');
        _delegate(_GREMLINS_CONTRACT);
    }
    
    /**
     * @dev Delegates the current call to `implementation`.
     *
     * This function does not return to its internall call site, it will return directly to the external caller.
     */
    function _delegate(address baseContract) internal {
        assembly {
            // Copy msg.data. We take full control of memory in this inline assembly
            // block because it will not return to Solidity code. We overwrite the
            // Solidity scratch pad at memory position 0.
            calldatacopy(0, 0, calldatasize())

            // Call the implementation.
            // out and outsize are 0 because we don't know the size yet.
            let result := delegatecall(gas(), baseContract, 0, calldatasize(), 0, 0)

            // Copy the returned data.
            returndatacopy(0, 0, returndatasize())

            switch result
            // delegatecall returns 0 on error.
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }
}
