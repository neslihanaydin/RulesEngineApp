// MQTT Broker and Client Setup
const broker = "wss://test.mosquitto.org:8081/mqtt";
let client = null;

let expectedOutputTopic = null;
let pendingOutputTimeout = null;

document.getElementById("connectButton").addEventListener("click", function () {
    if (!client || !client.connected) {
        client = mqtt.connect(broker);

        // Update UI on connection success
        client.on("connect", function () {
            console.log("MQTT connected!");
            document.getElementById("status").innerText = "Connected";
            document.getElementById("status").style.color = "green";
            document.getElementById("connectButton").innerText = "Disconnect";
            document.getElementById("tryAgainButton").style.display = "none";
        });

        // Handle connection errors
        client.on("error", function (error) {
            console.error("MQTT Connection Error:", error);
            document.getElementById("status").innerText = "Error connecting";
            document.getElementById("status").style.color = "red";
            document.getElementById("tryAgainButton").style.display = "inline-block";
        });

        // Handle disconnection events
        client.on("close", function () {
            console.log("MQTT connection closed");
            document.getElementById("status").innerText = "Disconnected";
            document.getElementById("status").style.color = "red";
            document.getElementById("connectButton").innerText = "Connect";
        });

        // Handle incoming messages
        client.on("message", function (topic, message) {
            console.log("Message received:", topic, message.toString());

            if (expectedOutputTopic && topic === expectedOutputTopic) {
                if (pendingOutputTimeout) {
                    clearTimeout(pendingOutputTimeout);
                    pendingOutputTimeout = null;
                    expectedOutputTopic = null;
                }

                const result = JSON.parse(message.toString());
                console.log("Result received:", result);

                document.getElementById("resultTable").style.display = "block";
                document.getElementById("baseAmount").innerText = `$${result.baseAmount.toFixed(2)}`;
                document.getElementById("childrenAmount").innerText = `$${result.childrenAmount.toFixed(2)}`;
                document.getElementById("totalAmount").innerText = `$${result.supplementAmount.toFixed(2)}`;
            }
        });
    } else {
        // Disconnect if already connected
        client.end();
    }
});

document.getElementById("tryAgainButton").addEventListener("click", function () {
    this.style.display = "none";
    if (client) {
        client.reconnect();
    } else {
        client = mqtt.connect(broker);
    }
});

// Show or hide summer and winter form fields based on supplement type
document.getElementById("supplementType").addEventListener("change", function () {
    resetForm();
    const supplementType = this.value;
    document.getElementById("winterFormFields").style.display = supplementType === "winter" ? "block" : "none";
    document.getElementById("summerFormFields").style.display = supplementType === "summer" ? "block" : "none";
});

// Form submission event
document.getElementById("supplementForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const supplementType = document.getElementById("supplementType").value;
    const numberOfChildren = document.getElementById(supplementType + "NumberOfChildren").value;
    const familyComposition = document.getElementById(supplementType + "FamilyComposition").value;
    const familyUnitInPayForDecember = supplementType === "winter" ? document.getElementById("winterFamilyUnitInPayForDecember").checked : null;
    const familyUnitInPayForJuly = supplementType === "summer" ? document.getElementById("summerFamilyUnitInPayForJuly").checked : null;
    const householdIncome = supplementType === "summer" ? document.getElementById("summerHouseholdIncome").value : null;

    const formData = {
        id: "af3054e0-27ff-428e-9531-72b88106039c", //generateUniqueId(), //TODO , generate unique id for each form submission
        numberOfChildren: parseInt(numberOfChildren),
        familyComposition: familyComposition,
        familyUnitInPayForDecember: supplementType === "winter" ? familyUnitInPayForDecember : null,
        familyUnitInPayForJuly: supplementType === "summer" ? familyUnitInPayForJuly : null,
        householdIncome: supplementType === "summer" ? parseFloat(householdIncome) : null
    };

    // Determine correct topics
    let inputTopic, outputTopic;
    if (supplementType === "winter") {
        if (!numberOfChildren || !familyComposition || !familyUnitInPayForDecember) {
            alert("Please fill out all fields.");
            return;
        }
        inputTopic = `BRE/calculateWinterSupplementInput/${formData.id}`;
        outputTopic = `BRE/calculateWinterSupplementOutput/${formData.id}`;
        delete formData.householdIncome;
        delete formData.familyUnitInPayForJuly;
    } else if (supplementType === "summer") {
        if (!numberOfChildren || !familyComposition || !familyUnitInPayForJuly || !householdIncome) {
            alert("Please fill out all fields.");
            return;
        }
        inputTopic = `BRE/calculateSummerSupplementInput/${formData.id}`;
        outputTopic = `BRE/calculateSummerSupplementOutput/${formData.id}`;
        delete formData.familyUnitInPayForDecember;
    }

    const message = JSON.stringify(formData);

    if (client && client.connected) {
        client.publish(inputTopic, message, { qos: 1 }, (err) => {
            if (err) {
                console.error("Error publishing message: :", err);
            } else {
                console.log("Published message:", message);
            }
        });

        client.subscribe(outputTopic, { qos: 1 }, function (err) {
            if (err) {
                console.error("Subscription error:", err);
            } else {
                console.log("Subscribed to topic:", outputTopic);
            }
        });

        expectedOutputTopic = outputTopic;
        if (pendingOutputTimeout) {
            clearTimeout(pendingOutputTimeout);
        }
        pendingOutputTimeout = setTimeout(() => {
            alert("No results were received within the specified time. The broker may be closed or the transaction was not completed");
            pendingOutputTimeout = null;
            expectedOutputTopic = null;
        }, 3000); 
    } else {
        alert("Please connect to MQTT broker before submitting the form");
    }
});

// Generate a unique ID for each form submission
function generateUniqueId() {
    return Math.random().toString(36).substring(2) + new Date().getTime().toString(36);
}

function resetForm() {
    document.getElementById("supplementForm").reset();
    document.getElementById("resultTable").style.display = "none";
    document.getElementById("winterFormFields").style.display = "none";
    document.getElementById("summerFormFields").style.display = "none";
}
