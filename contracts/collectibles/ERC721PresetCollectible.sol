// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

/// @author jpegmint.xyz

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./ERC721EnumerableCollectible.sol";

abstract contract ERC721PresetCollectible is ERC721, ERC721EnumerableCollectible {

    /// Variables ///
    bool internal _paused;
    bool internal _isReserved;
    uint256 internal _tokenMaxSupply;
    uint256 internal _tokenPrice;
    uint256 internal _tokenMaxPerTxn;
    uint256 internal _tokenMaxReserved;
    
    event SalePaused(address account);
    event SaleUnpaused(address account);

    /**
     * @dev Starts paused and initializes metadata.
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 tokenMaxSupply,
        uint256 tokenPrice,
        uint256 tokenMaxPerTxn,
        uint256 tokenMaxReserved
    ) ERC721(name, symbol) {
        _paused = true;
        _tokenMaxSupply = tokenMaxSupply;
        _tokenPrice = tokenPrice;
        _tokenMaxPerTxn = tokenMaxPerTxn;
        _tokenMaxReserved = tokenMaxReserved;
    }

    /// Pausable ///
    function isPaused() public view virtual returns (bool) {
        return _paused;
    }

    function startSale() external virtual;
    function pauseSale() external virtual;

    function _pause() internal virtual {
        require(!isPaused(), "Collectible: Sale is already paused");
        _paused = true;
        emit SalePaused(msg.sender);
    }

    function _unpause() internal virtual {
        require(isPaused(), "Collectible: Sale is already started");
        _paused = false;
        emit SaleUnpaused(msg.sender);
    }

    /// Minting Functions ///
    function mintCollectibles(uint256 howMany) public virtual payable {
        require(!_paused,  "Collectible: Sale is paused");
        require(availableSupply() > 0, "Collectible: Contract is sold out");
        require(howMany <= _tokenMaxPerTxn, "Collectible: Qty exceed max per txn");
        require(availableSupply() >= howMany, "Collectible: Qty exceeds max supply");
        require(msg.value >= howMany * _tokenPrice, "Collectible: Not enough ether sent");

        for (uint256 i = 0; i < howMany; i++) {
            _mintCollectible(msg.sender);
        }
    }

    function _reserveCollectibles() internal virtual {
        require(!_isReserved, "Collectible: Tokens already reserved");
        require(availableSupply() > 0, "Collectible: Contract is sold out");
        require(availableSupply() >= _tokenMaxReserved, "Collectible: Qty exceeds available supply");

        for (uint256 i = 0; i < _tokenMaxReserved; i++) {
            _mintCollectible(msg.sender);
        }

        _isReserved = true;
    }

    function _mintCollectible(address to) internal virtual {
        uint256 tokenId = _generateTokenId();
        _safeMint(to, tokenId);
        _afterTokenMint(to, tokenId);
    }

    function _afterTokenMint(address to, uint256 tokenId) internal virtual;

    /**
     * @dev Helper function to check sale status.
     */
    function availableSupply() public view returns (uint256) {
        return _tokenMaxSupply - totalSupply();
    }

    /// Boilerplate Overrides ///
    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual override(ERC721, ERC721EnumerableCollectible) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721EnumerableCollectible) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}