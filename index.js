require("dotenv").config();

const { Agent, Result, AgentController } = require("agents-js");
const OpenAI = require("openai");
const {
  bookTable,
  getNearbyRestaurants,
  findSlots,
  scheduleMeeting,
  conductResearch,
} = require("./utils");

const client = new OpenAI({
  apiKey: process.env.MODEL_API_KEY,
  baseURL: "https://proxy.tune.app", // Remove this if using openai's api directly
});

const agentController = new AgentController(client);

// Define specialized agents
const conciergeAgent = new Agent({
  name: "Concierge",
  model: process.env.MODEL,
  instructions: `You are a helpful concierge assistant that helps users with restaurant bookings and recommendations.
  Its important that when users ask about restaurants, help them find suitable options and make reservations. 
  If restaurant name is not given then show nearby restaurants, find available time slots, and book tables.
  If slot id is not given then show available slots for the restaurant unless time is specified, in which case book the table.
  Be proactive in asking for missing information.
  Feel free to transfer to other agents for specialized tasks.
  For getting restaurant id use getNearbyRestaurants function and for finding slots use findSlots function.
  For example, if a user wants to book a restaurant and schedule a related meeting: then use Concierge agent to book the restaurant, extract booking details from the result, use Scheduler agent to create a calendar invite with those details, and confirm both tasks are completed.
  `,
  functions: [bookTable, getNearbyRestaurants, findSlots, switchAgent],
  parallelToolCalls: true,
});

const schedulerAgent = new Agent({
  name: "Scheduler",
  model: process.env.MODEL,
  instructions: `You are a scheduling assistant that helps users manage their meetings and appointments.
  Help users schedule meetings, set reminders, and manage their calendar.
  '''Current Date and Time: ${new Date()} keep this in mind while scheduling meetings.'''
  Always confirm date, time, and participants.
  Be proactive in suggesting suitable time slots and asking for missing information.
  Feel free to transfer to other agents for specialized tasks like conducting research to find suitable meeting times or booking a restaurant for a meeting.
  `,
  functions: [scheduleMeeting, switchAgent],
  parallelToolCalls: true,
});

const researchAgent = new Agent({
  name: "Researcher",
  model: process.env.MODEL,
  instructions: `You are a research assistant specialized in gathering and analyzing information.
  Help users with:
  - Conducting thorough research on specified topics
  - Analyzing and summarizing findings
  - Providing well-structured reports
  - Identifying credible sources and references
  
  Always verify the depth of research needed and ask clarifying questions to narrow down the scope.
  Maintain academic rigor and cite sources when possible.
  Feel free to transfer to other agents for specialized tasks like scheduling meetings based on research findings.
  `,
  functions: [conductResearch, switchAgent],
  parallelToolCalls: true,
});

const managerAgent = new Agent({
  name: "Assistant",
  model: process.env.MODEL,
  instructions: (
    context
  ) => `You are a helpful personal assistant that coordinates with specialized agents.
  Current context: ${JSON.stringify(context)}
  
  Key responsibilities:
  1. Coordinate multiple related tasks across different domains
  2. Maintain task context and state
  3. Ensure all related tasks are completed
  4. Handle task dependencies
  
  When handling multi-step tasks:
  1. Break down the task into subtasks
  2. Track completion of each subtask
  3. Pass relevant context between agents
  4. Confirm all subtasks are completed
  
  For example, if a user wants to book a restaurant and schedule a related meeting:
  1. Use Concierge agent to book the restaurant
  2. Extract booking details from the result
  3. Use Scheduler agent to create a calendar invite with those details
  4. Confirm both tasks are completed`,
  functions: [switchAgent],
  parallelToolCalls: false,
});
