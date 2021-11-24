// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

/// @author jpegmint.xyz


import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./IGremlinsAirdrop.sol";

contract GremlinsBase is Ownable, AccessControl, Initializable {
    using Address for address;
    using Strings for uint256;

    // Token name
    string private _name;

    // Token symbol
    string private _symbol;
    
    // Mapping from token ID to owner address
    mapping(uint256 => address) private _owners;

    // Mapping owner address to token count
    mapping(address => uint256) private _balances;

    // Mapping from token ID to approved address
    mapping(uint256 => address) private _tokenApprovals;

    // Mapping from owner to operator approvals
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    // Mapping from tokenId to airdrop contract source
    mapping(uint256 => address) private _tokenAirdrop;
    mapping(address => string) private _airdropBaseURI;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    /// Constructor ///
    constructor() {}

    function initialize(string memory name_, string memory symbol_) public initializer() {
        transferOwnership(msg.sender);
        _name = name_;
        _symbol = symbol_;
    }

    ///
    /// MINTING
    ///
    
    function airdrop(address airdropAddress, address to) external {
        require(true, "Only Whitelisted");
        require(to != address(0), "ERC721: mint to the zero address");

        IGremlinsAirdrop airdropContract = IGremlinsAirdrop(airdropAddress);
        uint256 tokenId = airdropContract.beforeMintStorage(to);

        _balances[to] += 1;
        _owners[tokenId] = to;
        _tokenAirdrop[tokenId] = airdropAddress;

        airdropContract.afterMintStorage(to, tokenId);
    }

    /**
     * @dev See {IERC721-balanceOf}.
     */
    function balanceOf(address wallet) public view virtual returns (uint256) {
        require(wallet != address(0), "ERC721: balance query for the zero address");
        return _balances[wallet];
    }

    /**
     * @dev See {IERC721-ownerOf}.
     */
    function ownerOf(uint256 tokenId) public view virtual returns (address) {
        address tokenOwner = _owners[tokenId];
        require(tokenOwner != address(0), "ERC721: owner query for nonexistent token");
        return tokenOwner;
    }
    
    function _exists(uint256 tokenId) internal view virtual returns (bool) {
        return _owners[tokenId] != address(0);
    }

    ///
    /// TRANSFERS
    ///

    function transferFrom(address from, address to, uint256 tokenId) public virtual {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");
        _transfer(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public virtual {
        safeTransferFrom(from, to, tokenId, "");
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) public virtual {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");
        _safeTransfer(from, to, tokenId, _data);
    }

    function _safeTransfer(address from, address to, uint256 tokenId, bytes memory _data) internal virtual {
        _transfer(from, to, tokenId);
        require(_checkOnERC721Received(from, to, tokenId, _data), "ERC721: transfer to non ERC721Receiver implementer");
    }
    
    function _transfer(address from, address to, uint256 tokenId) internal virtual {
        require(ownerOf(tokenId) == from, "ERC721: transfer of token that is not own");
        require(to != address(0), "ERC721: transfer to the zero address");

        // Clear approvals from the previous owner
        _approve(address(0), tokenId);

        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    function _checkOnERC721Received(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) private returns (bool) {
        if (to.isContract()) {
            try IERC721Receiver(to).onERC721Received(_msgSender(), from, tokenId, _data) returns (bytes4 retval) {
                return retval == IERC721Receiver.onERC721Received.selector;
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    revert("ERC721: transfer to non ERC721Receiver implementer");
                } else {
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        } else {
            return true;
        }
    }

    ///
    /// APPROVALS
    ///

    function approve(address to, uint256 tokenId) public virtual {
        address tokenOwner = ownerOf(tokenId);
        require(to != tokenOwner, "ERC721: approval to current owner");

        require(
            _msgSender() == tokenOwner || isApprovedForAll(tokenOwner, _msgSender()),
            "ERC721: approve caller is not owner nor approved for all"
        );

        _approve(to, tokenId);
    }

    function _approve(address to, uint256 tokenId) internal virtual {
        _tokenApprovals[tokenId] = to;

        emit Approval(ownerOf(tokenId), to, tokenId);
    }

    function getApproved(uint256 tokenId) public view virtual returns (address) {
        require(_exists(tokenId), "ERC721: approved query for nonexistent token");
        return _tokenApprovals[tokenId];
    }

    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view virtual returns (bool) {
        require(_exists(tokenId), "ERC721: operator query for nonexistent token");
        address tokenOwner = ownerOf(tokenId);
        return (
            spender == tokenOwner ||
            getApproved(tokenId) == spender ||
            isApprovedForAll(tokenOwner, spender)
        );
    }

    function setApprovalForAll(address operator, bool approved) public virtual {
        require(operator != _msgSender(), "?");

        _operatorApprovals[_msgSender()][operator] = approved;
        emit ApprovalForAll(_msgSender(), operator, approved);
    }

    function isApprovedForAll(address tokenOwner, address operator) public view virtual returns (bool) {
        return _operatorApprovals[tokenOwner][operator];
    }

    ///
    /// METADATA
    ///

    /**
     * @dev See {IERC721Metadata-name}.
     */
    function name() public view virtual returns (string memory) {
        return _name;
    }

    /**
     * @dev See {IERC721Metadata-symbol}.
     */
    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }
    
    /**
     * @dev Same TokenURI for all existing tokens.
     */
    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(_exists(uint16(tokenId)), "ERC721Metadata: URI query for nonexistent token");
        address airdropAddress = _tokenAirdrop[tokenId];
        string memory baseURI = _airdropBaseURI[airdropAddress];
        
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString())) : "";
    }

    /**
     * @dev Store and update new base uri.
     */
    function setBaseURI(address airdropAddress, string memory newURI) external {
        _airdropBaseURI[airdropAddress] = newURI;
    }
}
