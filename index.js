require("dotenv").config();

const { Agent, Result, AgentController } = require("agents-js");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.MODEL_API_KEY,
  baseURL: "https://proxy.tune.app", // Remove this if using openai's api directly
});

function add({ a, b }) {
  /**
   * @param {number} a - First number
   * @param {number} b - Second number
   * @description Adds two numbers
   */
  return new Result({ value: `${a + b}` });
}
const agentController = new AgentController(client);

const agent = new Agent({
  name: "Calculator",
  instructions: "You can perform addition using the add function.",
  model: process.env.MODEL,
  functions: [add],
});

const messages = [{ role: "user", content: "What is 2 + 3?" }];

(async () => {
  console.log("Running agent...");
  const response = await agentController.run(agent, messages);
  console.log(response);
})();
