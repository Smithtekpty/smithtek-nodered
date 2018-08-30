module.exports = function (RED) {
    var mqtt = require("mqtt");

    function postSmithTek(self, label_device, values, token) {
        var client = mqtt.connect('mqtt://industrial.api.ubidots.com', {username: token, password: ""});

        client.on("connect", function () {
            client.publish(
                "/v1.6/devices/" + label_device + "",
                values,
                {'qos': 1, 'retain': false},
                function (error, response) {
                    client.end(true, function () {});
                }
            );
            self.status({ fill: "green", shape: "dot", text: "smithtek.published" });
        });

        client.on('error', function (msg) {
            self.status({ fill: "red", shape: "ring", text: "smithtek.error_connecting" });
        });
    }

    function SmithTek(n) {
        RED.nodes.createNode(this, n);
        var self = this;

        this.on("input", function (msg) {
            var label_device = (msg.device_label || n.device_label) || (msg.label_device || n.label_device);
            var values = (typeof msg.payload !== 'object' || msg.payload === null) ? {} : msg.payload;
            var token = msg.token || n.token;

            if (typeof (values) === 'object') {
                values = JSON.stringify(values);
            }

            self.status({ fill: "green", shape: "ring", text: "smithtek.connecting" });
            postSmithTek(self, label_device, values, token);
        });
    }

    RED.nodes.registerType("smithtek_out", SmithTek);
};
