pragma solidity ^0.5.0;
import "zos-lib/contracts/Initializable.sol";

contract User is Initializable {
    struct Post {
        string title;
        string description;
        string ipfsCid;
    }

    address payable private owner;
    address[] public subscriptions;
    string public title;
    string public description;
    Post[] public posts;

    // map address of subscribed-to-user to expiration date timestamp
    mapping(address => uint) public subscriptionToExpiration;

    function initialize (string memory _title, string memory _description) initializer public {
        owner = msg.sender;
        title = _title;
        description = _description;
    }

    function createSubscription (address payable _subscribeToAddress) public payable {
        require(
            msg.sender == owner,
            "Unauthorized sender."
        );
        require(
            msg.value <= msg.sender.balance,
            "Insufficient funds."
        );
        _subscribeToAddress.transfer(msg.value);
        subscriptions.push(_subscribeToAddress);
        subscriptionToExpiration[_subscribeToAddress] = block.timestamp + 30 days;
    }

    function createPost (string memory _title, string memory _description, string memory _ipfsCid) public {
        require(
            msg.sender == owner,
            "Unauthorized sender."
        );
        posts.push(Post(_title, _description, _ipfsCid));
    }

    function withdraw (uint _withdrawalAmount) public {
        require(
            msg.sender == owner,
            "Unauthorized sender."
        );
        require(
            msg.sender == owner && _withdrawalAmount <= address(this).balance,
            "Insufficient funds."
        );
        owner.transfer(_withdrawalAmount);
    }

    function getSubscriptionExpiration (address _subscribedAddress) public view returns (uint) {
        require(
            msg.sender == owner,
            "Unauthorized sender."
        );
        return subscriptionToExpiration[_subscribedAddress];
    }

    function getPostCount () public view returns (uint) {
        return posts.length;
    }

    function getPost (uint _index) public view returns (string memory, string memory, string memory) {
        Post memory p = posts[_index];
        return (p.title, p.description, p.ipfsCid);
    }

    function getInfo () public view returns (string memory, string memory) {
        return (title, description);
    }
}
