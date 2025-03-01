// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// contract OutcomeToken is ERC20 {
//     address public market;

//     constructor(string memory name, string memory symbol) ERC20(name, symbol) {
//         market = msg.sender;
//     }

//     function mint(address to, uint256 amount) external {
//         require(msg.sender == market, "Only market can mint");
//         _mint(to, amount);
//     }

//     function burn(address from, uint256 amount) external {
//         require(msg.sender == market, "Only market can burn");
//         _burn(from, amount);
//     }
// }
