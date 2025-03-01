// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

struct Market {
    uint128 id;
    uint40 expiresAt;
    uint40 startsAt;
    uint40 createdAt; // maybe remove this
    uint40 resolvedAt;
    uint128 winningOutcome; // use token id instead of outcome index?
    // address creator;
    address resolver;
    uint16 creatorFeeBps;
    uint256 outcomeTokenStartIndex;
    uint8 outcomeCount;
    address collateralToken;
    uint256 collateralAmount;
    MarketStatus status;
}

enum MarketStatus {
    PENDING,
    REVISION,
    CANCELLED,
    ACTIVE,
    RESOLVED
}

struct ExtendedMarket {
    Market market;
    uint256[] collateralAmounts;
    uint256[] outcomePrices;
}

struct CollateralConfig {
    bool isAllowed;
    uint128 minimumCollateralAmount;
    uint128 maximumCollateralAmount;
    uint128 bondAmount;
}

struct MarketResolver {
    bool isPublicResolver;
    uint16 feeBps;
}
