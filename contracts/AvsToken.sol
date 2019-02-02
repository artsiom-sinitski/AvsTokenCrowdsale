pragma solidity ^0.4.24;

//import "";

contract AvsToken {
    //STATE DATA
    string public name = "AvsToken";
    string public symbol = "AvS";
    uint256 public totalSupply;

    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowed;

    constructor(uint256 _initialSupply) public {
        
        totalSupply = _initialSupply;
        //allocate initial supply
        balances[msg.sender] = _initialSupply;
    }

    //EVENTS
    event Transfer(address indexed _from,
                   address indexed _to, 
                   uint256 _value);

    event Approval(address indexed _owner, 
                   address indexed _spender,
                   uint256 _value);

    //STATE METHODS
    /**
     * @dev Total number of tokens in existence
     */
    function totalSupply() public view returns (uint256) {
        return totalSupply;
    }

    /**
    * @dev Gets the balance of the specified address.
    * @param _owner The address to query the balance of.
    * @return An uint256 representing the amount owned by the passed address.
    */
    function balanceOf(address _owner) public view returns (uint256) {
        return balances[_owner];
    }

    /**
    * @dev Transfer token for a specified address
    * @param _to The address to transfer to.
    * @param _value The amount to be transferred.
    */
    function transfer(address _to, uint256 _value) public returns (bool) {
        require(_to != address(0));
        require(balances[msg.sender] >= _value);
        balances[msg.sender] -= _value;
        balances[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    //TO DO:
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {

        emit Transfer(_from, _to, _value);
        return true;
    }

    //TO DO:
    function approve(address _spender, uint256 _value) public returns (bool) {
        return true;
    }

    /**
    * @dev Function to check the amount of tokens that an owner allowed to a spender.
    * @param _owner address The address which owns the funds.
    * @param _spender address The address which will spend the funds.
    * @return A uint256 specifying the amount of tokens still available for the spender.
    */
    function allowance(address _owner, address _spender) public view returns (uint256) {
        return allowed[_owner][_spender];
    }
}