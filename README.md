# move-smart-contracts
Tool for the synthesis and verification of Move smart contracts

## Install Dependencies

Install the following: 
- NodeJS, 10.x
- MongoDB
- Git
- Java
- GCC
- https://nuxmv.fbk.eu/index.php?n=Download.Download
    - Note: If you are using the docker image to test locally, you MUST download the linux version
    - Extract the downloaded file and place the contents of the "bin" folder (nuXmv file) into the verificationTools folder in the project

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

## Using the Docker Image for Tests

To utilize the docker image to test locally: 

1. Create a directory structure at the root/home directory of your computer (different from the project folder) like the following: 

```
dockershare
--> blob-local-storage
--> db
```

2. Within the project folder run the following command to build the doker image: 

```
docker-compose build

# To run a clean re-build
docker-compose build --no-cache
```

3. To run the docker image run the following command: 
```
# Output of the server is displayed within the current terminal/command prompt directly 
docker-compose up

# Run it as a background process
docker-compose up -d
```

## License

This repository was built ontop of the [VeriSolid smart-contracts](https://github.com/anmavrid/smart-contracts) repository to create a similar interface and configuration set-up. We also made use of the [webgme-react-viz](https://github.com/pmeijer/webgme-react-viz) repository as a wrapper to set-up a visualizer as a react component. In terms of the verification process, VeriSolid's implementation is adapted for the Move language.

This project runs under the [MIT License](LICENSE).
