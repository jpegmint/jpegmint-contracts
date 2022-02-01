// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

/// @title GasLock
/// @author jpegmint.xyz

contract GasLock {

    uint256 public immutable LOW_GAS;

    error GasTooHigh();

    constructor(uint256 lowGas) {
        LOW_GAS = lowGas;
    }

    modifier whenGasLow() {
        if (block.basefee > LOW_GAS)
            revert GasTooHigh();

        _;
    }
}
