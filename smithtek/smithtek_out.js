module.exports = function (RED) {
    var mqtt = require("mqtt");

    function postSmithTek(self, label_device, values, token, label_variable, simple_node) {
        var client = mqtt.connect('mqtt://industrial.api.ubidots.com', {username: token, password: ""});
        var payload = values;

        if (simple_node) {
            payload = {[label_variable]:values};
            payload = JSON.stringify(payload);
        }

        client.on("connect", function () {
            client.publish(
                "/v1.6/devices/" + label_device + "",
                payload,
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
            var  values = (!['object', 'number', 'string'].includes(typeof msg.payload) || msg.payload === null) ? {} : msg.payload;
            var token = msg.token || n.token;
            var label_variable = n.label_variable;
            var simple_node = n.simple_node;

            if (typeof (values) === 'object') {
                values = JSON.stringify(values);
            }

            self.status({ fill: "green", shape: "ring", text: "smithtek.connecting" });
            postSmithTek(self, label_device, values, token, label_variable, simple_node);
        });
    }

    RED.nodes.registerType("smithtek_out", SmithTek);
};
