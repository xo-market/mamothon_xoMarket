// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Market, ExtendedMarket, MarketResolver, CollateralConfig } from "./structs/MarketStructs.sol";

abstract contract MultiOutcomeMarketStorage {
    bytes32 private constant _XO_PROTOCOL_STORAGE = 0xb8d3716136db480afe9a80da6be84f994509ecf9515ed14d03024589b5f2bd00;

    struct BaseStorage {
        mapping(uint256 => Market) markets;
        mapping(address => CollateralConfig) allowedCollateralTokens;
        mapping(address => MarketResolver) marketResolvers;
        address xoMarketsAddress;
        uint256 minimumInitialCollateral;
        uint256 protocolFeeBps;
        address insuranceAddress;
    }

    function _getStorage() internal pure returns (BaseStorage storage $) {
        assembly {
            $.slot := _XO_PROTOCOL_STORAGE
        }
    }
}
