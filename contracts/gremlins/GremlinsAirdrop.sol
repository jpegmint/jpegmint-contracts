// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

/// @author jpegmint.xyz

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "../token/ERC721/ERC721Lean.sol";

contract GremlinsAirdrop is ERC721Lean, AccessControl, Ownable {

    /// Variables ///
    string internal _metadataURI;
	uint256[] private _tokenIdTracker;
    uint256 internal immutable _tokenMaxSupply;

    /// Roles ///
    bytes32 public constant AIRDROP_ROLE = keccak256("AIRDROP_ROLE");

    /// Constructor ///
    constructor(string memory name, string memory symbol, uint256 tokenMaxSupply)
    ERC721Lean(name, symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(AIRDROP_ROLE, msg.sender);
        _tokenMaxSupply = tokenMaxSupply;
        _tokenIdTracker = new uint256[](tokenMaxSupply);
    }

    //================================================================================
    // MINTING
    //================================================================================

    /**
     * @dev Airdrops tokens to specified wallet addresses. Batching supported.
     */
    function airdrop(address[] memory wallets) external onlyRole(AIRDROP_ROLE) {
        require(availableSupply() >= wallets.length, "Airdrop: More wallets provided than available supply");
        for (uint256 i = 0; i < wallets.length; i++) {
            uint16 tokenId = uint16(_generateTokenId());
            _mint(wallets[i], tokenId);
        }
    }

    /**
     * @dev Generate random tokenIds using Meebits random ID strategy.
     */
    function _generateTokenId() private returns (uint256) {
        uint256 remainingQty = availableSupply();
        uint256 randomIndex = _generateRandomNum(remainingQty) % remainingQty;

        // If array value exists, use, otherwise use generated random value.
        uint256 existingValue = _tokenIdTracker[randomIndex];
        uint256 tokenId = existingValue != 0 ? existingValue : randomIndex;

        // Keep track of seen indexes for black magic.
        uint256 endIndex = remainingQty - 1;
        uint256 endValue = _tokenIdTracker[endIndex];
        _tokenIdTracker[randomIndex] = endValue != 0 ? endValue : endIndex;

        return tokenId + 1; // Start tokens at #1
    }

    /**
     * @dev Generate pseudorandom number via various transaction properties.
     */
    function _generateRandomNum(uint256 seed) internal view virtual returns (uint256) {
        return uint256(keccak256(abi.encodePacked(msg.sender, tx.gasprice, block.timestamp, seed)));
    }

    /**
     * @dev Helper function to pair with total supply.
     */
    function availableSupply() public view returns (uint256) {
        return _tokenMaxSupply - totalSupply;
    }

    //================================================================================
    // METADATA
    //================================================================================

    /**
     * @dev Same TokenURI for all existing tokens.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(uint16(tokenId)), "ERC721Metadata: URI query for nonexistent token");
        return _metadataURI;
    }

    /**
     * @dev Store and update new base uri.
     */
    function setMetadataURI(string memory newURI) external onlyRole(AIRDROP_ROLE) {
        _metadataURI = newURI;
    }

    //================================================================================
    // OTHER FUNCTIONS
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
