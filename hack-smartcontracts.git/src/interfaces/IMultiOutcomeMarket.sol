// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Market, ExtendedMarket, MarketStatus } from "../structs/MarketStructs.sol";

/**
 * @title IMultiOutcomeMarket
 * @author XO Market
 * @custom:security-contact security@xo.market
 */
interface IMultiOutcomeMarket {
    /**
     * @notice Emitted when a new market is created
     * @param marketId Unique identifier for the market
     * @param creator Address of the market creator
     * @param startsAt Starts at timestamp of the market
     * @param expiresAt Expires at timestamp of the market
     * @param collateralToken Address of the collateral token used
     * @param outcomeCount Number of possible outcomes in the market
     * @param metaDataURI URI for additional market metadata
     */
    event MarketCreated(
        uint256 indexed marketId,
        address indexed creator,
        uint40 startsAt,
        uint40 expiresAt,
        address collateralToken,
        uint8 outcomeCount,
        string metaDataURI
    );

    /**
     * @notice Emitted when a market is resolved
     * @param marketId Unique identifier for the market
     * @param resolver Address of the entity resolving the market
     * @param winningTokenId Token ID of the winning outcome
     */
    event MarketResolved(uint256 indexed marketId, address indexed resolver, uint256 winningTokenId);

    /**
     * @notice Emitted when outcome tokens are bought
     * @param marketId Unique identifier for the market
     * @param buyer Address of the buyer
     * @param outcome Index of the outcome bought
     * @param amount Amount of outcome tokens bought
     * @param cost Total cost of the purchase
     */
    event OutcomeTokensBought(
        uint256 indexed marketId, address indexed buyer, uint8 outcome, uint256 amount, uint256 cost
    );

    /**
     * @notice Emitted when outcome tokens are sold
     * @param marketId Unique identifier for the market
     * @param seller Address of the seller
     * @param outcome Index of the outcome sold
     * @param amount Amount of outcome tokens sold
     * @param received Total collateral received from the sale
     */
    event OutcomeTokensSold(
        uint256 indexed marketId, address indexed seller, uint8 outcome, uint256 amount, uint256 received
    );

    /**
     * @notice Emitted when collateral is redeemed
     * @param marketId Unique identifier for the market
     * @param redeemer Address of the redeemer
     * @param amount Amount of collateral redeemed
     */
    event CollateralRedeemed(uint256 indexed marketId, address indexed redeemer, uint256 amount);

    /**
     * @notice Emitted when the XO Markets address is set
     * @param xoMarketsAddress Address of the XO Markets
     */
    event XOMarketsAddressSet(address indexed xoMarketsAddress);

    /**
     * @notice Emitted when a collateral token's allowed status is set
     * @param token Address of the collateral token
     * @param allowed Boolean indicating if the token is allowed
     */
    event CollateralTokenAllowed(address indexed token, bool allowed);

    /**
     * @notice Emitted when the minimum initial collateral is set
     * @param amount Minimum initial collateral amount
     */
    event MinimumInitialCollateralSet(uint256 amount);

    /**
     * @notice Emitted when the protocol fee is set
     * @param feeBps Protocol fee in basis points
     */
    event ProtocolFeeSet(uint256 feeBps);

    /**
     * @notice Emitted when the insurance address is set
     * @param insuranceAddress Address of the insurance
     */
    event InsuranceAddressSet(address indexed insuranceAddress);

    /**
     * @notice Emitted when a market resolver is set
     * @param resolver Address of the resolver
     * @param isPublicResolver Boolean indicating if the resolver is a public resolver
     */
    event MarketResolverSet(address indexed resolver, bool isPublicResolver);

    /**
     * @notice Emitted when a market resolver fee is set
     * @param resolver Address of the resolver
     * @param feeBps Fee in basis points
     */
    event MarketResolverFeeSet(address indexed resolver, uint16 feeBps);

    /**
     * @notice Emitted when a market is reviewed
     * @param marketId Unique identifier for the market
     * @param isApproved Boolean indicating if the market is approved
     * @param data Additional data about the review
     */
    event MarketReviewed(uint256 indexed marketId, bool isApproved, string data);

    /**
     * @notice Emitted when a market status is updated
     * @param marketId Unique identifier for the market
     * @param status New status of the market
     */
    event MarketStatusUpdated(uint256 indexed marketId, MarketStatus status);

    /**
     * @notice Emitted when the market price changes
     * @param marketId Unique identifier for the market
     * @param outcomePrices Array of prices for each outcome in the market
     */
    event MarketPriceChanged(uint256 indexed marketId, uint256[] outcomePrices);

    /**
     * @notice Creates a new market with specified parameters
     * @param _startsAt Starts at timestamp for the market
     * @param _expiresAt Expires at timestamp for the market
     * @param _collateralToken Address of the collateral token
     * @param _initialCollateral Initial collateral amount required
     * @param _creatorFeeBps Creator fee in basis points
     * @param _outcomeCount Number of outcomes for the market
     * @param _resolver Address of the resolver
     * @param _metaDataURI URI for market metadata
     */
    function createMarket(
        uint40 _startsAt,
        uint40 _expiresAt,
        address _collateralToken,
        uint256 _initialCollateral,
        uint16 _creatorFeeBps,
        uint8 _outcomeCount,
        address _resolver,
        string memory _metaDataURI
    ) external;

    /**
     * @notice Resolves a market by specifying the winning outcome
     * @param _marketId Unique identifier for the market
     * @param _winningTokenId Token ID of the winning outcome
     */
    function resolveMarket(uint256 _marketId, uint128 _winningTokenId) external;

    /**
     * @notice Buys outcome tokens for a specified market
     * @param _marketId Unique identifier for the market
     * @param _outcome Index of the outcome to buy
     * @param _amount Amount of outcome tokens to buy
     * @param _maxCost Maximum cost willing to pay
     */
    function buy(uint256 _marketId, uint8 _outcome, uint256 _amount, uint256 _maxCost) external;

    /**
     * @notice Sells outcome tokens for a specified market
     * @param _marketId Unique identifier for the market
     * @param _outcome Index of the outcome to sell
     * @param _amount Amount of outcome tokens to sell
     * @param _minReturn Minimum return expected
     */
    function sell(uint256 _marketId, uint8 _outcome, uint256 _amount, uint256 _minReturn) external;

    /**
     * @notice Redeems collateral for a resolved market
     * @param _marketId Unique identifier for the market
     */
    function redeem(uint256 _marketId) external;

    /**
     * @notice Redeems collateral for a defaulted market
     * @param _marketId Unique identifier for the market
     */
    function redeemDefaultedMarket(uint256 _marketId) external;

    /**
     * @notice Retrieves the price of a specific outcome in a market
     * @param _marketId Unique identifier for the market
     * @param _outcome Index of the outcome
     * @return The price of the specified outcome
     */
    function getPrice(uint256 _marketId, uint8 _outcome) external view returns (uint256);

    
    function getPrices(uint256 marketId) external view returns (uint256[] memory);
    
    /**
     * @notice Retrieves market details
     * @param _marketId Unique identifier for the market
     * @return Market structure containing market details
     */
    function getMarket(uint256 _marketId) external view returns (Market memory);

    /**
     * @notice Retrieves extended market details
     * @param _marketId Unique identifier for the market
     * @return ExtendedMarket structure containing detailed market information
     */
    function getExtendedMarket(uint256 _marketId) external view returns (ExtendedMarket memory);

    /**
     * @notice Calculates the cost to purchase a specific amount of outcome tokens
     * @param _marketId Unique identifier for the market
     * @param _outcome Index of the outcome
     * @param _amount Amount of outcome tokens
     * @return The cost to purchase the specified amount of outcome tokens
     */
    function getOutcomePurchaseCost(uint256 _marketId, uint8 _outcome, uint256 _amount)
        external
        view
        returns (uint256);

    /**
     * @notice Calculates the return from selling a specific amount of outcome tokens
     * @param _marketId Unique identifier for the market
     * @param _outcome Index of the outcome
     * @param _amount Amount of outcome tokens
     * @return The return from selling the specified amount of outcome tokens
     */
    function getOutcomeSaleReturn(uint256 _marketId, uint8 _outcome, uint256 _amount) external view returns (uint256);

    /**
     * @notice Retrieves the index of the outcome token for a market
     * @param marketId Unique identifier for the market
     * @param outcome Index of the outcome
     * @return The index of the outcome token
     */
    function getMarketOutcomeTokenIndex(uint256 marketId, uint8 outcome) external view returns (uint256);

    /**
     * @notice Retrieves the amount of outcome tokens for a market
     * @param marketId Unique identifier for the market
     * @param outcome Index of the outcome
     * @return The amount of outcome tokens
     */
    function getMarketOutcomeTokenAmount(uint256 marketId, uint8 outcome) external view returns (uint256);

    /**
     * @notice Retrieves the total collateral amount for a market
     * @param marketId Unique identifier for the market
     * @return The total collateral amount
     */
    function getMarketCollateral(uint256 marketId) external view returns (uint256);

    /**
     * @notice Checks if a market is resolved
     * @param marketId Unique identifier for the market
     * @return True if the market is resolved, false otherwise
     */
    function isMarketResolved(uint256 marketId) external view returns (bool);

    /**
     * @notice Retrieves the redeemable amount for a specific amount of winning tokens
     * @param marketId Unique identifier for the market
     * @param amount Amount of winning tokens
     * @return The redeemable amount
     */
    function getRedeemableAmount(uint256 marketId, uint256 amount) external view returns (uint256);

    /**
     * @notice Sets the allowed status of a collateral token
     * @param token Address of the collateral token
     * @param allowed Boolean indicating if the token is allowed
     */
    function setCollateralTokenAllowed(address token, bool allowed) external;

    /**
     * @notice Checks if a collateral token is allowed
     * @param token Address of the collateral token
     * @return True if the token is allowed, false otherwise
     */
    function getCollateralTokenAllowed(address token) external view returns (bool);

    /**
     * @notice Sets the minimum initial collateral amount
     * @param amount Minimum initial collateral amount
     */
    function setMinimumInitialCollateral(uint256 amount) external;

    /**
     * @notice Retrieves the minimum initial collateral amount
     * @return The minimum initial collateral amount
     */
    function getMinimumInitialCollateral() external view returns (uint256);

    /**
     * @notice Sets the protocol fee in basis points
     * @param feeBps Protocol fee in basis points
     */
    function setProtocolFee(uint256 feeBps) external;

    /**
     * @notice Retrieves the protocol fee in basis points
     * @return The protocol fee in basis points
     */
    function getProtocolFee() external view returns (uint256);

    /**
     * @notice Sets the insurance address
     * @param insuranceAddress Address of the insurance
     */
    function setInsuranceAddress(address insuranceAddress) external;

    /**
     * @notice Retrieves the insurance address
     * @return The insurance address
     */
    function getInsuranceAddress() external view returns (address);
}
