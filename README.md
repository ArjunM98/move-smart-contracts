# move-smart-contracts
Tool for the synthesis and verification of Move smart contracts

## Install Dependencies

Install the following: 
- NodeJS, 14.x
- MongoDB
- Git

## Local Development

### Initial Setup

1. Clone the repository: 
``` 
git clone https://github.com/fcpranav/move-smart-contracts.git
```

2. Install the necessary packages: 
```
cd move-smart-contracts
npm install
```

3. Build React Scripts
```
npm run-script build
```

4. Start the local MongoDB server: 
```
mkdir sc_data
mongod --dbpath ./sc_data
```

5. Start the application: 
```
npm start
```

6. Visit the application on: `http://127.0.0.1:8888/`

### Changes

For any changes to take affect, you will need to repeat Step 3 and Step 5 from above.

### Testing

We write our tests using Mocha. You can run the tests using `npm test`.

## License

This repository was built ontop of the [VeriSolid smart-contracts](https://github.com/anmavrid/smart-contracts) repository to create a similar interface and configuration set-up. We also made use of the [webgme-react-viz](https://github.com/pmeijer/webgme-react-viz) repository as a wrapper to set-up a visualizer as a react component. In terms of the verification process, VeriSolid's implementation is adapted for the Move language.

This project runs under the [MIT License](LICENSE).
