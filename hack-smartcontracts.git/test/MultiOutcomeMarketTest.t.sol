// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/MultiOutcomeMarket.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/manager/AccessManager.sol";
import { CollateralTokenMock } from "../src/tokens/CollateralTokenMock.sol";
import { MultiOutcomeMarket } from "../src/MultiOutcomeMarket.sol";
import { Market } from "../src/structs/MarketStructs.sol";

import { XOMarket } from "../src/tokens/XOMarket.sol";
import { XOutcome } from "../src/tokens/XOutcome.sol";

contract MultiOutcomeMarketTest is Test {
    MultiOutcomeMarket public market;
    AccessManager public accessControl;
    CollateralTokenMock public collateralToken;
    address public owner;
    address public user1;
    address public user2;
    address public resolver;
    uint256 constant MINIMUM_INITIAL_COLLATERAL = 1e18;
    uint256 constant PROTOCOL_FEE_BPS = 100; // 1%
    address constant INSURANCE_ADDRESS = address(1245);
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant RESOLVER_ROLE = keccak256("RESOLVER_ROLE");
    string constant URI = "https://example.com/api/item/{id}.json";
    XOMarket public xoMarket;
    XOutcome public xoOutcome;
    uint256 constant RESOLUTION_PERIOD = 24 hours;

    function setUp() public {
        owner = address(this);
        user1 = address(0x123);
        user2 = address(0x456);
        resolver = address(0x789);

        // Deploy AccessManager
        accessControl = new AccessManager(owner);

        // Deploy a mock ERC20 token for testing
        collateralToken = new CollateralTokenMock("Collateral Token", "CT");
        xoMarket = new XOMarket();
        xoOutcome = new XOutcome(URI);

        // Deploy the market contract
        address[] memory allowedTokens = new address[](1);
        allowedTokens[0] = address(collateralToken);
        market = new MultiOutcomeMarket(
            address(accessControl),
            address(xoMarket),
            address(xoOutcome),
            MINIMUM_INITIAL_COLLATERAL,
            PROTOCOL_FEE_BPS,
            INSURANCE_ADDRESS,
            allowedTokens
        );

        // Set market resolver as public
        vm.prank(owner);
        market.setMarketResolver(resolver, true);
    }

    function testCreateMarket(uint8 outcomeCount) public {
        uint40 startsAt = uint40(block.timestamp + 1 days);
        uint40 expiresAt = uint40(startsAt + 1 weeks);
        uint256 initialCollateral = 2 * MINIMUM_INITIAL_COLLATERAL;
        uint16 creatorFeeBps = 500; // 5%
        string memory metaDataURI = "https://example.com/market/1";

        // Mint tokens to user1 for initial collateral
        collateralToken.mint(user1, initialCollateral);

        // Approve the market contract to spend user1's tokens
        vm.prank(user1);
        collateralToken.approve(address(market), initialCollateral);

        // Create the market
        vm.prank(user1);
        market.createMarket(
            startsAt,
            expiresAt,
            address(collateralToken),
            initialCollateral,
            creatorFeeBps,
            outcomeCount,
            resolver,
            metaDataURI
        );

        // Approve the market
        vm.prank(resolver);
        market.reviewMarket(1, true, "");

        // Check market details
        Market memory marketState = market.getMarket(1);

        assertEq(marketState.id, 1, "Market ID mismatch");
        assertEq(marketState.expiresAt, expiresAt, "Expiry mismatch");
        assertEq(marketState.createdAt, block.timestamp, "Creation time mismatch");
        assertEq(uint8(marketState.status), uint8(MarketStatus.ACTIVE), "Market should be active");
        address creator = xoMarket.ownerOf(1);
        assertEq(creator, user1, "Creator mismatch");
        assertEq(marketState.creatorFeeBps, creatorFeeBps, "Creator fee BPS mismatch");
        assertEq(marketState.outcomeCount, outcomeCount, "Outcome count mismatch");
        assertEq(marketState.collateralToken, address(collateralToken), "Collateral token mismatch");
        assertEq(marketState.collateralAmount, initialCollateral, "Collateral amount mismatch");

        uint256 nftBalance = xoMarket.balanceOf(user1);
        assertEq(nftBalance, 1, "NFT balance mismatch");
    }

    function testResolveMarket() public {
        // Create and approve market
        testCreateMarket(3);

        // Fast forward to after expiresAt
        vm.warp(block.timestamp + 1 weeks + 1 days);

        // Resolve the market
        vm.prank(resolver);
        market.resolveMarket(1, 1);

        // Check market details
        Market memory marketState = market.getMarket(1);
        assertEq(uint8(marketState.status), uint8(MarketStatus.RESOLVED), "Market should be resolved");
        assertEq(marketState.winningOutcome, 1, "Winning outcome mismatch");
        assertEq(marketState.resolvedAt, block.timestamp, "Resolved at mismatch");
    }

    function testBuyOutcomeTokens() public {
        // Create and approve market
        testCreateMarket(3);

        uint256 amountToBuy = 1e18;
        uint256 cost = market.getOutcomePurchaseCost(1, 1, amountToBuy);

        // Mint tokens to user2 for buying
        collateralToken.mint(user2, cost);

        uint256 totalSupply = xoOutcome.totalSupply(market.getMarketOutcomeTokenIndex(1, 1));

        // Approve the market contract to spend user2's tokens
        vm.prank(user2);
        collateralToken.approve(address(market), cost);

        // Buy outcome tokens
        vm.prank(user2);
        market.buy(1, 1, amountToBuy, cost);

        // Check token balances
        assertEq(market.getMarketOutcomeTokenAmount(1, 1), totalSupply + amountToBuy, "Outcome token balance mismatch");
        assertGt(
            collateralToken.balanceOf(address(market)),
            2 * MINIMUM_INITIAL_COLLATERAL,
            "Market collateral balance mismatch"
        );
    }

    function testSellOutcomeTokens() public {
        // Assume outcome tokens are bought
        testBuyOutcomeTokens();

        uint256 amountToSell = 5e17;
        uint256 received = market.getOutcomeSaleReturn(1, 1, amountToSell);

        // Sell outcome tokens
        vm.prank(user2);
        market.sell(1, 1, amountToSell, received);

        uint256 userBalance = xoOutcome.balanceOf(user2, market.getMarketOutcomeTokenIndex(1, 1));
        // Check token balances
        assertEq(userBalance, 1e18 - amountToSell, "Outcome token balance mismatch");
        assertEq(collateralToken.balanceOf(user2), received, "User collateral balance mismatch");
    }

    function testRedeemCollateral() public {
        // Assume outcome tokens are bought
        testBuyOutcomeTokens();

        // Fast forward to after expiresAt
        vm.warp(block.timestamp + 1 weeks + 1 days);

        // Resolve the market
        vm.prank(resolver);
        market.resolveMarket(1, 2);

        uint256 redeemableAmount = market.getRedeemableAmount(1, 1e18);
        // Redeem collateral
        vm.prank(user2);
        market.redeem(1);

        uint256 userBalance = xoOutcome.balanceOf(user2, market.getMarketOutcomeTokenIndex(1, 1));

        // Check token balances
        assertEq(userBalance, 0, "Outcome token balance should be 0");
        assertEq(collateralToken.balanceOf(user2), redeemableAmount, "User collateral balance mismatch");
    }

    function testGetPrice() public {
        // Assume a market is created
        testCreateMarket(2);

        uint256 price = market.getPrice(1, 1);
        assertApproxEqRel(price, 5e17, 1, "Incorrect price"); // 50%, with tolerance
    }

    function testSetCollateralTokenAllowed() public {
        CollateralTokenMock newToken = new CollateralTokenMock("New Token", "NT");

        vm.prank(owner);
        market.setCollateralTokenAllowed(address(newToken), true);

        assertEq(market.getCollateralTokenAllowed(address(newToken)), true, "Collateral token not allowed");
    }

    function testSetMinimumInitialCollateral() public {
        uint256 newMinimum = 5e18;
        vm.prank(owner);
        market.setMinimumInitialCollateral(newMinimum);

        assertEq(market.getMinimumInitialCollateral(), newMinimum, "Minimum initial collateral not set");
    }

    function testSetProtocolFee() public {
        uint256 newFeeBps = 200;
        vm.prank(owner);
        market.setProtocolFee(newFeeBps);

        assertEq(market.getProtocolFee(), newFeeBps, "Protocol fee not set");
    }

    function testSetInsuranceAddress() public {
        address newInsuranceAddress = address(0x4);
        vm.prank(owner);
        market.setInsuranceAddress(newInsuranceAddress);

        assertEq(market.getInsuranceAddress(), newInsuranceAddress, "Insurance address not set");
    }

    function testRevertOnMarketNotExists() public {
        vm.expectRevert("Market does not exist");
        market.resolveMarket(999, 1);
    }

    function testRevertOnMarketAlreadyResolved() public {
        testResolveMarket();
        vm.expectRevert("Market already resolved");
        vm.prank(resolver);
        market.resolveMarket(1, 1);
    }

    function testRevertOnMarketNotExpired() public {
        testCreateMarket(2);
        vm.expectRevert("Market not expired");
        vm.prank(resolver);
        market.resolveMarket(1, 1);
    }

    function testRevertOnInsufficientCollateralBalance() public {
        uint40 startsAt = uint40(block.timestamp + 1 days);
        uint40 expiresAt = uint40(startsAt + 1 weeks);
        uint256 initialCollateral = 2 * MINIMUM_INITIAL_COLLATERAL;
        uint16 creatorFeeBps = 500; // 5%
        uint8 outcomeCount = 3;
        string memory metaDataURI = "https://example.com/market/1";

        vm.expectRevert("Insufficient collateral balance");
        vm.prank(user1);
        market.createMarket(
            startsAt,
            expiresAt,
            address(collateralToken),
            initialCollateral,
            creatorFeeBps,
            outcomeCount,
            resolver,
            metaDataURI
        );
    }

    function testRevertOnCostExceedsMaximum() public {
        testCreateMarket(2);
        uint256 amountToBuy = 1e18;
        uint256 cost = market.getOutcomePurchaseCost(1, 1, amountToBuy);

        collateralToken.mint(user2, cost - 1);
        vm.prank(user2);
        collateralToken.approve(address(market), cost - 1);

        vm.expectRevert("Cost exceeds maximum");
        vm.prank(user2);
        market.buy(1, 1, amountToBuy, cost - 1);
    }

    function testRevertOnReturnBelowMinimum() public {
        testBuyOutcomeTokens();
        uint256 amountToSell = 1e17;
        uint256 received = market.getOutcomeSaleReturn(1, 1, amountToSell);

        vm.expectRevert("Return below minimum");
        vm.prank(user2);
        market.sell(1, 1, amountToSell, received + 1);
    }

    function testRevertOnNoWinningTokensToRedeem() public {
        testResolveMarket();
        vm.expectRevert("No winning tokens to redeem");
        vm.prank(user2);
        market.redeem(1);
    }

    function testRedeemDefaultedMarket() public {
        // Create market and buy outcome tokens
        testBuyOutcomeTokens();

        // Fast forward past expiry and resolution period
        vm.warp(block.timestamp + 1 weeks + RESOLUTION_PERIOD + 1 days + 100);

        // Get initial balances
        uint256 initialBalance = collateralToken.balanceOf(user2);
        uint256 marketCollateral = market.getMarketCollateral(1);

        // Redeem tokens from defaulted market
        vm.prank(user2);
        market.redeemDefaultedMarket(1);

        // Check that user received their share of collateral
        uint256 finalBalance = collateralToken.balanceOf(user2);
        assertGt(finalBalance, initialBalance, "User should receive collateral");

        // Check that market's collateral was reduced
        uint256 finalMarketCollateral = market.getMarketCollateral(1);
        assertLt(finalMarketCollateral, marketCollateral, "Market collateral should decrease");
    }

    function testRevertOnRedeemDefaultedMarketTooEarly() public {
        // Create market and buy outcome tokens
        testBuyOutcomeTokens();
        // Fast forward to just before default period
        vm.warp(block.timestamp + 1 weeks + RESOLUTION_PERIOD - 500);

        // Attempt to redeem from non-defaulted market should fail
        vm.expectRevert("Market not defaulted");
        vm.prank(user2);
        market.redeemDefaultedMarket(1);
    }

    function testRedeemDefaultedMarketMultipleOutcomes() public {
        // Create market with 3 outcomes
        testCreateMarket(3);

        uint256 amountToBuy = 1e18;

        // Buy tokens for outcome 1
        uint256 cost1 = market.getOutcomePurchaseCost(1, 1, amountToBuy);
        collateralToken.mint(user2, cost1);
        vm.prank(user2);
        collateralToken.approve(address(market), cost1);
        vm.prank(user2);
        market.buy(1, 1, amountToBuy, cost1);

        // Buy tokens for outcome 2
        uint256 cost2 = market.getOutcomePurchaseCost(1, 2, amountToBuy);
        collateralToken.mint(user2, cost2);
        vm.prank(user2);
        collateralToken.approve(address(market), cost2);
        vm.prank(user2);
        market.buy(1, 2, amountToBuy, cost2);

        // Fast forward past expiry and resolution period
        vm.warp(block.timestamp + 1 weeks + RESOLUTION_PERIOD + 1 days + 100);

        uint256 initialBalance = collateralToken.balanceOf(user2);

        // Redeem tokens from defaulted market
        vm.prank(user2);
        market.redeemDefaultedMarket(1);

        // Check that user received their share of collateral
        uint256 finalBalance = collateralToken.balanceOf(user2);
        assertGt(finalBalance, initialBalance, "User should receive collateral");

        // Check that outcome tokens were burned
        assertEq(
            xoOutcome.balanceOf(user2, market.getMarketOutcomeTokenIndex(1, 1)), 0, "Outcome 1 tokens should be burned"
        );
        assertEq(
            xoOutcome.balanceOf(user2, market.getMarketOutcomeTokenIndex(1, 2)), 0, "Outcome 2 tokens should be burned"
        );
    }

    function testMarketApprovalProcess() public {
        // Create market
        uint40 startsAt = uint40(block.timestamp + 1 days);
        uint40 expiresAt = uint40(startsAt + 1 weeks);

        collateralToken.mint(user1, 2e18);
        vm.prank(user1);
        collateralToken.approve(address(market), 2e18);

        vm.prank(user1);
        market.createMarket(startsAt, expiresAt, address(collateralToken), 2e18, 500, 3, resolver, "metadata");

        // Check market is pending
        Market memory m = market.getMarket(1);
        assertEq(uint256(m.status), uint256(MarketStatus.PENDING), "Should be pending");

        // Approve market
        vm.prank(resolver);
        market.reviewMarket(1, true, "");

        m = market.getMarket(1);
        assertEq(uint256(m.status), uint256(MarketStatus.ACTIVE), "Should be active");
    }
}
