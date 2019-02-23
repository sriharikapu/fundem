# fundem
> A decentralized platform for funding creators and artists you love.

### Authors
Dan Mowchan:
Joshua Hannan: hannanjoshua19@gmail.com

## Problem

Millions of content creators and artists around the world work hard to provide consumers with useful and engaging content every day.  Patreon is a service that has emerged in recent years that aims to help consumers support their favorite creators directly.  There are two issues with this service that we aim to solve with Fundem

* Patreon takes a cut of the payments.  This isn't necessarily a problem, but if a creator wants to get donations, they should have the option to choose a service that gives them the entire cut.
* Patreon is able to censor creators that they disagree with.  Patreon has recently been banning creators from their platform from being able to accept payments.  Creators should have a place where they can be compensated without fear of being silenced.

## Solution

Fundem provides content creators and their users with an easy way to create an account in the system, make blog posts with images, and set up a subscription with another user to be able to access subscriber only content.  The user creation, content posting, and subscription logic is managed by two upgradable smart contracts that are deployed on an Skale S-Chain for cheap and fast transactions.  Blog post content is stored in IPFS.

## setup
* clone
* `npm install -g truffle@5.0.2 && npm install -g ganache-cli@6.3.0`
* `cd fundem && npm install`
## zos instructions
> Global install does NOT work for me. Use the locally installed module with `npx`
* `ganache-cli --secure -u 0 -u 1 -u 2 --deterministic`
* `cd src`
* `npx zos session --network development --from 0x1df62f291b2e969fb0849d99d9ce41e2f137006e`
* `npx zos add Fundem User`
* `npx zos push --network development`
* `npx zos create Fundem --init initialize --network development`
* (when upgrading) `npx zos update Fundem User --network development`
## client instructions
* `npm start`

# Smart Contract Design
Fundem's on-chain logic consists of two smart contracts, User.sol and Fundem.sol.

### User.sol
User.sol provides the logic related to creating a user account, managing subscriptions, and working with blog posts.  Each user in the fundem application is represented by a different smart contract.  You can see the source code for the User contract for a more in depth explaination of the functionality.

### Fundem.sol
Fundem.sol provides the high level logic of deploying user contracts and keeping track of users in the system.  When a new user registers in the system, the function createUser is called and the Fundem smart contract deploys a new instance of the User smart contract and adds its address to the records of users


# ZeppelinOS Upgradable Smart Contracts
We have utilized ZeppelinOS to add upgradability features to our smart contracts.  If a bug is discovered or we would like to add new functionality to our system, we can upgrade our contracts to reflect the desired changes without requiring our users to go through much struggle.


# Skale S-Chain Deployment
We have decided to run our smart contracts on a Skale side chain.  The reason for this is that as more users are added to the system, lots of transactions will be created every day by the subscription micropayments and if we can offload them to a sidechain with near-instant finality, then it will make for a much better user experience.  The transactions on the sidechain are also essentially free, giving the users more control over their money and more peace of mind when interacting with our application.
