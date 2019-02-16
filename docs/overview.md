# patreon
## Contracts
### `Patreon.sol`
#### Requirements
* `var creators[]`
* `function newConsumer (title, msg.sender)`
* `function newCreator (title, description, msg.sender)`
* `function getCreators ()`
### `Consumer.sol`
#### Requirements
* `var owner`
* `string title`
* `var creators[]`
* `mapping creator address > struct (amount + timestamp exp.)`
* `function getSubscriptionExpiration (creator address)`
* `function createSubscription (creator address, amount)`
#### Additional Features
* `string avatar` (IPFS CID)
* `string description`
* `function getSubscriptions ()`
* `function modifySubscription (creator address, amount = 0)`
> renewing and changing amount, or cancelling
### `Creator.sol`
#### Requirements
* `var owner`
* `var posts[]` (IPFS CIDs)
* `string title`
* `string description`
* `function post (title, description, cid)`
* `function withdraw (amount, msg.sender)`
* `function getPosts (timestamp, msg.sender)`
#### `function pay ()`
* transfer money from consumer to creator
* add msg.sender to consumers array
* map expiration timestamp to sender address
* `consumerToExpiration[msg.sender] = timestamp` 
#### `function getPosts (timestamp, msg.sender)`
* `expiration = consumerToExpiration[msg.sender]`
* compare `expiration` value from mapping to param `timestamp` (date now)
* return posts if `expiration > timestamp`
#### Additional Features
* `var avatar` (IPFS CID)
## Client
### `NewConsumer.js`
* call `newConsumer` with `title`
* redirect to `Creators.js` on complete
### `NewCreator.js`
* call `newCreator` with `title`, `description`
* redirect to `Creator.js` on complete
### `Creators.js`
* call `getCreators`
* display list of creators
* redirect to `Creator.js` on click creator
### `Creator.js`
* call `getPosts`
* if address is owner; show post button
* if posts; display them
* else; display subscribe button
* handle subscription interaction
### `Post.js`
* form
* handle ipfs upload
* call `newPost` with `title`, `description`, `cid`
* redirect to `Creator.js` on complete