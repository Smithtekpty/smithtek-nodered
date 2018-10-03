# Node-RED SmithTek Node

This is a [Node-RED](http://nodered.org) node used to interact with the SmithTek service. It publishes and suscribes to one or multiple variables.

## Installation

The `smithtek-nodered` node for Node-RED is available as an [npm package](https://www.npmjs.com/package/smithtek-nodered). We recommend
you to read [Node-RED documentation](https://nodered.org/docs/getting-started/adding-nodes.html#installing-npm-packaged-nodes) if you
have any doubts installing nodes in the platform.

## Usage

There are two different nodes: One for reading information from SmithTek and another one for sending information to SmithTek.
There is also a squencer node which will send a `true` value to each of its outputs, delaying a set amount of time between them.

### SmithTek In

This node is used to suscribe to an Smithtek Variable. It will listen to new values and pass it to further nodes in the `msg.payload`.

These are the properties you should configure, by double clicking the node:

* __Token__: This is your account token.

* __Device label__: The label of the Device that contains the Variable from which you want to obtain the data.

* __Variable label__: The label of the Variable to which you will suscribe.

* __Simple Node__: Simple node mode subscribes to a topic to retrieve **only** the last value of the variable using the SmithTek API.

### SmithTek Out

This node is used to publish to an SmithTek Variable. It will receive a value from a previous node and publish it to your Variable.

These are the properties you should configure, by double clicking the node:

* __Token__ _or_ __msg.token__: This is your account token.

* __Device label__ _or_ __msg.device_label__: The label of the Device to which you want to send the data.

* __msg.payload:__ This payload will contain all the values that will be sent to the Device. It's structured to use the key of the
object as the Variable label and the value of the key as the value to send to SmithTek, e.g. `{"variable-label": 42}`

* __Simple Node__: Simple node mode publishes only to a single variable label. If set, the node will make available for you an input text area to set the variable label that will store the values sent. The msg.payload **must contain only the numerical value** to publish to the SmithTek API, not an object type. Example: 30, 20.

* __Variable label__: If simple node is checked, this fiel will be visible. Fill it with the variable label that should store values.

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
