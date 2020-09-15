function defineOutputObject(topic, message) {
  let finalObject = {};
  let variable = topic;

  if (topic.endsWith("/lv")) {
    variable = topic.slice(0, topic.length - 3);
  }
  let topicElements = variable.split("/");
  variable = topicElements[topicElements.length - 1];
  finalObject = parseOutputObject(topic, variable, message);

  return finalObject;
}

function parseOutputObject(topic, variable, message) {
  let finalObject = {};
  if (topic.endsWith("/lv")) {
    finalObject[variable] = { value: JSON.parse(message.toString()) };
  } else {
    finalObject[variable] = JSON.parse(message.toString());
  }
  return finalObject;
}

function getSubscribePaths(config) {
  var paths = [];
  var labelString = "label_variable_";
  var completeLabelString = "";
  var checkboxString = "checkbox_variable_";
  var checkboxString2 = "_last_value";
  var completeCheckboxString = "";

  for (var i = 1; i < 11; i++) {
    completeLabelString = labelString + i.toString();
    completeCheckboxString = checkboxString + i.toString() + checkboxString2;
    if (!(config[completeLabelString] === "")) {
      //if last value checkbox is checked
      var devicePath =
        "/v1.6/devices/" +
        config.device_label +
        "/" +
        config[completeLabelString];
      if (config[completeCheckboxString]) {
        devicePath += "/lv";
      }
      paths.push(devicePath);
    }
  }
  return paths;
}

module.exports = function (RED) {
  var mqtt = require("mqtt");
  var fs = require("fs");
  var path = require("path");

  function SmithTekNode(config) {
    RED.nodes.createNode(this, config);
    var ENDPOINTS_URLS = {
      business: "industrial.api.ubidots.com",
    };
    var useTLS = config.tls_checkbox_in;
    var useTLS = false;
    var endpointUrl = ENDPOINTS_URLS.business;
    var token = config.token;
    var URL_PREFIX = "mqtt://";
    var port = 1883;
    var portTLS = 8883;
    var certificate = fs.readFileSync(
      path.join(__dirname, "../keys/certificate.pem"),
      "utf8",
      function () { }
    );

    var topics = {};
    topics = getSubscribePaths(config);

    this.status({ fill: "green", shape: "ring", text: "Connecting" });

    var client = mqtt.connect(URL_PREFIX + endpointUrl, {
      username: token,
      password: "",
      port: useTLS ? portTLS : port,
      cert: useTLS ? certificate : undefined,
      protocol: useTLS ? "mqtts" : "mqtt",
      reconnectPeriod: 10000
    });

    client.on("connect", () => {
      this.status({ fill: "green", shape: "dot", text: "Connected" });
      var options = { qos: 1 };
      client.subscribe(topics, options);
    });

    client.on("message", (topic, message) => {
      let finalObject = defineOutputObject(topic, message);
      try {
        this.emit("input", { payload: finalObject });
      } catch (e) {
        console.log("Error when trying to emit: ", e);
        this.status({ fill: "red", shape: "ring", text: "smithtek.error_connecting" });
      }
    });

    client.on("close", () => {
      client.unsubscribe(topics);
      this.status({ fill: "red", shape: "ring", text: "Disconnected" });
    });

    client.on("error", (error) => {
      client.unsubscribe(topics);
      this.status({ fill: "red", shape: "ring", text: "Disconnected" });
    });

    client.on("reconnect", () => {
      this.status({ fill: "green", shape: "ring", text: "Reconnecting" });
    });

    this.on("error", (msg) => {
      console.log("SmithTek Client: Inside error function", msg);
      if (client !== null && client !== undefined) {
        client.end(true);
      }
      this.status({ fill: "red", shape: "ring", text: "smithtek.error_connecting" });
    });

    this.on("close", () => {
      if (client !== null && client !== undefined) {
        client.end(true);
      }
    });

    this.on('input', (msg, send, done) => {
      try {
        send(msg);
      } catch (err) {
        console.log('Error in client when sending data to debug node,', err);
        this.error(err, msg);
      }
      if (done) {
        done();
      }
    });
  }

  RED.nodes.registerType("smithtek_in", SmithTekNode);
};
