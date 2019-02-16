pragma solidity ^0.5.0;
import "zos-lib/contracts/Initializable.sol";
import "./User.sol";

contract Fundem is Initializable {
    address private owner;
    address[] public users;
    mapping(address => address) public userToContract;

    // Logs when a user has been created
    event LogUserCreated(address indexed owner, address indexed userAddress);

    function initialize () initializer public {
        owner = msg.sender;
    }

    function createUser (string memory _title, string memory _description) public {
        User newUserContract = new User(msg.sender, _title, _description);
        userToContract[msg.sender] = address(newUserContract);
        users.push(address(newUserContract));
        emit LogUserCreated(msg.sender,address(newUserContract));
    }

    function getUserCount () public view returns (uint) {
        return users.length;
    }

    function getUserAddress (uint _index) public view returns (address) {
        return users[_index];
    }

    function getUserContractAddress () public view returns (address) {
        return userToContract[msg.sender];
    }
}
