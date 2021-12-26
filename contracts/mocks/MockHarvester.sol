// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "../harvest/TokenSeller.sol";
import "../harvest/TokenHarvester.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockHarvester is Ownable, TokenSeller, TokenHarvester {

// Initialization

    constructor() {}
    
// Pausable

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

// Balance

    receive() external payable {}

    function withdraw() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }
}
