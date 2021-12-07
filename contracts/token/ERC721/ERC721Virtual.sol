// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

/// @author jpegmint.xyz

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";

/**
 */
contract ERC721Virtual is ERC721, IERC721Enumerable {

    mapping(uint256 => bool) private _mintedTokens;

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {}

    /**
     * @dev Owners can have max 1 of virutal tokens.
     */
    function balanceOf(address owner) public view virtual override(ERC721, IERC721) returns (uint256) {
        require(owner != address(0), "ERC721Virtual: balance query for the zero address");
        return 1;
    }

    /**
     * @dev Owner is always tokenId -> address
     */
    function ownerOf(uint256 tokenId) public view virtual override(ERC721, IERC721) returns (address) {
        address owner = address(uint160(tokenId));
        require(owner != address(0), "ERC721Virtual: owner query for nonexistent token");
        return owner;
    }

    /**
     * @dev Force use of this ownerOf function
     */
    function approve(address to, uint256 tokenId) public virtual override(ERC721, IERC721) {
        address owner = ownerOf(tokenId);
        require(to != owner, "ERC721Virtual: approval to current owner");

        require(
            _msgSender() == owner || isApprovedForAll(owner, _msgSender()),
            "ERC721Virtual: approve caller is not owner nor approved for all"
        );

        _approve(to, tokenId);
    }

    /**
     * @dev Virtual tokens always exist either as virtual or minted
     */
    function _exists(uint256 tokenId) internal view virtual override returns (bool) {
        return ownerOf(tokenId) != address(0);
    }

    /**
     * @dev Force use of this ownerOf function
     */
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view virtual override returns (bool) {
        require(_exists(tokenId), "ERC721Virtual: operator query for nonexistent token");
        address owner = ownerOf(tokenId);
        return (spender == owner || getApproved(tokenId) == spender || isApprovedForAll(owner, spender));
    }

    /**
     */
    function _mint(address to, uint256 tokenId) internal virtual override {
        require(to != address(0), "ERC721Virtual: mint to the zero address");
        require(to == ownerOf(tokenId), "ERC721Virtual: only owner can mint virtual token");
        require(!_mintedTokens[tokenId], "ERC721Virtual: token already minted");

        _beforeTokenTransfer(address(0), to, tokenId);

        _mintedTokens[tokenId] = true;

        emit Transfer(address(0), to, tokenId);
    }

    /**
     */
    function _burn(uint256 tokenId) internal virtual override {
        address owner = ownerOf(tokenId);

        _beforeTokenTransfer(owner, address(0), tokenId);

        _approve(address(0), tokenId);
        _mintedTokens[tokenId] = false;

        emit Transfer(owner, address(0), tokenId);
    }

    function transferFrom(address, address, uint256) public virtual override(ERC721, IERC721) {
        revert("ERC721Virtual: Virtual tokens can not be transferred");
    }

    function safeTransferFrom(address, address, uint256) public virtual override(ERC721, IERC721) {
        revert("ERC721Virtual: Virtual tokens can not be transferred");
    }
    
    function safeTransferFrom(address, address, uint256, bytes memory) public virtual override(ERC721, IERC721) {
        revert("ERC721Virtual: Virtual tokens can not be transferred");
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(IERC165, ERC721) returns (bool) {
        return interfaceId == type(IERC721Enumerable).interfaceId || super.supportsInterface(interfaceId);
    }
    
    /**
     * @dev See {IERC721Enumerable-tokenOfOwnerByIndex}.
     */
    function tokenOfOwnerByIndex(address owner, uint256 index) public view virtual override returns (uint256) {
        require(index == 0, "ERC721Virtual: owner index out of bounds");
        return uint256(uint160(owner));
    }

    /**
     * @dev See {IERC721Enumerable-totalSupply}.
     */
    function totalSupply() public view virtual override returns (uint256) {
        return type(uint160).max;
    }

    /**
     * @dev See {IERC721Enumerable-tokenByIndex}.
     */
    function tokenByIndex(uint256 index) public view virtual override returns (uint256) {
        require(index < totalSupply(), "ERC721Virtual: global index out of bounds");
        return index + 1;
    }
}
