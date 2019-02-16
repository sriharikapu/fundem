# fundem
> A decentralized platform for funding creators and artists you love.

## setup
* clone
* `npm install -g truffle@5.0.2 && npm install -g ganache-cli@6.3.0`
* `cd fundem && npm install`
## zos instructions
> Global install does NOT work for me. Use the locally installed module with `npx`
* `ganache-cli --secure -u 0 -u 1 -u 2 --deterministic`
* `npx zos session --network development --from 0x1df62f291b2e969fb0849d99d9ce41e2f137006e`
* `npx zos add Fundem User`
* `npx zos push --network development`
* `npx zos create Fundem --init initialize --network development`
* (when upgrading) `npx zos update Fundem User --network development`
## client instructions
* `npm start`
## todo
### contracts
* fix `createSubscription ()` -- it errors out, definitely did it wrong
* test `getSubscriptionExpiration ()` -- it might work -- can't tell without `createSubscription ()`
* make `User.sol` upgradable if possible
### ipfs
* file uploads
### client
* hide/show create post based on owner
* upload to ipfs functionaliy
* style everything lol
* DRY `userInstance` stuff and save current user instance in state
* time permitting; ux bounties