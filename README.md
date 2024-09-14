

# Serverless Framework Node HTTP API on AWS

This template demonstrates how to make a simple HTTP API with Node.js running on AWS Lambda and API Gateway and DynamoDB using the Serverless Framework.


## Usage
### Getting Started
```bash
npm install
```
```bash
tsc -w
```
### Run Project Locally
```bash
serverless offline
```
with install and open Docker 

### Deployment

In order to deploy this project on serverless framework dashbord and AWS , you need to run the following command:

```bash
serverless deploy
```

After running deploy, you should see output similar to:

```
Deploying "serverless-http-api" to stage "dev" (us-east-2)
✔ Service deployed to stack serverless-http-api-dev (
endpoint: GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/

```



