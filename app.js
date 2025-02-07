// MQTT Broker and Client Setup
const broker = "wss://test.mosquitto.org:8081/mqtt"; 
const client = mqtt.connect(broker);

// MQTT Connection Established
client.on("connect", function () {
    console.log("MQTT connected!");
});

// MQTT Message Listener
client.on("message", function (topic, message) {
    console.log("Message received:", topic, message.toString());
    
    
    if (topic.includes("BRE/calculateWinterSupplementOutput/") || topic.includes("BRE/calculateSummerSupplementOutput/")) {
        const result = JSON.parse(message.toString());
        console.log("Result received:", result);

        // Show the result table and display values
        document.getElementById("resultTable").style.display = "block";
        document.getElementById("baseAmount").innerText = `$${result.baseAmount.toFixed(2)}`;
        document.getElementById("childrenAmount").innerText = `$${result.childrenAmount.toFixed(2)}`;
        document.getElementById("totalAmount").innerText = `$${result.supplementAmount.toFixed(2)}`;
    }
});


// Show or hide summer and winter form fields based on supplement type
document.getElementById("supplementType").addEventListener("change", function () {
    resetForm();
    const supplementType = this.value;
    if (supplementType === "winter") {
        document.getElementById("winterFormFields").style.display = "block";
        document.getElementById("summerFormFields").style.display = "none";
    } else if (supplementType === "summer") {
        document.getElementById("winterFormFields").style.display = "none";
        document.getElementById("summerFormFields").style.display = "block";
    } else {

    }
});

// Form Submission Event
document.getElementById("supplementForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const supplementType = document.getElementById("supplementType").value;
    // Collect form data based on supplement type
    const numberOfChildren = supplementType === "winter" ? document.getElementById("winterNumberOfChildren").value : document.getElementById("summerNumberOfChildren").value;
    const familyComposition = supplementType === "winter" ? document.getElementById("winterFamilyComposition").value : document.getElementById("summerFamilyComposition").value;
    
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
    // Determine the correct topics and message format
    let inputTopic, outputTopic;
    if (supplementType === "winter") {
        if (numberOfChildren === "" || familyComposition === "" || familyUnitInPayForDecember === false) {
            alert("Please fill out all fields.");
            return false;
        }
        inputTopic = `BRE/calculateWinterSupplementInput/${formData.id}`;
        outputTopic = `BRE/calculateWinterSupplementOutput/${formData.id}`;
        delete formData.householdIncome; // Remove summer-specific field
        delete formData.familyUnitInPayForJuly; // Remove summer-specific field
    } else if (supplementType === "summer") {
        if (numberOfChildren === "" || familyComposition === "" || familyUnitInPayForJuly === false || householdIncome === "") {
            alert("Please fill out all fields.");
            return false;
        }
        inputTopic = `BRE/calculateSummerSupplementInput/${formData.id}`;
        outputTopic = `BRE/calculateSummerSupplementOutput/${formData.id}`;
        delete formData.familyUnitInPayForDecember; // Remove winter-specific field
    }

    const message = JSON.stringify(formData);

    // Publish the form data to the correct MQTT input topic
    client.publish(inputTopic, message, { qos: 1 }, (err) => {
        if (err) {
            console.error("Error sending message:", err);
        } else {
            console.log("Message sent:", message);
        }
    });

    client.subscribe(outputTopic, { qos: 1 }, function (err) {
        if (err) {
            console.error("Subscription error:", err);
        } else {
            console.log("Subscribed to topic:", outputTopic);
        }
    });
    
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