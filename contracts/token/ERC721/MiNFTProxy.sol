// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

/**
 * @dev Minimal implementation https://eips.ethereum.org/EIPS/eip-721[ERC721]
 * Non-Fungible Token Standard.
 *
 * ███╗   ███╗██╗███╗   ██╗███████╗████████╗
 * ████╗ ████║██║████╗  ██║██╔════╝╚══██╔══╝
 * ██╔████╔██║██║██╔██╗ ██║█████╗     ██║   
 * ██║╚██╔╝██║██║██║╚██╗██║██╔══╝     ██║   
 * ██║ ╚═╝ ██║██║██║ ╚████║██║        ██║   
 * ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝        ╚═╝   
 *                                             
 */
contract MiNFTProxy {

    address public constant IMPLEMENTATION = 0x5FbDB2315678afecb367f032d93F642f64180aa3;

    // Constructor
    constructor(string memory name_, string memory symbol_) {

        // Initialize contract
        bytes memory data = abi.encodeWithSelector(0x4cd88b76, name_, symbol_);
        (bool success, bytes memory returndata) = IMPLEMENTATION.delegatecall(data);
        if (!success) {
            if (returndata.length > 0) {
                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                revert('X');
            }
        }
    }

    /**
     * @dev Fallback function that delegates calls to the address returned by `IMPLEMENTATION`. Will run if no other
     * function in the contract matches the call data.
     */
    fallback() external virtual {
        assembly {
            // Copy msg.data. We take full control of memory in this inline assembly
            // block because it will not return to Solidity code. We overwrite the
            // Solidity scratch pad at memory position 0.
            calldatacopy(0, 0, calldatasize())

            // Call the implementation.
            // out and outsize are 0 because we don't know the size yet.
            let result := delegatecall(gas(), IMPLEMENTATION, 0, calldatasize(), 0, 0)

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
