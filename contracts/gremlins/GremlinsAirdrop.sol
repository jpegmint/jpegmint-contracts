// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/// @author jpegmint.xyz

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "../token/ERC721/ERC721Lean.sol";

contract GremlinsAirdrop is ERC721Lean, AccessControl, Ownable {

    /// Variables ///
    string internal _metadataURI;
    uint256 internal immutable _tokenMaxSupply;

    /// Roles ///
    bytes32 public constant AIRDROP_ROLE = keccak256("AIRDROP_ROLE");

    /// Constructor ///
    constructor(string memory name, string memory symbol, uint256 tokenMaxSupply)
    ERC721Lean(name, symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(AIRDROP_ROLE, msg.sender);
        _tokenMaxSupply = tokenMaxSupply;
    }

    /**
     * @dev Airdrops tokens to specified wallet addresses. Batching supported.
     */
    function airdrop(address[] memory wallets) external onlyRole(AIRDROP_ROLE) {
        require(availableSupply() >= wallets.length, "Airdrop: More wallets provided than available supply");
        for (uint256 i = 0; i < wallets.length; i++) {
            _mint(wallets[i], uint16(totalSupply() + 1));
        }
    }

    /**
     * @dev Helper function to pair with total supply.
     */
    function availableSupply() public view returns (uint256) {
        return _tokenMaxSupply - totalSupply();
    }

    /**
     * @dev Same TokenURI for all existing tokens.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return _metadataURI;
    }

    /**
     * @dev Store and update new base uri.
     */
    function setMetadataURI(string memory newURI) external onlyRole(AIRDROP_ROLE) {
        _metadataURI = newURI;
    }

    //================================================================================
    // Other Functions
    //================================================================================

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Lean, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
