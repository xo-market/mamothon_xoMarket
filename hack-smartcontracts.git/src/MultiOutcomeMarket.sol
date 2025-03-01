// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/manager/AccessManaged.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import { ABDKMathQuad } from "abdk/ABDKMathQuad.sol";
import { MultiOutcomeMarketStorage } from "./MultiOutcomeMarketStorage.sol";
import { XOMarket } from "./tokens/XOMarket.sol";
import { XOutcome } from "./tokens/XOutcome.sol";
import { Market, ExtendedMarket, MarketStatus, MarketResolver } from "./structs/MarketStructs.sol";
import { IMultiOutcomeMarket } from "./interfaces/IMultiOutcomeMarket.sol";

contract MultiOutcomeMarket is IMultiOutcomeMarket, MultiOutcomeMarketStorage, AccessManaged {
    using Math for uint256;
    using ABDKMathQuad for bytes16;

    uint256 public constant MAX_BPS = 1e4;
    uint256 public constant LARGE_NUMBER = 1e18;
    uint256 public constant ALPHA = 1200;
    uint256 public constant RESOLUTION_PERIOD = 24 hours;

    XOMarket public immutable xoMarkets;
    XOutcome public immutable xOutcomes;

    constructor(
        address _initialAuthority,
        address _xoMarketsAddress,
        address _xOutcomesAddress,
        uint256 _minimumInitialCollateral,
        uint256 _protocolFeeBps,
        address _insuranceAddress,
        address[] memory _allowedCollateralTokens
    ) AccessManaged(_initialAuthority) {
        BaseStorage storage $ = _getStorage();
        $.minimumInitialCollateral = _minimumInitialCollateral;
        $.protocolFeeBps = _protocolFeeBps;
        $.insuranceAddress = _insuranceAddress;
        for (uint256 i = 0; i < _allowedCollateralTokens.length; i++) {
            $.allowedCollateralTokens[_allowedCollateralTokens[i]].isAllowed = true;
        }
        xoMarkets = XOMarket(_xoMarketsAddress);
        xOutcomes = XOutcome(_xOutcomesAddress);
    }

    modifier marketExists(uint256 _marketId) {
        require(_getStorage().markets[_marketId].id != 0, "Market does not exist");
        _;
    }

    modifier marketNotResolved(uint256 _marketId) {
        require(_getStorage().markets[_marketId].resolvedAt == 0, "Market already resolved");
        _;
    }

    modifier marketDefaulted(uint256 _marketId) {
        require(
            _getStorage().markets[_marketId].expiresAt + RESOLUTION_PERIOD < block.timestamp
                && _getStorage().markets[_marketId].resolvedAt == 0,
            "Market not defaulted"
        );
        _;
    }

    modifier marketNotDefaulted(uint256 _marketId) {
        require(_getStorage().markets[_marketId].expiresAt + RESOLUTION_PERIOD >= block.timestamp, "Market defaulted");
        _;
    }

    modifier marketResolved(uint256 _marketId) {
        require(_getStorage().markets[_marketId].resolvedAt != 0, "Market not resolved");
        _;
    }

    modifier marketExpired(uint256 _marketId) {
        require(block.timestamp >= _getStorage().markets[_marketId].expiresAt, "Market not expired");
        _;
    }

    modifier marketNotExpired(uint256 _marketId) {
        require(block.timestamp < _getStorage().markets[_marketId].expiresAt, "Market expired");
        _;
    }

    modifier marketActive(uint256 _marketId) {
        require(_getStorage().markets[_marketId].status == MarketStatus.ACTIVE, "Market not active");
        _;
    }

    /**
     * @inheritdoc IMultiOutcomeMarket
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
    ) external {
        require(_startsAt > block.timestamp, "Starts at must be in the future");
        require(_expiresAt > _startsAt, "Expires at must be after starts at");
        require(_getStorage().allowedCollateralTokens[_collateralToken].isAllowed, "Collateral token not allowed");
        require(_initialCollateral >= _getStorage().minimumInitialCollateral, "Initial collateral too low");
        require(_creatorFeeBps <= MAX_BPS, "Creator fee exceeds maximum");
        require(IERC20(_collateralToken).balanceOf(msg.sender) >= _initialCollateral, "Insufficient collateral balance");
        IERC20(_collateralToken).transferFrom(msg.sender, address(this), _initialCollateral);

        BaseStorage storage $ = _getStorage();
        uint256 marketId = xoMarkets.mint(msg.sender, _metaDataURI);
        uint256 startIndex = xOutcomes.reserveTokensAndMint(msg.sender, _outcomeCount, _initialCollateral);

        Market storage newMarket = $.markets[marketId];
        newMarket.id = uint128(marketId);
        newMarket.startsAt = _startsAt;
        newMarket.expiresAt = _expiresAt;
        newMarket.createdAt = uint40(block.timestamp);

        if ($.marketResolvers[_resolver].isPublicResolver) {
            newMarket.status = MarketStatus.PENDING;
        } else {
            newMarket.status = MarketStatus.ACTIVE;
        }

        newMarket.resolver = _resolver;
        newMarket.creatorFeeBps = _creatorFeeBps;
        newMarket.outcomeTokenStartIndex = startIndex;
        newMarket.outcomeCount = _outcomeCount;
        newMarket.collateralToken = _collateralToken;
        newMarket.collateralAmount = _initialCollateral;

        emit MarketCreated(marketId, msg.sender, _startsAt, _expiresAt, _collateralToken, _outcomeCount, _metaDataURI);
    }

    function reviewMarket(uint256 _marketId, bool _isApproved, string memory data) external {
        BaseStorage storage $ = _getStorage();
        Market storage market = $.markets[_marketId];
        require(market.status == MarketStatus.PENDING || market.status == MarketStatus.REVISION, "Market not pending");
        require(msg.sender == market.resolver, "Only resolver can review");
        require(market.expiresAt > block.timestamp, "Market expired");

        if (_isApproved) {
            market.status = MarketStatus.ACTIVE;
        } else if (market.status == MarketStatus.REVISION) {
            market.status = MarketStatus.CANCELLED;
        } else {
            market.status = MarketStatus.REVISION;
        }
        emit MarketStatusUpdated(_marketId, market.status);
        emit MarketReviewed(_marketId, _isApproved, data);
    }

    function setMarketResolver(address _resolver, bool _isPublicResolver) external {
        BaseStorage storage $ = _getStorage();
        $.marketResolvers[_resolver].isPublicResolver = _isPublicResolver;
        emit MarketResolverSet(_resolver, _isPublicResolver);
    }

    function setMarketResolverFee(uint16 _feeBps) external {
        require(_feeBps <= MAX_BPS, "Fee exceeds maximum");
        BaseStorage storage $ = _getStorage();

        $.marketResolvers[msg.sender].feeBps = _feeBps;
        emit MarketResolverFeeSet(msg.sender, _feeBps);
    }

    function getMarketResolver(address _resolver) external view returns (MarketResolver memory) {
        return _getStorage().marketResolvers[_resolver];
    }

    /**
     * @inheritdoc IMultiOutcomeMarket
     */
    function resolveMarket(uint256 _marketId, uint128 _winningOutcome)
        external
        marketExists(_marketId)
        marketNotResolved(_marketId)
        marketExpired(_marketId)
        marketActive(_marketId)
    {
        BaseStorage storage $ = _getStorage();
        Market storage market = $.markets[_marketId];
        market.winningOutcome = uint128(market.outcomeTokenStartIndex + _winningOutcome);
        market.resolvedAt = uint40(block.timestamp);
        market.status = MarketStatus.RESOLVED;
        market.resolver = msg.sender;
        uint256 creatorFee = market.collateralAmount.mulDiv(market.creatorFeeBps, MAX_BPS);
        uint256 protocolFee = market.collateralAmount.mulDiv($.protocolFeeBps, MAX_BPS);
        uint256 collateralAfterFees = market.collateralAmount - (creatorFee + protocolFee);
        IERC20 collateralToken = IERC20(market.collateralToken);
        address creator = xoMarkets.ownerOf(market.id);
        collateralToken.transfer(creator, creatorFee);
        collateralToken.transfer($.insuranceAddress, protocolFee);

        market.collateralAmount = collateralAfterFees;

        emit MarketResolved(_marketId, msg.sender, _winningOutcome);
    }

    function _calculatePurchaseCost(uint256 _marketId, uint8 _outcome, uint256 _amount)
        internal
        view
        returns (uint256)
    {
        BaseStorage storage $ = _getStorage();
        Market storage market = $.markets[_marketId];
        require(_outcome < market.outcomeCount, "Invalid outcome");
        uint256[] memory supplies = _getSupplies(_marketId);
        uint256 oldCost = _getLSMSRCost(supplies);
        supplies[_outcome] += _amount;
        uint256 newCost = _getLSMSRCost(supplies);
        return newCost - oldCost;
    }

    function _calculateSaleReturn(uint256 _marketId, uint8 _outcome, uint256 _amount) internal view returns (uint256) {
        BaseStorage storage $ = _getStorage();
        Market storage market = $.markets[_marketId];
        require(_outcome < market.outcomeCount, "Invalid outcome");
        uint256[] memory supplies = _getSupplies(_marketId);
        uint256 oldCost = _getLSMSRCost(supplies);
        require(supplies[_outcome] >= _amount, "Insufficient supply");
        supplies[_outcome] -= _amount;
        uint256 newCost = _getLSMSRCost(supplies);
        return oldCost - newCost;
    }

    function _getLSMSRCost(uint256[] memory supplies) internal pure returns (uint256) {
        uint256 alpha = 1000;
        uint256 sumSupplies;
        for (uint256 i = 0; i < supplies.length; i++) {
            sumSupplies += supplies[i];
        }
        uint256 B = (alpha * sumSupplies) / MAX_BPS;
        bytes16 sumExp;
        for (uint256 i = 0; i < supplies.length; i++) {
            bytes16 fraction = ABDKMathQuad.div(ABDKMathQuad.fromUInt(supplies[i]), ABDKMathQuad.fromUInt(B));
            bytes16 exp = ABDKMathQuad.exp(fraction);
            sumExp = ABDKMathQuad.add(sumExp, exp);
        }
        bytes16 lnS = ABDKMathQuad.ln(sumExp);
        bytes16 cost = ABDKMathQuad.mul(ABDKMathQuad.fromUInt(B), lnS);
        return ABDKMathQuad.toUInt(cost);
    }

    /**
     * @inheritdoc IMultiOutcomeMarket
     */
    function buy(uint256 _marketId, uint8 _outcome, uint256 _amount, uint256 _maxCost)
        external
        marketExists(_marketId)
        marketNotExpired(_marketId)
        marketActive(_marketId)
    {
        BaseStorage storage $ = _getStorage();
        Market storage market = $.markets[_marketId];
        require(_outcome < market.outcomeCount, "Invalid outcome");
        uint256 cost = _calculatePurchaseCost(_marketId, _outcome, _amount);
        require(cost <= _maxCost, "Cost exceeds maximum");
        IERC20(market.collateralToken).transferFrom(msg.sender, address(this), cost);
        market.collateralAmount += cost;
        xOutcomes.mint(msg.sender, market.outcomeTokenStartIndex + _outcome, _amount, "");
        emit OutcomeTokensBought(_marketId, msg.sender, _outcome, _amount, cost);

        uint256[] memory outcomePrices = _getOutcomePrices(_marketId);
        emit MarketPriceChanged(_marketId, outcomePrices);
    }

    /**
     * @inheritdoc IMultiOutcomeMarket
     */
    function sell(uint256 _marketId, uint8 _outcome, uint256 _amount, uint256 _minReturn)
        external
        marketExists(_marketId)
        marketNotExpired(_marketId)
        marketActive(_marketId)
    {
        BaseStorage storage $ = _getStorage();
        Market storage market = $.markets[_marketId];
        require(_outcome < market.outcomeCount, "Invalid outcome");
        uint256 received = _calculateSaleReturn(_marketId, _outcome, _amount);
        require(received >= _minReturn, "Return below minimum");
        uint256 tokenId = market.outcomeTokenStartIndex + _outcome;
        require(xOutcomes.balanceOf(msg.sender, tokenId) >= _amount, "Insufficient outcome tokens");
        xOutcomes.burn(msg.sender, tokenId, _amount);
        market.collateralAmount -= received;
        IERC20(market.collateralToken).transfer(msg.sender, received);
        emit OutcomeTokensSold(_marketId, msg.sender, _outcome, _amount, received);

        uint256[] memory outcomePrices = _getOutcomePrices(_marketId);
        emit MarketPriceChanged(_marketId, outcomePrices);
    }

    /**
     * @inheritdoc IMultiOutcomeMarket
     */
    function redeem(uint256 _marketId) external marketExists(_marketId) marketResolved(_marketId) {
        BaseStorage storage $ = _getStorage();
        Market storage market = $.markets[_marketId];
        uint256 winningTokenId = market.winningOutcome;
        uint256 userWinningTokens = xOutcomes.balanceOf(msg.sender, winningTokenId);
        require(userWinningTokens > 0, "No winning tokens to redeem");
        uint256 redeemableAmount = _getRedeemableAmount(_marketId, userWinningTokens);
        IERC20(market.collateralToken).transfer(msg.sender, redeemableAmount);
        xOutcomes.burn(msg.sender, winningTokenId, userWinningTokens);
        market.collateralAmount -= redeemableAmount;
        emit CollateralRedeemed(_marketId, msg.sender, redeemableAmount);
    }

    /**
     * @inheritdoc IMultiOutcomeMarket
     */
    function redeemDefaultedMarket(uint256 _marketId) external marketExists(_marketId) marketDefaulted(_marketId) {
        BaseStorage storage $ = _getStorage();
        Market storage market = $.markets[_marketId];

        // resolve outomes equally
        uint8 outcomeCount = market.outcomeCount;
        uint256 outcomeTokenStartIndex = market.outcomeTokenStartIndex;
        uint256 totalCollateralPerOutcome = (market.collateralAmount * LARGE_NUMBER) / outcomeCount;
        uint256 totalCollateralRedeemed = 0;
        for (uint8 i = 0; i < outcomeCount; i++) {
            uint256 outcomeTokenId = outcomeTokenStartIndex + i;
            uint256 outcomeTokenSupply = xOutcomes.totalSupply(outcomeTokenId);
            uint256 collateralPerOutcome = totalCollateralPerOutcome / outcomeTokenSupply;
            uint256 userOutcomeAmount = xOutcomes.balanceOf(msg.sender, outcomeTokenId);
            xOutcomes.burn(msg.sender, outcomeTokenId, userOutcomeAmount);

            uint256 userCollateral = (collateralPerOutcome * userOutcomeAmount) / LARGE_NUMBER;
            IERC20(market.collateralToken).transfer(msg.sender, userCollateral);
            totalCollateralRedeemed += userCollateral;
        }
        market.collateralAmount -= totalCollateralRedeemed;
        emit CollateralRedeemed(_marketId, msg.sender, totalCollateralRedeemed);
    }

    function _getRedeemableAmount(uint256 _marketId, uint256 _amount) internal view returns (uint256) {
        BaseStorage storage $ = _getStorage();
        Market storage market = $.markets[_marketId];
        uint256 winningTokenId = market.winningOutcome;
        uint256 winningTokenSupply = xOutcomes.totalSupply(winningTokenId);
        uint256 redeemablePerToken =
            winningTokenSupply > 0 ? (market.collateralAmount * LARGE_NUMBER) / winningTokenSupply : 0;
        redeemablePerToken = redeemablePerToken > LARGE_NUMBER ? LARGE_NUMBER : redeemablePerToken;
        return (redeemablePerToken * _amount) / LARGE_NUMBER;
    }

    function _getOutcomePrices(uint256 _marketId) internal view returns (uint256[] memory) {
        BaseStorage storage $ = _getStorage();
        Market storage market = $.markets[_marketId];
        uint256 outcomeCount = market.outcomeCount;
        uint256[] memory prices = new uint256[](outcomeCount);
        for (uint8 i = 0; i < outcomeCount; i++) {
            prices[i] = _getPrice(_marketId, i);
        }
        return prices;
    }

    function _getPrice(uint256 _marketId, uint8 _outcome) internal view returns (uint256) {
        BaseStorage storage $ = _getStorage();
        Market storage market = $.markets[_marketId];
        require(_outcome < market.outcomeCount, "Invalid outcome");
        uint256[] memory supplies = _getSupplies(_marketId);
        uint256 alpha = 1000;
        uint256 sumSupplies;
        for (uint256 i = 0; i < supplies.length; i++) {
            sumSupplies += supplies[i];
        }
        uint256 B = (alpha * sumSupplies) / MAX_BPS;
        bytes16 sumExp;
        bytes16 outcomeExp;
        for (uint256 i = 0; i < supplies.length; i++) {
            bytes16 fraction = ABDKMathQuad.div(ABDKMathQuad.fromUInt(supplies[i]), ABDKMathQuad.fromUInt(B));
            bytes16 exp = ABDKMathQuad.exp(fraction);
            sumExp = ABDKMathQuad.add(sumExp, exp);
            if (i == _outcome) outcomeExp = exp;
        }
        bytes16 price = outcomeExp.div(sumExp).mul(ABDKMathQuad.fromUInt(LARGE_NUMBER));
        return ABDKMathQuad.toUInt(price);
    }

    /**
     * @inheritdoc IMultiOutcomeMarket
     */
    function getPrice(uint256 marketId, uint8 _outcome) external view marketExists(marketId) returns (uint256) {
        return _getPrice(marketId, _outcome);
    }

    function getPrices(uint256 marketId) external view marketExists(marketId) returns (uint256[] memory) {
        return _getOutcomePrices(marketId);
    }

    function _getSupplies(uint256 _marketId) internal view returns (uint256[] memory) {
        BaseStorage storage $ = _getStorage();
        Market storage market = $.markets[_marketId];
        uint256 outcomeCount = market.outcomeCount;
        uint256 startIndex = market.outcomeTokenStartIndex;
        uint256[] memory supplies = new uint256[](outcomeCount);
        for (uint8 i = 0; i < outcomeCount; i++) {
            supplies[i] = xOutcomes.totalSupply(startIndex + i);
        }
        return supplies;
    }

    function setXOMarketsAddress(address _xoMarkets) external {
        _getStorage().xoMarketsAddress = _xoMarkets;
        emit XOMarketsAddressSet(_xoMarkets);
    }

    /**
     * @inheritdoc IMultiOutcomeMarket
     */
    function getMarket(uint256 _marketId) external view returns (Market memory) {
        return _getStorage().markets[_marketId];
    }

    /**
     * @inheritdoc IMultiOutcomeMarket
     */
    function getExtendedMarket(uint256 _marketId) external view returns (ExtendedMarket memory) {
        ExtendedMarket memory extendedMarket;
        extendedMarket.market = _getStorage().markets[_marketId];
        extendedMarket.collateralAmounts = _getSupplies(_marketId);
        extendedMarket.outcomePrices = _getOutcomePrices(_marketId);
        return extendedMarket;
    }

    /**
     * @inheritdoc IMultiOutcomeMarket
     */
    function getOutcomePurchaseCost(uint256 _marketId, uint8 _outcome, uint256 _amount)
        external
        view
        returns (uint256)
    {
        return _calculatePurchaseCost(_marketId, _outcome, _amount);
    }

    /**
     * @inheritdoc IMultiOutcomeMarket
     */
    function getOutcomeSaleReturn(uint256 _marketId, uint8 _outcome, uint256 _amount) external view returns (uint256) {
        return _calculateSaleReturn(_marketId, _outcome, _amount);
    }

    /**
     * @inheritdoc IMultiOutcomeMarket
     */
    function getMarketOutcomeTokenIndex(uint256 marketId, uint8 outcome) public view returns (uint256) {
        return _getStorage().markets[marketId].outcomeTokenStartIndex + outcome;
    }

    /**
     * @inheritdoc IMultiOutcomeMarket
     */
    function getMarketOutcomeTokenAmount(uint256 marketId, uint8 outcome) external view returns (uint256) {
        return xOutcomes.totalSupply(getMarketOutcomeTokenIndex(marketId, outcome));
    }

    /**
     * @inheritdoc IMultiOutcomeMarket
     */
    function getMarketCollateral(uint256 marketId) external view returns (uint256) {
        return _getStorage().markets[marketId].collateralAmount;
    }

    /**
     * @inheritdoc IMultiOutcomeMarket
     */
    function isMarketResolved(uint256 marketId) external view returns (bool) {
        return _getStorage().markets[marketId].resolvedAt != 0;
    }

    /**
     * @inheritdoc IMultiOutcomeMarket
     */
    function getRedeemableAmount(uint256 marketId, uint256 amount) external view returns (uint256) {
        return _getRedeemableAmount(marketId, amount);
    }

    /**
     * @inheritdoc IMultiOutcomeMarket
     */
    function setCollateralTokenAllowed(address token, bool allowed) external {
        _getStorage().allowedCollateralTokens[token].isAllowed = allowed;
        emit CollateralTokenAllowed(token, allowed);
    }

    /**
     * @inheritdoc IMultiOutcomeMarket
     */
    function getCollateralTokenAllowed(address token) external view returns (bool) {
        return _getStorage().allowedCollateralTokens[token].isAllowed;
    }

    /**
     * @inheritdoc IMultiOutcomeMarket
     */
    function setMinimumInitialCollateral(uint256 amount) external {
        _getStorage().minimumInitialCollateral = amount;
        emit MinimumInitialCollateralSet(amount);
    }

    /**
     * @inheritdoc IMultiOutcomeMarket
     */
    function getMinimumInitialCollateral() external view returns (uint256) {
        return _getStorage().minimumInitialCollateral;
    }

    /**
     * @inheritdoc IMultiOutcomeMarket
     */
    function setProtocolFee(uint256 feeBps) external {
        _getStorage().protocolFeeBps = feeBps;
        emit ProtocolFeeSet(feeBps);
    }

    /**
     * @inheritdoc IMultiOutcomeMarket
     */
    function getProtocolFee() external view returns (uint256) {
        return _getStorage().protocolFeeBps;
    }

    /**
     * @inheritdoc IMultiOutcomeMarket
     */
    function setInsuranceAddress(address insuranceAddress) external {
        _getStorage().insuranceAddress = insuranceAddress;
        emit InsuranceAddressSet(insuranceAddress);
    }

    /**
     * @inheritdoc IMultiOutcomeMarket
     */
    function getInsuranceAddress() external view returns (address) {
        return _getStorage().insuranceAddress;
    }
}
