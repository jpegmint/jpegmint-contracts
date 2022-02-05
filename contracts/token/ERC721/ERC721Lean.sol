// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "./ERC721LeanBase.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import '@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol';
import "@openzeppelin/contracts/utils/Address.sol";
import '@openzeppelin/contracts/utils/Strings.sol';
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

/**
 * @dev Implementation of https://eips.ethereum.org/EIPS/eip-721[ERC721] Non-Fungible Token Standard, including
 * the Metadata and Enumerable extension. Built to optimize for lower gas during batch mints.
 *
 * Assumes serials are sequentially minted starting at 0 (e.g. 0, 1, 2, 3..).
 *
 * Does not support burning tokens to address(0).
 *
 * Assumes that an owner cannot have more than the 2**128 (max value of uint128) of supply
 */
contract ERC721Lean is ERC721LeanBase, IERC721Enumerable, IERC721Metadata {
    using Address for address;
    using Strings for uint256;

    // Token name
    string public name;

    // Token symbol
    string public symbol;

    // Base URI
    string public baseURI;

    // Total supply minted
    uint256 public totalSupply;

    // Mapping from token ID to owner address
    mapping(uint256 => address) internal _owners;

    constructor(string memory name_, string memory symbol_) {
        name = name_;
        symbol = symbol_;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721LeanBase, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(IERC721Metadata).interfaceId ||
            interfaceId == type(IERC721Enumerable).interfaceId ||
            super.supportsInterface(interfaceId)
        ;
    }

    /**
     * @dev See {IERC721-ownerOf}.
     */
    function ownerOf(uint256 tokenId) public view override(ERC721LeanBase, IERC721) returns (address) {
        require(_exists(tokenId), 'ERC721A: owner query for nonexistent token');

        unchecked {
            for (uint256 curr = tokenId; curr > 0; curr--) {
                if (_owners[curr] != address(0)) {
                    return _owners[curr];
                }
            }
        }

        revert('ERC721A: unable to determine the owner of token');
    }

    /**
     * @dev Returns whether `tokenId` exists.
     *
     * Tokens can be managed by their owner or approved accounts via {approve} or {setApprovalForAll}.
     *
     * Tokens start existing when they are minted (`_mint`),
     */
    function _exists(uint256 tokenId) internal view override returns (bool) {
        return tokenId > 0 && tokenId <= totalSupply;
    }

    function _safeMint(
        address to,
        uint256 quantity
    ) internal {
        _mint(to, quantity);
    }

    /**
     * @dev Safely mints `quantity` tokens and transfers them to `to`.
     *
     * Requirements:
     *
     * - If `to` is a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called once for each batch.
     * - `quantity` must be greater than 0.
     *
     * Emits a {Transfer} event.
     */
    function _mint(
        address to,
        uint256 quantity
    ) internal {
        require(to != address(0), 'ERC721A: mint to the zero address');
        require(quantity != 0, 'ERC721A: quantity must be greater than 0');
        
        uint256 startTokenId = totalSupply + 1;
        _beforeTokenTransfers(address(0), to, startTokenId, quantity);

        // Overflows are incredibly unrealistic.
        // balance or numberMinted overflow if current value of either + quantity > 3.4e38 (2**128) - 1
        // updatedIndex overflows if currentIndex + quantity > 1.56e77 (2**256) - 1
        unchecked {
            _balances[to] += quantity;
            _owners[totalSupply] = to;

            for (uint256 i; i < quantity; i++) {
                totalSupply += 1;
                uint256 tokenId = totalSupply;
                emit Transfer(address(0), to, tokenId);
            }
        }
        
        require(
            _checkOnERC721Received(address(0), to, totalSupply, ''),
            'ERC721A: transfer to non ERC721Receiver implementer'
        );

        _afterTokenTransfers(address(0), to, startTokenId, quantity);
    }

    /**
     * @dev Transfers `tokenId` from `from` to `to`.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     *
     * Emits a {Transfer} event.
     */
    function _transfer(address from, address to, uint256 tokenId) internal override {
        address prevOwner = ownerOf(tokenId);

        require(prevOwner == from, 'ERC721A: transfer from incorrect owner');
        require(to != address(0), 'ERC721A: transfer to the zero address');
        
        _beforeTokenTransfers(from, to, tokenId, 1);

        // Clear approvals from the previous owner
        _approve(address(0), tokenId);

        // Underflow of the sender's balance is impossible because we check for
        // ownership above and the recipient's balance can't realistically overflow.
        // Counter overflow is incredibly unrealistic as tokenId would have to be 2**256.
        unchecked {

            _balances[from] -= 1;
            _balances[to] += 1;
            _owners[tokenId] = to;

            // If the ownership slot of tokenId+1 is not explicitly set, that means the transfer initiator owns it.
            // Set the slot of tokenId+1 explicitly in storage to maintain correctness for ownerOf(tokenId+1) calls.
            uint256 nextTokenId = tokenId + 1;
            if (_owners[nextTokenId] == address(0)) {
                if (_exists(nextTokenId)) {
                    _owners[nextTokenId] = prevOwner;
                }
            }
        }

        emit Transfer(from, to, tokenId);
        _afterTokenTransfers(from, to, tokenId, 1);
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), 'ERC721Metadata: URI query for nonexistent token');
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString())) : '';
    }

    /**
     * @dev See {IERC721Enumerable-tokenByIndex}.
     */
    function tokenByIndex(uint256 index) public view override returns (uint256) {
        require(index < totalSupply, 'ERC721A: global index out of bounds');
        return index + 1;
    }

    /**
     * @dev Not implemented, better to track off-chain.
     */
    function tokenOfOwnerByIndex(address, uint256) public pure override returns (uint256) {
        revert('ERC721A: tokenOfOwnerByIndex unsupported');
    }

    /**
     * @dev Hook that is called before a set of serially-ordered token ids are about to be transferred. This includes minting.
     *
     * startTokenId - the first token id to be transferred
     * quantity - the amount to be transferred
     *
     * Calling conditions:
     *
     * - When `from` and `to` are both non-zero, ``from``'s `tokenId` will be
     * transferred to `to`.
     * - When `from` is zero, `tokenId` will be minted for `to`.
     */
    function _beforeTokenTransfers(
        address from,
        address to,
        uint256 startTokenId,
        uint256 quantity
    ) internal virtual {}

    /**
     * @dev Hook that is called after a set of serially-ordered token ids have been transferred. This includes
     * minting.
     *
     * startTokenId - the first token id to be transferred
     * quantity - the amount to be transferred
     *
     * Calling conditions:
     *
     * - when `from` and `to` are both non-zero.
     * - `from` and `to` are never both zero.
     */
    function _afterTokenTransfers(
        address from,
        address to,
        uint256 startTokenId,
        uint256 quantity
    ) internal virtual {}
}
