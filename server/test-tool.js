const { tool } = require("langchain/tools");

// This is a simple tool that will echo the input
const echoTool = tool(
  {
    name: "echo",
    description: "Echo the input back to the user",
    schema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "The text to echo back"
        }
      },
      required: ["text"]
    }
  },
  async ({ text }) => {
    return `You said: ${text}`;
  }
);

// This is a tool that will fetch the current time
const timeChecker = tool(
  {
    name: "timeChecker",
    description: "Get the current time and date",
    schema: {
      type: "object",
      properties: {
        timezone: {
          type: "string",
          description: "The timezone to get the time for (optional)"
        }
      },
      required: []
    }
  },
  async ({ timezone }) => {
    const date = new Date();
    let timeString = date.toLocaleString();
    
    if (timezone) {
      try {
        timeString = date.toLocaleString('en-US', { timeZone: timezone });
        return `Current time in ${timezone}: ${timeString}`;
      } catch (error) {
        return `Error getting time for timezone ${timezone}: ${error.message}. Current server time: ${date.toLocaleString()}`;
      }
    }
    
    return `Current server time: ${timeString}`;
  }
);

// Export both tools so we can test them
module.exports = {
  echoTool,
  timeChecker
}; 