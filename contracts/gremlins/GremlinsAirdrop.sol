// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

/// @author jpegmint.xyz

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../token/ERC721/ERC721EnumerableOrdered.sol";

contract GremlinsAirdrop is ERC721, ERC721EnumerableOrdered, AccessControl  {

    /// Variables ///
    string internal _metadataBaseURI;
    uint256 internal _tokenMaxSupply;
	uint256[] private _tokenIdTracker;

    /// Mappings ///
    mapping(uint256 => string) private _tokenURIs;

    /// Roles ///
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    /**
     * @dev Constructor.
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 tokenMaxSupply
    )
    ERC721(name, symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _tokenMaxSupply = tokenMaxSupply;
        _tokenIdTracker = new uint256[](tokenMaxSupply);
    }

    //================================================================================
    // Minting Functions
    //================================================================================

    /**
     * @dev Core redeeming and minting function.
     * todo Add wallet access control and redemption max.
     */
    function airdrop(address[] memory airdropWallets) external onlyRole(ADMIN_ROLE) {
        require(airdropWallets.length + totalSupply() <= _tokenMaxSupply, "Airdrop: Too many mints");
        for (uint256 i = 0; i < airdropWallets.length; i++) {
            uint256 tokenId = _generateTokenId();
            _safeMint(airdropWallets[i], tokenId);
        }
    }

    /**
     * @dev Generate random tokenIds using Meebits random ID strategy.
     */
    function _generateTokenId() private returns (uint256) {
        uint256 remainingQty = _tokenMaxSupply - totalSupply();
        uint256 randomNum = uint256(keccak256(abi.encodePacked(msg.sender, tx.gasprice, block.timestamp, remainingQty)));
        uint256 randomIndex = randomNum % remainingQty;

        // If array value exists, use, otherwise use generated random value.
        uint256 existingValue = _tokenIdTracker[randomIndex];
        uint256 tokenId = existingValue != 0 ? existingValue : randomIndex;

        // Keep track of seen indexes for black magic.
        uint256 endIndex = remainingQty - 1;
        uint256 endValue = _tokenIdTracker[endIndex];
        _tokenIdTracker[randomIndex] = endValue != 0 ? endValue : endIndex;

        return tokenId + 1; // Start tokens at #1
    }

    function availableSupply() public view returns (uint256) {
        return _tokenMaxSupply - totalSupply();
    }

    //================================================================================
    // Metadata Functions
    //================================================================================

    function setBaseURI(string memory newURI) external onlyRole(ADMIN_ROLE) {
        _metadataBaseURI = newURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return _metadataBaseURI;
    }

    /**
     * @dev Generates tokenURI using baseURI and tokenURI combinations.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Airdrop: URI query for nonexistent token");

        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();

        // If there is no base URI, return the token URI.
        if (bytes(base).length == 0) {
            return _tokenURI;
        }
        // If both are set, concatenate the baseURI and tokenURI (via abi.encodePacked).
        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(base, _tokenURI));
        }

        return super.tokenURI(tokenId);
    }

    /**
     * @dev Sets tokenURIs for future metadata updates.
     */
    function setTokenURIs(string[] memory tokenURIs) external onlyRole(ADMIN_ROLE) {
        require(tokenURIs.length == _tokenMaxSupply, "Airdrop: Too many URIs provided");
        for (uint256 i = 0; i < tokenURIs.length; i++) {
            _tokenURIs[i] = tokenURIs[i];
        }
    }

    //================================================================================
    // Other Functions
    //================================================================================

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721EnumerableOrdered)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721EnumerableOrdered, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
