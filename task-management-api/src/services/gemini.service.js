const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
  model: 'gemini-3.5-flash-lite',
});

const generateCommands = async (userCommand) => {
  const prompt = `
You are an AI assistant for a Task Management API.

Your job is to convert the user's natural language instruction
into structured JSON commands.

ONLY these actions are allowed:

1. create_task
2. update_task
3. delete_task

You MUST NOT create, update, or delete users.

Return ONLY valid JSON.
Do not use markdown.
Do not add explanations.

The JSON format MUST be:

{
  "commands": [
    {
      "action": "create_task",
      "data": {
        "projectId": number,
        "title": string,
        "description": string | null,
        "status": "todo" | "in_progress" | "done",
        "priority": "low" | "medium" | "high",
        "assigneeId": number
      }
    }
  ]
}

For update_task:

{
  "action": "update_task",
  "taskId": number,
  "data": {
    "title": string,
    "description": string | null,
    "status": "todo" | "in_progress" | "done",
    "priority": "low" | "medium" | "high",
    "assigneeId": number
  }
}

Only include fields that need to be updated.

For delete_task:

{
  "action": "delete_task",
  "taskId": number
}

If the user's request is not related to task management,
return:

{
  "commands": []
}

User instruction:
${userCommand}
`;

  const result = await model.generateContent(prompt);

  const response = result.response;
  const text = response.text();

  return text;
};

module.exports = {
  generateCommands,
};