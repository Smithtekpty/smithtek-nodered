module.exports = function (RED) {
  var mqtt = require('mqtt');

  function getClient(self, label_device, label_variable, token, simple_node) {
    self.status({ fill: "green", shape: "ring", text: "smithtek.connecting" });

    if(this.client !== null && this.client !== undefined) {
      this.client.end(true, function() {});
    }

    var client = mqtt.connect('mqtt://industrial.api.ubidots.com', {username: token, password: ""});
    this.client = client;

    client.on("error", function () {
      client.end(true, function() {});
      self.status({ fill: "red", shape: "ring", text: "smithtek.error_connecting" });
    });

    client.on('close', function(){
      client.end(true, function(){});
    });

    client.on("reconnect", function () {
      var topic = "/v1.6/devices/" + label_device + "/" + label_variable;
      if (simple_node) {
        topic += "/lv";
      }

      var options = {};

      self.status({ fill: "green", shape: "dot", text: "smithtek.connected" });
      options[topic] = 1;

      client.subscribe(options, function (err, granted) {
        try {
          client.on('message', function (topic, message, packet) {
            self.emit("input", {payload: JSON.parse(message.toString())});
          });
        } catch (e) {
          self.status({ fill: "red", shape: "ring", text: "smithtek.error_connecting" });
        }
      });
    });

    client.on("connect", function () {
      var topic = "/v1.6/devices/" + label_device + "/" + label_variable;
      var options = {};

      if (simple_node) {
        topic += "/lv";
      }

      self.status({ fill: "green", shape: "dot", text: "smithtek.connected" });
      options[topic] = 1;

      client.subscribe(options, function (err, granted) {
        try {
          client.on('message', function (topic, message, packet) {
            self.emit("input", {payload: JSON.parse(message.toString())});
          });
        } catch (e) {
          self.status({ fill: "red", shape: "ring", text: "smithtek.error_connecting" });
        }
      });
    });
  }

  function SmithTekNode(n) {
    RED.nodes.createNode(this, n);
    var self = this;

    var label_device = n.device_label || n.label_device;
    var label_variable = n.label_variable;
    var token = n.token;
    var simple_node = n.simple_node;

    getClient(self, label_device, label_variable, token, simple_node);

    this.on("error", function () {
      if(self.client !== null && self.client !== undefined) {
        self.client.end(true, function(){});
      }
      self.status({ fill: "red", shape: "ring", text: "smithtek.error_connecting" });
    });

    this.on("close", function(){
      if(self.client !== null && self.client !== undefined) {
        self.client.end(true, function(){});
      }
    });

    this.on("input", function (msg) {
      try {
        this.send(msg);
      } catch (err) {
        this.error(err, msg);
      }
    });
  }

  RED.nodes.registerType("smithtek_in", SmithTekNode);
};
