// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract XOutcome is ERC1155Supply, AccessControl {
    uint256 private _nextTokenId = 1;

    constructor(string memory uri) ERC1155(uri) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function reserveTokensAndMint(address to, uint256 count, uint256 amount) external returns (uint256) {
        uint256[] memory ids = new uint256[](count);
        uint256[] memory amounts = new uint256[](count);
        uint256 startIndex = _nextTokenId;
        for (uint256 i = 0; i < count; i++) {
            ids[i] = startIndex + i;
            amounts[i] = amount;
        }

        _mintBatch(to, ids, amounts, "");
        _nextTokenId = startIndex + count;

        return startIndex;
    }

    function mint(address to, uint256 id, uint256 amount, bytes memory data) external {
        _mint(to, id, amount, data);
    }

    function burn(address from, uint256 id, uint256 amount) external {
        _burn(from, id, amount);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
