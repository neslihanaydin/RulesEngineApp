# Rules Engine Demo App: Interactive Full-Stack Solution for Rule Processing.

This repository contains a simple full-stack application built using HTML, JavaScript, and CSS. It provides both a user-friendly interface and backend functionalities to interact with the [MQTT-Integrated Rule Processing System](https://github.com/neslihanaydin/RulesEngineMqtt).
The application is already live and accessible at [Rules Engine Application](https://rules-engine-app.vercel.app). 

## Prerequisites

1. Rule Processing Application: Ensure that the [MQTT-Integrated Rule Processing System](https://github.com/neslihanaydin/RulesEngineMqtt) is running in a Docker container or on your local machine. Follow the instructions in that repository to set it up.
2. A web browser to access the application interface in this [link](https://rules-engine-app.vercel.app/).

## Submitting Inputs
1. Fill in the required fields in the form on the website.
2. Click the Submit button to send your inputs.

## Publishing and Subscribing
This application handles the following MQTT operations in the background:
   * **Publish**: Sends your inputs to the MQTT input topic of the main Rules Engine Backend Application.
   * **Subscribe**: Listens to the MQTT output topic for processed results.

## Displaying Results
Once the backend processes the inputs, the output is displayed directly on the webpage.

## Examples
### Winter Input
Below is an example of a Winter Input scenario:
| **Field**                        | **Value**    |
|----------------------------------|--------------|
| Supplement Type                  | Winter       |
| Number of Children               | 2            |
| Family Composition               | Married      |
| Eligible for Family Support in December | True |

### Winter Output
Below is an example of a Winter Output:
| Base Amount | Children Amount | Total Amount |
|-------------|-------------|-------------|
| $120.00 | $40.00 | $160.00 |

### Summer Input
Below is an example of a Summer Input scenario:
| **Field**                             | **Value**    |
|---------------------------------------|--------------|
| Supplement Type                       | Summer       |
| Number of Children                    | 3            |
| Family Composition                    | Single       |
| Household Income                      | 50000        |
| Eligible for Family Support in July   | True         |

### Summer Output
Below is an example of a Summer Output:
| Base Amount | Children Amount | Total Amount |
|-------------|-------------|-------------|
| $100.00 | $150.00 | $250.00 |

<img width="740" alt="Screenshot 2025-02-20 at 8 53 14 PM" src="https://github.com/user-attachments/assets/a26dcde1-0052-4479-91dc-cb1d65138723" />

## Additional Notes

To learn more about the main Rule Processing Application, you can visit its repository here: [MQTT-Integrated Rule Processing System](https://github.com/neslihanaydin/RulesEngineMqtt).

