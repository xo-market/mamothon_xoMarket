// // SPDX-License-Identifier: UNLICENSED
// pragma solidity ^0.8.13;

// import {Test, console} from "forge-std/Test.sol";
// import {LMSRMarket} from "../src/LMSRMarket.sol";
// import {CollateralToken} from "../src/CollateralToken.sol";
// import "@openzeppelin/contracts/utils/Strings.sol";

// contract LMSRMarketTest is Test {
//     LMSRMarket public market;
//     CollateralToken public collateralToken;
//        struct Trade {
//             bool tradeType; // true for Yes, false for No
//             uint256 amount;
//         }

//     function setUp() public {
//         collateralToken = new CollateralToken("Collateral", "COLL");
//         market = new LMSRMarket(address(collateralToken), 700 * 1E18);
//     }

//     function test_MarketInitialization() public {
//         assertEq(address(market.collateralToken()), address(collateralToken));
//         assertEq(market.b(), 700 * 1E18);
//     }

//     function test_MarketInitializationWithCollateral() public {
//         collateralToken.mint(address(this), 1000 * 1E18);
//         market.initializeMarket(1000 * 1E18);
//         assertEq(collateralToken.balanceOf(address(market)), 1000 * 1E18);
//         assertEq(market.totalYes(), 500 * 1E18);
//         assertEq(market.totalNo(), 500 * 1E18);
//     }

//     function test_BuyOutcome() public {
//         collateralToken.mint(address(this), 10000000000 * 1E18);
//         market.initializeMarket(10 * 1E18);

//         // Trade[100] memory trades;
//         // uint256 biasThreshold = 70; // After 70 trades, favor Yes outcome

//         // for (uint256 i = 0; i < 100; i++) {
//         //     if (i < biasThreshold) {
//         //         trades[i] = Trade(i % 2 == 0, ((i % 10) + 1) * 100 * 1e18);
//         //     } else {
//         //         trades[i] = Trade(true, ((i % 5) + 5) * 200 * 1e18); // Increase Yes dominance
//         //     }
//         // }

//         Trade[100] memory trades;
//         uint256 biasThreshold = 70; // After 70 trades, favor Yes outcome

//         // Create a JSON string to log trades
//         string memory json = "{ \"trades\": [";

//         for (uint256 i = 0; i < 100; i++) {
//             if (i < biasThreshold) {
//                 trades[i] = Trade(i % 2 == 0, ((i % 10) + 1) * 100 * 1e18);
//             } else {
//                 trades[i] = Trade(true, ((i % 5) + 5) * 200 * 1e18); // Increase Yes dominance
//             }
//             json = string(abi.encodePacked(json, "{\"tradeType\":", trades[i].tradeType ? "true" : "false", ", \"amount\":", Strings.toString(trades[i].amount), "}"));
//             if (i < 99) json = string(abi.encodePacked(json, ","));
//         }

//         json = string(abi.encodePacked(json, "] }"));

//         // Write JSON to file
//         vm.writeJson(json, "./trade_data.json");

//         for (uint256 i = 0; i < trades.length; i++) {
//             console.log("Buy", trades[i].tradeType, trades[i].amount / 1E18);
//             market.buyOutcome(trades[i].tradeType, trades[i].amount);

//             console.log("totalYes", market.totalYes() / 1E18);
//             console.log("totalNo", market.totalNo() / 1E18);
//             (uint256 yesPrice, uint256 noPrice) = market.getLatestPrices();
//             console.log("yesPrice", yesPrice / 1E13);
//             console.log("noPrice", noPrice / 1E13);
//         }

//     //     console.log("totalYes", market.totalYes());
//     //     console.log("totalNo", market.totalNo());

//     //     (uint256 yesPrice, uint256 noPrice) = market.getLatestPrices();
//     //     console.log("yesPrice", yesPrice);
//     //     console.log("noPrice", noPrice);

//     //     market.buyOutcome(true, 100 * 1E18);

//     //    console.log("totalYes", market.totalYes());
//     //     console.log("totalNo", market.totalNo());
//     //     (yesPrice, noPrice) = market.getLatestPrices();
//     //     console.log("yesPrice", yesPrice);
//     //     console.log("noPrice", noPrice);

//     //     market.buyOutcome(true, 100 * 1E18);

//     //    console.log("totalYes", market.totalYes());
//     //     console.log("totalNo", market.totalNo());
//     //     (yesPrice, noPrice) = market.getLatestPrices();
//     //     console.log("yesPrice", yesPrice);
//     //     console.log("noPrice", noPrice);

//     //     market.buyOutcome(false, 100 * 1E18);

//     //    console.log("totalYes", market.totalYes());
//     //     console.log("totalNo", market.totalNo());
//     //     (yesPrice, noPrice) = market.getLatestPrices();
//     //     console.log("yesPrice", yesPrice);
//     //     console.log("noPrice", noPrice);

//     //     market.buyOutcome(false, 250 * 1E18);

//     //    console.log("totalYes", market.totalYes());
//     //     console.log("totalNo", market.totalNo());
//     //     (yesPrice, noPrice) = market.getLatestPrices();
//     //     console.log("yesPrice", yesPrice);
//     //     console.log("noPrice", noPrice);

//     //     market.buyOutcome(false, 250 * 1E18);

//     //    console.log("totalYes", market.totalYes());
//     //     console.log("totalNo", market.totalNo());
//     //     (yesPrice, noPrice) = market.getLatestPrices();
//     //     console.log("yesPrice", yesPrice);
//     //     console.log("noPrice", noPrice);

//     //     market.buyOutcome(true, 500 * 1E18);

//     //    console.log("totalYes", market.totalYes());
//     //     console.log("totalNo", market.totalNo());
//     //     (yesPrice, noPrice) = market.getLatestPrices();
//     //     console.log("yesPrice", yesPrice);
//     //     console.log("noPrice", noPrice);

//     //     market.buyOutcome(true, 3000 * 1E18);

//     //     console.log("totalYes", market.totalYes());
//     //     console.log("totalNo", market.totalNo());
//     //     (yesPrice, noPrice) = market.getLatestPrices();
//     //     console.log("yesPrice", yesPrice);
//     //     console.log("noPrice", noPrice);

//         console.log("collateralToken.balanceOf(address(market))", collateralToken.balanceOf(address(market)));
//         // assertEq(market.totalYes(), 600);
//         // assertEq(market.totalNo(), 500);
//     }
// }
