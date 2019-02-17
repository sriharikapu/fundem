# fundem
> A decentralized platform for funding creators and artists you love.

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