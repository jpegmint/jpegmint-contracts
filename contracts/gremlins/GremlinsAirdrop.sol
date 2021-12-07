// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

/// @author jpegmint.xyz

import "./GremlinsERC721Proxy.sol";
import "@openzeppelin/contracts/utils/StorageSlot.sol";
import "@openzeppelin/contracts/access/IAccessControl.sol";

/*
 ██████╗ ██████╗ ███████╗███╗   ███╗██╗     ██╗███╗   ██╗███████╗     █████╗ ██╗██████╗ ██████╗ ██████╗  ██████╗ ██████╗ 
██╔════╝ ██╔══██╗██╔════╝████╗ ████║██║     ██║████╗  ██║██╔════╝    ██╔══██╗██║██╔══██╗██╔══██╗██╔══██╗██╔═══██╗██╔══██╗
██║  ███╗██████╔╝█████╗  ██╔████╔██║██║     ██║██╔██╗ ██║███████╗    ███████║██║██████╔╝██║  ██║██████╔╝██║   ██║██████╔╝
██║   ██║██╔══██╗██╔══╝  ██║╚██╔╝██║██║     ██║██║╚██╗██║╚════██║    ██╔══██║██║██╔══██╗██║  ██║██╔══██╗██║   ██║██╔═══╝ 
╚██████╔╝██║  ██║███████╗██║ ╚═╝ ██║███████╗██║██║ ╚████║███████║    ██║  ██║██║██║  ██║██████╔╝██║  ██║╚██████╔╝██║     
 ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝    ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝     
*/
contract GremlinsAirdrop is GremlinsERC721Proxy {

    // Base Roles
    bytes32 private constant _AIRDROP_ADMIN_ROLE = keccak256("AIRDROP_ADMIN_ROLE");

    // Max planned supply
    uint16 public constant TOKEN_MAX_SUPPLY = 100;

    // App storage structure
    struct AppStorage {
        uint16 totalSupply;
        uint16[TOKEN_MAX_SUPPLY] tokenIdTracker;
    }

    //  ██████╗ ██████╗ ███╗   ██╗███████╗████████╗██████╗ ██╗   ██╗ ██████╗████████╗ ██████╗ ██████╗ 
    // ██╔════╝██╔═══██╗████╗  ██║██╔════╝╚══██╔══╝██╔══██╗██║   ██║██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗
    // ██║     ██║   ██║██╔██╗ ██║███████╗   ██║   ██████╔╝██║   ██║██║        ██║   ██║   ██║██████╔╝
    // ██║     ██║   ██║██║╚██╗██║╚════██║   ██║   ██╔══██╗██║   ██║██║        ██║   ██║   ██║██╔══██╗
    // ╚██████╗╚██████╔╝██║ ╚████║███████║   ██║   ██║  ██║╚██████╔╝╚██████╗   ██║   ╚██████╔╝██║  ██║
    //  ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝  ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝

    // Constructor
    constructor(address baseContract, string memory name_, string memory symbol_)
    GremlinsERC721Proxy(baseContract, name_, symbol_) {}


    // ███████╗████████╗ ██████╗ ██████╗  █████╗  ██████╗ ███████╗
    // ██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗██╔══██╗██╔════╝ ██╔════╝
    // ███████╗   ██║   ██║   ██║██████╔╝███████║██║  ███╗█████╗  
    // ╚════██║   ██║   ██║   ██║██╔══██╗██╔══██║██║   ██║██╔══╝  
    // ███████║   ██║   ╚██████╔╝██║  ██║██║  ██║╚██████╔╝███████╗
    // ╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝

    /**
     * @dev Gets app storage struct from defined storage slot.
     */
    function _appStorage() internal pure returns(AppStorage storage app) {
        bytes32 storagePosition = bytes32(uint256(keccak256("app.storage")) - 1);
        assembly {
            app.slot := storagePosition
        }
    }

    // █████╗ ██╗██████╗ ██████╗ ██████╗  ██████╗ ██████╗ 
    // ██╔══██╗██║██╔══██╗██╔══██╗██╔══██╗██╔═══██╗██╔══██╗
    // ███████║██║██████╔╝██║  ██║██████╔╝██║   ██║██████╔╝
    // ██╔══██║██║██╔══██╗██║  ██║██╔══██╗██║   ██║██╔═══╝ 
    // ██║  ██║██║██║  ██║██████╔╝██║  ██║╚██████╔╝██║     
    // ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝     

    /**
     * @dev Mints tokens to the specified wallets.
     */
    function airdrop(address[] calldata wallets, uint8[] calldata indexes) public {
        require(IAccessControl(_implementation()).hasRole(_AIRDROP_ADMIN_ROLE, msg.sender), "!R");
        require(wallets.length == indexes.length, "?");
        require(availableSupply() >= wallets.length, "#");

        for (uint8 i = 0; i < wallets.length; i++) {
            _airdrop(wallets[i], _generateTokenId(indexes[i]));
        }
    }

    /**
     * @dev Process airdrop by delegating to base contract.
     */
    function _airdrop(address to, uint256 tokenId) internal {
        _appStorage().totalSupply += 1;
        
        bytes memory data = abi.encodeWithSignature("mint(address,uint256,string)", to, tokenId, "");
        Address.functionDelegateCall(_implementation(), data);
    }

    /**
     * @dev Generate random tokenIds using Meebits random ID strategy, with ability to override.
     */
    function _generateTokenId(uint256 index) private returns (uint256) {

        uint256 remainingQty = availableSupply();

        // Generate a randomIndex or use given specId as index.
        require(index <= remainingQty, "ID");
        uint256 randomIndex = (index != 0 ? index - 1 : _generateRandomNum(remainingQty) % remainingQty);

        // If array value exists at random index, use value, otherwise use generated index as tokenId.
        AppStorage storage app = _appStorage();
        uint256 existingValue = app.tokenIdTracker[randomIndex];
        uint256 tokenId = existingValue != 0 ? existingValue : randomIndex;

        // Keep track of seen indexes for black magic.
        uint16 endIndex = uint16(remainingQty - 1);
        uint16 endValue = app.tokenIdTracker[endIndex];
        app.tokenIdTracker[randomIndex] = endValue != 0 ? endValue : endIndex;

        return tokenId + 1; // Start tokens at #1
    }

    /**
     * @dev Generate pseudorandom number via various transaction properties.
     */
    function _generateRandomNum(uint256 seed) internal view virtual returns (uint256) {
        return uint256(keccak256(abi.encodePacked(msg.sender, tx.gasprice, block.timestamp, seed)));
    }


    // ███████╗██╗   ██╗██████╗ ██████╗ ██╗  ██╗   ██╗
    // ██╔════╝██║   ██║██╔══██╗██╔══██╗██║  ╚██╗ ██╔╝
    // ███████╗██║   ██║██████╔╝██████╔╝██║   ╚████╔╝ 
    // ╚════██║██║   ██║██╔═══╝ ██╔═══╝ ██║    ╚██╔╝  
    // ███████║╚██████╔╝██║     ██║     ███████╗██║   
    // ╚══════╝ ╚═════╝ ╚═╝     ╚═╝     ╚══════╝╚═╝   

    /**
     * @dev See {IERC721Enumerable-totalSupply}.
     */
    function totalSupply() public view returns (uint256) {
        return _appStorage().totalSupply;
    }

    /**
     * @dev Helper function to pair with total supply.
     */
    function availableSupply() public view returns (uint256) {
        return TOKEN_MAX_SUPPLY - totalSupply();
    }
}
