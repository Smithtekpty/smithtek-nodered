module.exports = function(RED) {
    function StepTimerNode(config) {
        RED.nodes.createNode(this, config);
        this.outputMsg = {payload: true};
        this.numOutputs = config.outputs;
        this.nextOutput = 0;  // start with the first

        if (config.stepUnits === "milliseconds") {
            this.timeoutVal = config.step;
        } else if (config.stepUnits === "minutes") {
            this.timeoutVal = config.step * (60 * 1000);
        } else if (config.stepUnits === "hours") {
            this.timeoutVal = config.step * (60 * 60 * 1000);
        } else if (config.stepUnits === "days") {
            this.timeoutVal = config.step * (24 * 60 * 60 * 1000);
        } else {   // Default to seconds
            this.timeoutVal = config.step * 1000;
        }

        if (config.pauseUnits === "milliseconds") {
            this.pauseVal = config.pauseTime;
        } else if (config.pauseUnits === "minutes") {
            this.pauseVal = config.pauseTime * (60 * 1000);
        } else if (config.pauseUnits === "hours") {
            this.pauseVal = config.pauseTime * (60 * 60 * 1000);
        } else if (config.pauseUnits === "days") {
            this.pauseVal = config.pauseTime * (24 * 60 * 60 * 1000);
        } else {   // Default to seconds
            this.pauseVal = config.pauseTime * 1000;
        }

        this.autostart = config.autostart;
        if(this.autostart) {
            if (config.startupUnits === "milliseconds") {
                this.startupDelay = config.startupDelay;
            } else if (config.startupUnits === "minutes") {
                this.startupDelay = config.startupDelay * (60 * 1000);
            } else if (config.startupUnits === "hours") {
                this.startupDelay = config.startupDelay * (60 * 60 * 1000);
            } else if (config.startupUnits === "days") {
                this.startupDelay = config.startupDelay * (24 * 60 * 60 * 1000);
            } else {   // Default to seconds
                this.startupDelay = config.startupDelay * 1000;
            }
        }

        this.nextTimeout = null;
        this.running = false;
        this.started = false;
        this.paused = false;
        this.status({fill:"red",shape:"ring",text:"Not Started"});

        var node = this;

        // If the node isn't running, start running
        // if the node is running, pause for the amount specified
        // if the node is paused, don't do anything... just wait it out.
        node.on('input', function(msg) {
            if(!node.running && !node.paused) {
                node.running = true;
                node.status({fill:"green",shape:"dot",text:"Running, next output: " + node.nextOutput.toString()});
                node.send(node.getNextOutput());
                clearInterval(node.nextTimeout);
                node.nextTimeout = setInterval(function() {
                    node.send(node.getNextOutput());
                }, node.timeoutVal);
            } else if (!node.paused) {
                node.running = false;
                node.paused = true;
                clearInterval(node.nextTimeout);
                node.nextTimeout = setTimeout(function() {
                    node.running = true;
                    node.paused = false;
                    node.send(node.getNextOutput());
                    node.nextTimeout = setInterval(function() {
                        node.send(node.getNextOutput());
                    }, node.timeoutVal);
                }, node.pauseVal);
                node.status({fill:"red",shape:"dot",text:"Paused, next output: " + node.nextOutput.toString()});
            }
        });

        // Clean up the intervals so they aren't running on re-deploy.
        this.on('close', function() {
            if(node.nextTimeout != null) {
                clearInterval(node.nextTimeout);
            }
        });

        // Get the next array of outputs, and increment the next output counter
        this.getNextOutput = function getNextOutput(){
            var outputVals = Array(node.numOutputs).fill(null);
            outputVals[node.nextOutput] = node.outputMsg;
            node.nextOutput = (node.nextOutput + 1) % node.numOutputs;
            node.status({fill:"blue", shape:"dot", text: "Running, next output: " + node.nextOutput.toString()});
            return outputVals
        }

        // Run on startup.
        if(node.autostart && !node.started && !node.running) {
            console.log("Autostarting");
            node.started = true;
            node.paused = false;
            clearInterval(node.nextTimeout);
            //console.log("Startup in: " + node.startupDelay);
            setTimeout(function () {
                //console.log("Starting Node");
                node.emit("input", {}); // Since running is false by default, this will enable it
            }, this.startupDelay);
        }
    }

    RED.nodes.registerType("smithtek_sequencer", StepTimerNode);
}