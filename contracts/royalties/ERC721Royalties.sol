// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

/// @author jpegmint.xyz

import "./IRoyaltiesERC2981.sol";
import "./IRoyaltiesManifold.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

abstract contract ERC721Royalties is ERC721, IRoyaltiesERC2981, IRoyaltiesManifold {

    address private _royaltiesRecipient;
    uint256 private _royaltiesBasisPoints;

    /**
     * @dev see {IERC165-supportsInterface}
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return
            interfaceId == type(IRoyaltiesERC2981).interfaceId ||
            interfaceId == type(IRoyaltiesManifold).interfaceId ||
            super.supportsInterface(interfaceId)
        ;
    }

    /**
     * @dev See {IRoyaltiesERC2981-royaltyInfo}.
     */
    function royaltyInfo(uint256 tokenId, uint256 value) external view override returns (address, uint256) {
        require(_exists(tokenId), "Nonexistent token");
        return _getRoyaltyInfo(tokenId, value);
    }

    /**
     * @dev See {IRoyaltiesCreatorCore-getRoyalties}.
     */
    function getRoyalties(uint256 tokenId) external view override returns (address payable[] memory, uint256[] memory) {
        require(_exists(tokenId), "Nonexistent token");
        return _getRoyalties(tokenId);
    }

    /**
     * @dev Override with access control to set royalties.
     */
    function setRoyalties(address recipient, uint256 basisPoints) external virtual;

    /**
     * @dev Set contract-wide royalties. 
     */
    function _setRoyalties(address recipient, uint256 basisPoints) internal {
        require(basisPoints <= 10000, 'Royalties: Too high');
        _royaltiesRecipient = recipient;
        _royaltiesBasisPoints = basisPoints;
    }

    /**
     * @dev Calculates royalties using contract-wide setting.
     */
    function _getRoyaltyInfo(uint256, uint256 value) internal view returns (address, uint256) {
        uint256 royaltyAmount = (value * _royaltiesBasisPoints) / 10000;
        return (_royaltiesRecipient, royaltyAmount);
    }

    /**
     * @dev Returns contract-wide royalties.
     */
    function _getRoyalties(uint256) internal view returns (address payable[] memory, uint256[] memory) {

        uint256[] memory royaltyBasisPoints = new uint[](1);
        address payable[] memory royaltyReceivers = new address payable[](1);

        royaltyBasisPoints[0] = _royaltiesBasisPoints;
        royaltyReceivers[0] = payable(_royaltiesRecipient);

        return (royaltyReceivers, royaltyBasisPoints);
    }
}
