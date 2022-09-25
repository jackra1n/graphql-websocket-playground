const WebSocket = require('ws');

const logger = (msg) => {
  const dateTime = new Date().toISOString().replace('T', ' ').replace('Z', '');
  console.log(`[ ${dateTime} ] ${msg}`);
}

const GQL = {
  CONNECTION_INIT: 'connection_init',
  CONNECTION_ACK: 'connection_ack',
  CONNECTION_ERROR: 'connection_error',
  CONNECTION_KEEP_ALIVE: 'ka',
  START: 'start',
  STOP: 'stop',
  CONNECTION_TERMINATE: 'connection_terminate',
  DATA: 'data',
  ERROR: 'error',
  COMPLETE: 'complete'
}

let ws_connection = new WebSocket("wss://www.digitec.ch/api/subscriptions", "graphql-ws");

let payload = {
  variables: {},
  extensions: {},
  operationName: "SUBSCRIBE_SOCIAL_SHOPPINGS",
  query: "subscription SUBSCRIBE_SOCIAL_SHOPPINGS {\n  socialShopping {\n    latestTransactionTimeStamp\n    items {\n      id\n      userName\n      cityName\n      dateTime\n      brandName\n      imageUrl\n      fullProductName\n      salesPrice {\n        amountIncl\n        amountExcl\n        currency\n        __typename\n      }\n      oAuthProviderName\n      targetUserName\n      quote\n      voteTypeId\n      productTypeName\n      socialShoppingTransactionTypeId\n      url\n      rating\n      searchString\n      __typename\n    }\n    __typename\n  }\n}\n"
}

ws_connection.onopen = function (event) {
  logger("Connection opened");
  logger("Sending init payload");
  ws_connection.send(JSON.stringify({ type: GQL.CONNECTION_INIT, payload: { portalId: 25, mandator: 406802, country: "ch", culture: "en-US" }}));
};

ws_connection.onmessage = function (event) {
  const data = JSON.parse(event.data)
  switch (data.type) {
    case GQL.CONNECTION_ACK: {
      logger('\x1b[32m' + 'SUCCESS' + '\x1b[0m')
      logger("Sending subscribe payload...");
      ws_connection.send(JSON.stringify({
        id: "1",
        type: GQL.START,
        payload
      }))
      logger("Subscribed, waiting for data");
      break
    }
    case GQL.CONNECTION_ERROR: {
      logger(data.payload)
      break
    }
    case GQL.CONNECTION_KEEP_ALIVE: {
      break
    }
    case GQL.DATA: {
      logger("Received new data:");
      console.log(data.payload.data)
      break
    }
    case GQL.COMPLETE: {
      console.log('completed', data.id)
      break
    }
  };
};

ws_connection.onclose = function () {
  console.log("Connection closed");
};
