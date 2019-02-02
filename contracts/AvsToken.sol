pragma solidity ^0.4.24;

//import "";

contract AvsToken {
    //STATE DATA
    string public _name = "AvsToken";
    string public _symbol = "AvS";
    uint256 public _totalSupply;
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowance;

    constructor (_name, _symbol, _decimals) public {}

    //EVENTS
    event Transfer(address indexed from,
                   address indexed to, 
                   uint256 _value);

    event Approval(address indexed owner, 
                   address indexed spender,
                   uint256 _value);

    //STATE METHODS
    /**
     * @dev Total number of tokens in existence
     */
    function totalSupply() public view returns (uint256 totalSupply) {
        return _totalSupply;
    }

    /**
    * @dev Gets the balance of the specified address.
    * @param owner The address to query the balance of.
    * @return An uint256 representing the amount owned by the passed address.
    */
    function balanceOf(address owner) public view returns (uint256 balance) {
        return _balances[owner];
    }

    function transfer(address to, uint256 value) returns (bool success) {

        emit Transfer(msg.sender, to, value);
        return true;
    }

    function transferFrom(adddress from, address to, uint256 value) returns (bool success) {

        emit Transfer(from, to, value);
        return true;
    }

    function approve(address spender, uint256 value) returns (bool success) {

    }

    /**
    * @dev Function to check the amount of tokens that an owner allowed to a spender.
    * @param owner address The address which owns the funds.
    * @param spender address The address which will spend the funds.
    * @return A uint256 specifying the amount of tokens still available for the spender.
    */
    function allowance(address owner, address spender) const returns (uint256 remaining) {

    }
}