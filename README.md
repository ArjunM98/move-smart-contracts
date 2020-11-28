# move-smart-contracts
Tool for the synthesis and verification of Move smart contracts

## Install Dependencies

Install the following: 
- NodeJS
- MongoDB
- Git

## Local Development

1. Clone the repository: 
``` 
git clone https://github.com/fcpranav/move-smart-contracts.git
```

2. Install the necessary packages: 
```
cd move-smart-contracts
npm install
npm install webgme
```

3. Build React Scripts
```
npm run-script build
```

4. Start the local MongoDB: 
```
mkdir sc_data
mongod --dbpath ./sc_data
```

5. Start the application: 
```
npm start
```

6. Visit the application on: `http://127.0.0.1:8888/`


## License

This repository was built ontop of the [VeriSolid smart-contracts](https://github.com/anmavrid/smart-contracts) repository to create a similar interface and configuration set-up. We also made use of the [webgme-react-viz](https://github.com/pmeijer/webgme-react-viz) repository as a wrapper to set-up a visualizer as a react component.

This project runs under the [MIT License](LICENSE).