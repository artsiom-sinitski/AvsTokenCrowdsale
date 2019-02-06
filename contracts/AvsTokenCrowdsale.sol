pragma solidity ^0.4.24;

import "./AvsToken.sol";
import "./SafeMath.sol";

contract AvsTokenCrowdsale {
    using SafeMath for uint256;

    //STATE DATA
    address admin;
    AvsToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    //EVENTS
    event Sell(address indexed buyer, uint256 numberOfTokens);
    
    constructor(AvsToken _tokenContract, uint256 _tokenPrice) public {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        require(msg.value == SafeMath.mul(_numberOfTokens, tokenPrice));
        // Require a number of tokens is equal to tokens
        // require contract has enough tokens
        // req that transfer is successful
       
        tokensSold += _numberOfTokens;
        emit Sell(msg.sender, _numberOfTokens);
    }

}