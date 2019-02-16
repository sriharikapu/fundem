# fundem overview
## Contracts
### `Fundem.sol`
#### Requirements
* `var users[]`
* `function createUser (title, description, msg.sender)`
* `function getUsers ()`
### `User.sol`
#### Requirements
* `var owner`
* `string title` (Account name)
* `string description` (Brief account description/introduction)
* `var subscribers[]` (User addresses)
* `var subscriptions[]` (User addresses)
* `var posts[]` (IPFS CIDs)
* `mapping subscriptionsToExpiration` (address > expiration timestamp)
* `function getSubscriptionExpiration (creator address)`
* `function createSubscriber (creator address, amount)`
* `function getPosts ()`
* `function createPost (title, description, ipfsCid)`
* `function widthdraw (amount, msg.sender)`
#### `function createSubscription ()`
* transfer money from subscriber to creator
* add creator address to subscriptions array
* map expiration timestamp to creator address
* `subscriptionsToExpiration[address creator] = timestamp` 
#### `function getPosts (timestamp, msg.sender)`
* `expiration = consumerToExpiration[msg.sender]`
* compare `expiration` value from mapping to param `timestamp` (date now)
* return posts if `expiration > timestamp`
#### Additional Features
* `string avatar` (IPFS CID)
* `function getSubscriptions ()`
* `function modifySubscription (creator address, amount = 0)`
## Client
### `CreateUser.js`
* call `createUser(title, description, msg.sender)`
* redirect to `Users.js` on complete
### `Users.js`
* call `getUsers()`
* call `getSubscriptions()`, store locally
* when user clicks on another user, redirect to `User.js`
### `User.js`
* call `getSubscriptionExpiration(address creator)`
* if subscription is still valid, call `getPosts()`, display posts chronologically
* fetch individual post data from IPFS
* if subscription is invalid or no subscription, show UI to subscribe
* on subscribe click, call `createSubscriber (address creator, amount)`
### `CreatePost.js`
* form UI: title, description, file upload
* upload to IPFS, get CID/hash of file
* call `createPost(title, description, ipfsCid)`
* redirect to `User.js` on completes