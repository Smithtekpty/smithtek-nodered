# Node-RED SmithTek Node

This is a [Node-RED](http://nodered.org) node used to interact with the SmithTek service. It publishes and suscribes to one or multiple variables. It also provides the ability to subscribe to up to 10 Ubidots custom topics.

## Installation

The `smithtek-nodered` node for Node-RED is available as an [npm package](https://www.npmjs.com/package/smithtek-nodered). We recommend
you to read [Node-RED documentation](https://nodered.org/docs/getting-started/adding-nodes.html#installing-npm-packaged-nodes) if you
have any doubts installing nodes in the platform.

## Usage

There are two different nodes: One for reading information from SmithTek and another one for sending information to SmithTek.
There is also a squencer node which will send a `true` value to each of its outputs, delaying a set amount of time between them.

### SmithTek In

This node is used to suscribe to one or more (up to 10) Smithtek Variable(s). It will listen to new values and pass it to further nodes in the `msg.payload`.

These are the properties you should configure, by double clicking the node:

* __Token__: This is your account token.

* __Device label__: The label of the Device that contains the Variable from which you want to obtain the data.

* __Variable label__: The label of the Variable to which you will suscribe.

*  __TLS__: By default, all data is sent encrypted via TLS. Uncheck if data should be sent unencrypted.

* __Simple Node__: Simple node mode subscribes to a topic to retrieve **only** the last value of the variable using the SmithTek API.

*  __Add Variable__: Adds an additional variable (up to 10).

The output is a JSON object with the *variable name* as key and the *Last Value*/data point object as value, e.g.: `{"device_label/variable": {"value": 100, "timestamp": 1583523586668, "context": { "key1": "value1", "key2": "value2"}, "created_at": 1583523586732}`

If you get the error: `TypeError: send is not a function`, please run `npm update node-red` and reload Node-Red. You probably run a `0.x` node-red version. This library requires >`1.0`.

### SmithTek Out

This node is used to publish to an SmithTek Variable. It will receive a value from a previous node and publish it to your Variable.

These are the properties you should configure, by double clicking the node:

* __Token__: This is your account token.

* __Device label__ _or_ __msg.payload.device_label__: The label of the Device to which you want to send the data. If no Device exists with this label, it will be automatically created. Can be sent dynamically in the message JSON object with the key: `device_label`. If no Device label is sent in the message, it defaults back to the value from the Device Label field. Keep in mind that the Device Label is required.

*  __TLS__: By default all data is sent encrypted via TLS. Uncheck if data should be sent unencrypted.

* __msg.payload:__ This payload will contain all the values that will be sent to the Device. It's structured to use the key of the
object as the Variable label and the value of the key as the value to send to SmithTek, e.g. `{"variable-label": 42}`

The message can contain the following properties:

- `msg.payload.device_label` (optional) - The name of the Device to which the packet will be published. If no Device Label is sent, it takes the Device Label from the *Device Label* field in the node settings.

- `msg.payload` (optional) - The values to be published on the given Device. Each key is the label of the variable.

Example of a simple value JSON message:`{"value": 100}`.

Example of a JSON message providing context data: `{"variable": {"value": 200, "context": {"key1": "value1","key2": "value2"}}}`.

Example of JSON message with multiple variables: `{"variable_1": {"value": 100, "context": {"key1": "value1", "key2": "value2"}}, "variable_2": {"value": 200, "context": { "key1": "value1", "key2": "value2"}}}`.

## Authentication

The authentication is made by using the __Token__ field in your nodes.

### SmithTek Sequencer

This node is used to trigger other nodes with `true` values in the `msg.payload`.

## Development

If you want to modify this extension, you just have to run `npm install` or `yarn install` to fetch and install the dependencies.

To install the development version and use it on your Node-RED instance, you can execute `npm link` on this folder and then execute
`npm link smithtek-nodered` in your `~/.nodered` folder.

## License

This software is provided under the MIT license. See [LICENSE](LICENSE) for applicable terms.
