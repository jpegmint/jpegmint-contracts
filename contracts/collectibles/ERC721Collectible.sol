// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

/// @author jpegmint.xyz

import "../token/ERC721/ERC721EnumerableOrdered.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

abstract contract ERC721Collectible is ERC721, ERC721EnumerableOrdered, Ownable {

    /// Variables ///
    bool internal _paused;
    uint256 internal _tokenMaxSupply;
    uint256 internal _tokenPrice;
    uint256 internal _tokenMaxPerTxn;
	uint256[] internal _tokenIdTracker;
    
    /// Events ///
    event SalePaused(address account);
    event SaleUnpaused(address account);

    //================================================================================
    // Constructor
    //================================================================================  

    /**
     * @dev Starts paused and initializes metadata.
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 tokenMaxSupply,
        uint256 tokenPrice,
        uint256 tokenMaxPerTxn
    ) ERC721(name, symbol) {
        _paused = true;
        _tokenMaxSupply = tokenMaxSupply;
        _tokenPrice = tokenPrice;
        _tokenMaxPerTxn = tokenMaxPerTxn;
        _tokenIdTracker = new uint256[](_tokenMaxSupply);
    }

    //================================================================================
    // Hooks
    //================================================================================    

    /**
     * @dev Various lifecycle hooks to add checks or functionality.
     */
    function _beforeStartingSale() internal virtual {}
    function _beforeBatchMint(address to, uint256 howMany) internal virtual {}
    function _beforeTokenMint(address to, uint256 tokenId, uint256 currentIndex) internal virtual {}
    function _afterTokenMint(address to, uint256 tokenId, uint256 currentIndex) internal virtual {}
    function _afterBatchMint(address to, uint256 howMany, uint256[] memory mintedTokenIds) internal virtual {}

    //================================================================================
    // Sale Functions
    //================================================================================

    function startSale() public virtual onlyOwner {
        require(_paused, "Collectible: Sale is already started");
        _beforeStartingSale();
        _paused = false;
        emit SaleUnpaused(msg.sender);
    }

    function pauseSale() public virtual onlyOwner {
        require(!_paused, "Collectible: Sale is already paused");
        _paused = true;
        emit SalePaused(msg.sender);
    }

    function isPaused() public view returns (bool) {
        return _paused;
    }

    function isSoldOut() public view returns (bool) {
        return totalSupply() == _tokenMaxSupply;
    }

    function availableSupply() public view returns (uint256) {
        return _tokenMaxSupply - totalSupply();
    }

    //================================================================================
    // Minting Functions
    //================================================================================

    /**
     * @dev Standard public sale minting function. Override to activate.
     */
    function _purchase(uint256 howMany) internal virtual {
        require(!isPaused(),  "Collectible: Sale is paused");
        require(howMany <= _tokenMaxPerTxn, "Collectible: Qty exceed max per txn");
        require(msg.value >= howMany * _tokenPrice, "Collectible: Not enough ether sent");

        _mintCollectibles(msg.sender, howMany);
    }

    /**
     * @dev Core batch minting function. Checks key requirements and fires hooks.
     */
    function _mintCollectibles(address to, uint256 howMany) internal virtual {
        require(!isSoldOut(), "Collectible: Contract is sold out");
        require(availableSupply() >= howMany, "Collectible: Qty exceeds max supply");

        _beforeBatchMint(to, howMany);

        uint256[] memory mintedTokenIds = new uint256[](howMany);
        for (uint256 i = 0; i < howMany; i++) {
            uint256 tokenId = _generateTokenId(to, howMany, i);
            _beforeTokenMint(to, tokenId, i);
            _safeMint(to, tokenId);
            _afterTokenMint(to, tokenId, i);
            mintedTokenIds[i] = tokenId;
        }

        _afterBatchMint(to, howMany, mintedTokenIds);
    }

    /**
     * @dev Generate random tokenIds using meebits random ID strategy.
     */
    function _generateTokenId(address, uint256, uint256) internal virtual returns (uint256) {
        uint256 remainingQty = availableSupply();
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

    //================================================================================
    // Withdrawal Functions
    //================================================================================

    /**
     * @dev Simple withdrawal implementation. Sends balance to msg.sender.
     */
    function withdraw() external virtual onlyOwner {
		payable(msg.sender).transfer(address(this).balance);
    }

    //================================================================================
    // Other Functions
    //================================================================================

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual override(ERC721, ERC721EnumerableOrdered) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721EnumerableOrdered) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
