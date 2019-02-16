pragma solidity ^0.5.0;

contract User {
    struct Post {
        string title;
        string description;
        string ipfsCid;     // the ipfs generated hash for the post content
    }

    // address of the creator of the user account
    address payable private owner;

    // array of users that this user is subscribed to
    address[] public subscriptions;

    // Name or title of this user
    string public title;

    // short description of the user
    string public description;

    // Array of this user's published posts
    Post[] public posts;

    // map address of subscribed-to-user to expiration date timestamp
    // expiration date shows when the user's subscription is due/has expired and needs to be renewed
    mapping(address => uint) public subscriptionToExpiration;

    // Logs when a subscription has been payed
    event LogSubscriptionPayed(address indexed _subscribeToAddress, uint256 indexed amount, uint256 expiration);

    // Logs when the user submits a post
    event LogPostSubmitted(string indexed title, string indexed ipfsCid);

    // Logs when a user has withdrawn their payments
    event LogFundsWithdrawn(address indexed owner, uint256 amount);

    /// @dev initialize the User's contract ownership and information
    /// @param _title The name or title of the user
    /// @param _description short description of the user
    constructor (address payable _owner, string memory _title, string memory _description) public {
        owner = _owner;
        title = _title;
        description = _description;
    }

    /// @dev Create a subscription by sending one month's payment to the creator and setting a 30 day expiration date
    /// @param _subscribeToAddress The address that the user wants to subscribe to
    function createSubscription (address payable _subscribeToAddress) public payable {
        require(
            msg.sender == owner,
            "Unauthorized sender."
        );
        require(
            msg.value <= msg.sender.balance,
            "Insufficient funds."
        );
        require(
            _subscribeToAddress != address(0),
            "Invalid subscribe address."
        );
        
        // add the creator's address to the list of subscriptions
        subscriptions.push(_subscribeToAddress);

        // Set the subscription's expiration date to 30 days from now
        subscriptionToExpiration[_subscribeToAddress] = block.timestamp + 30 days;
        
        // Transfer the subscription payment to the creator
        _subscribeToAddress.transfer(msg.value);

        emit LogSubscriptionPayed(_subscribeToAddress,msg.value,subscriptionToExpiration[_subscribeToAddress]);
    }

    /// @dev Function for a user to create a blog post
    /// @param _title The title of the post
    /// @param _description Description of the post
    /// @param _ipfsCid The hash of the post content on IPFS
    function createPost (string memory _title, string memory _description, string memory _ipfsCid) public {
        require(
            msg.sender == owner,
            "Unauthorized sender."
        );
        bytes memory tempEmptyStringTest = bytes(_title);
        require(
            tempEmptyStringTest.length != 0,
            "Empty Title."
        );

        // Add the post metadata to the array of posts by this user
        posts.push(Post(_title, _description, _ipfsCid));

        emit LogPostSubmitted(_title, _ipfsCid);
    }

    /// @dev Allows a user to withdraw funds that have been sent to them via subscriptions
    /// @param _withdrawalAmount The amount the owner would like to withdraw
    function withdraw (uint _withdrawalAmount) public {
        require(
            msg.sender == owner,
            "Unauthorized sender."
        );
        require(
            _withdrawalAmount <= address(this).balance,
            "Insufficient funds."
        );
        owner.transfer(_withdrawalAmount);

        emit LogFundsWithdrawn(msg.sender, _withdrawalAmount);
    }

    /// @dev Returns the expiration date of a user's subscription
    /// @param _subscribedAddress The user's address who this user is subscribed to
    /// @return uint The UNIX timestamp when the subscription will expire
    function getSubscriptionExpiration (address _subscribedAddress) public view returns (uint) {
        require(
            msg.sender == owner,
            "Unauthorized sender."
        );
        require(
            _subscribedAddress != address(0),
            "Invalid subscribed address."
        );
        return subscriptionToExpiration[_subscribedAddress];
    }

    /// @dev Get the number of posts that the user has submitted
    /// @return uint
    function getPostCount () public view returns (uint) {
        return posts.length;
    }

    /// @dev Return the metadata for a user's post
    /// @param _index The array index for the post to return
    /// @return Strings for the title, description, and IPDS content hash
    function getPost (uint _index) public view returns (string memory, string memory, string memory) {
        Post memory p = posts[_index];
        return (p.title, p.description, p.ipfsCid);
    }

    /// @dev Get metadata about the user
    /// @return strings for the users title and description
    function getInfo () public view returns (string memory, string memory) {
        return (title, description);
    }

    /// @dev check if sender is owner of contract
    function isOwner () public view returns (bool) {
        return msg.sender == owner;
    }

    function() external payable { }
}
