// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { Script, console } from "forge-std/Script.sol";
import { MultiOutcomeMarket } from "../src/MultiOutcomeMarket.sol";
import { CollateralTokenMock } from "../src/tokens/CollateralTokenMock.sol";
import { AccessManager } from "@openzeppelin/contracts/access/manager/AccessManager.sol";
import { XOMarket } from "../src/tokens/XOMarket.sol";
import { XOutcome } from "../src/tokens/XOutcome.sol";

contract DeployMultiOutcomeMarket is Script {
    MultiOutcomeMarket public market;
    AccessManager public accessControl;
    CollateralTokenMock public collateralToken;
    uint256 constant MINIMUM_INITIAL_COLLATERAL = 1e18;
    uint256 constant PROTOCOL_FEE_BPS = 100; // 1%
    address constant INSURANCE_ADDRESS = address(0);
    string constant URI = "https://example.com/api/item/{id}.json";
    XOMarket public xoMarket;
    XOutcome public xoOutcome;

    function setUp() public { }

    function run() public {
        vm.startBroadcast();

        accessControl = new AccessManager(msg.sender);

        // Deploy a mock ERC20 token for testing
        collateralToken = new CollateralTokenMock("XO Collateral Token", "XOCT");
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

        console.log("Access Control deployed at:", address(accessControl));
        console.log("Market deployed at:", address(market));
        console.log("XO Market NFT deployed at:", address(xoMarket));
        console.log("XO Outcome NFT deployed at:", address(xoOutcome));
        console.log("XO Test Collateral Token deployed at:", address(collateralToken));

        vm.stopBroadcast();
    }
}
