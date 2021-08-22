## XTA

A simple server that host a REST endpoint and a GraphQL endpoint for querying currency exchange rate

### How to run this server

- you'll need to have docker and docker-compose installed in your machine
- clone this repo
- replace the `FIXER_API_KEY` with the API key that you have
- _Note: Please make sure you have a paid subscription plan, or else you'll get `base_currency_access_restricted` error_
- spin up the server by

```shell
docker-compose -f docker-compose.yml up --build xta-server
```

- the server should be up and listening to port 3000
- you can make a test request with the following curl command

```shell
curl http://localhost:3000/exchange-rate?from=USD&to=HKD # for REST API

# for GraphQL query
curl --request POST \
  --url http://localhost:3000/graphql \
  --header 'Content-Type: application/json' \
  --data '{"query":"query GetExchangeRate($input: ExchangeRateQueryInput!) {\n  exchangeRate(input: $input) {\n    rate\n  }\n}","variables":{"input":{"from":"USD","to":"HKD"}}}'
```

### How to run test

- to run test in this project, first you need to manually start `mongo` and `redis` server by
```shell
yarn up-deps
```
- then run all the test with
```shell
yarn test
```


