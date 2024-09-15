"use server";

import { createStreamableValue } from "ai/rsc";
import { CoreMessage, streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { rateLimit } from "@/lib/ratelimit";
import { headers } from "next/headers";

const nim = createOpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_NIM_API_KEY,
});

// Multi-line prompts
const headLLMPromptTemplate = `
Respond on what the user wants but only for pitch scripts business plans and dynamic task assignment here are templates of each one
`;
const pitchScriptPrompt = `
You are responsible for generating a pitch script for a startup based on the idea provided. The pitch should cover the following essential points:

1. **Introduction:**
    - Provide a brief introduction to the idea or business, including the problem it solves and its mission.

2. **Target Audience and Market Opportunity:**
    - Define the target market and the problem they are facing.
    - Highlight the market size, growth potential, and competitive landscape.

3. **Solution and Value Proposition:**
    - Clearly outline the solution your startup offers and the unique value proposition.

4. **Revenue Model and Business Strategy:**
    - Explain the business model (how you plan to make money).

5. **Team Overview:**
    - Introduce the key team members and their roles in making the business successful.

6. **Call to Action:**
    - End with a clear call to action for potential investors or partners.

Additional Notes:
- If the user did not specify a tone, use 'professional' as the default tone.
- If the user did not specify a name for the startup, be creative and generate a name for the startup based on the idea provided.
- If the user did not input team members, propose a list of job titles for the team members.
- By default, the script should take 3 minutes, but if the user specifies a different timing, respect that timing.
- If the user did not specify the points to focus on, use the ones provided above.
- Make sure the pitch script is engaging, concise, and tailored to the tone provided by the user.
- You can add any other information that you think is relevant for the pitch script.
`;

const businessPlanPrompt = `
You are responsible for generating a detailed business plan for a startup. The plan should include the following:

1. **Business Plan Overview:**
- A general overview of the project, including its purpose and goals.

2. **Stages of Development:**
- Define and generate stages of development. Include any necessary stages like Ideation, Development, Launch, Growth, or other relevant stages as needed.
- For each stage, provide:
    - Objectives
    - Milestones
    - Detailed tasks
    - Resource allocation (including specific items or services to be invested in)
    - Financial projections (expenses and expected gains)
    - Risk management strategies

3. **General Timeline:**
- Provide a high-level timeline for the entire project, including the estimated duration of each stage and key milestones.

4. **Detailed Timeline:**
- Generate a detailed timeline for each stage with tasks assigned on a weekly or monthly basis, using the provided template:
    | Timeframe        | Task                               | Milestones            |
    |------------------|------------------------------------|-----------------------|
    | Week 1 (Month 1) | Task description                   | Milestone             |
    | Week 2 (Month 1) | Next task description              |                       |

5. **TAM, SAM, SOM Analysis:**
- Clearly define and quantify the following market segments:
    - **TAM (Total Addressable Market):** Provide a clear number for the total market size (in dollars or units), including data on market growth rate and potential.
    - **SAM (Serviceable Available Market):** Identify the specific segment of the TAM that is addressable by the startup, including detailed demographic or geographic factors, and provide a specific dollar or unit value.
    - **SOM (Serviceable Obtainable Market):** Provide an estimate of the actual market share the startup can realistically capture within the first 1-3 years, with specific numbers and justifications for the market share percentage.

6. **Financial Projections and Pricing:**
- Provide a comprehensive financial projection for the next 3 to 5 years, including:
    - **Revenue projections:** Estimate annual revenues based on SOM and include assumptions about customer acquisition rates, churn, and growth.
    - **Expenses:** Include detailed projections for major expenses (e.g., personnel, infrastructure, marketing).
    - **Profit Margins:** Project expected profit margins based on revenue and expenses.
    - **Suggested Pricing:** Recommend prices for the startup's key services or products, including justification for the pricing strategy (e.g., competitor analysis, customer willingness to pay, cost-plus pricing).
    - **Breakeven Analysis:** Indicate when the startup is expected to break even (cover its expenses and start generating profit).

7. **Resource Allocation:**
- Detail the resources needed at each stage (e.g., personnel, equipment, services) and the budget for each.

Ensure the output is structured, quantifiable, and easy to understand. Include clear justifications for each financial figure, pricing decision, and market estimate to help the startup owner grasp the required investments, expected outcomes, and potential risks.
`;

const taskAssignmentPrompt = `
You are responsible for generating detailed tasks based on the skills and roles of the provided team members. Given the following team members and their skills, generate a comprehensive list of tasks for each stage of the business plan:
For each stage of the business plan, provide:
1. **Detailed Tasks:**
- Generate specific tasks for each team member based on their skills.
- Include deadlines and dependencies for each task.
- Use the following task assignment template:
    | Team Member |
    | Task             | Start Date | End Date | Milestones |
    |------------------|------------|----------|------------|
    |  Task 1           | YYYY-MM-DD | YYYY-MM-DD | Milestone 1 |
    | Task 2           | YYYY-MM-DD | YYYY-MM-DD | Milestone 2 |

2. **General Guidance:**
- Provide guidance on how to manage the project timeline and ensure timely completion of tasks.

Ensure the output is detailed and clearly assigned to help the startup owner manage their team effectively.
`;

// Main function to handle conversation logic
export async function continueConversation(messages : any) {


  const ip = headers().get("x-forwarded-for") ?? "unknown";
  const isRateLimited = rateLimit(ip);

  if (isRateLimited) {
    console.log("Rate limited");
    throw new Error(`Rate Limit Exceeded for ${ip}`);
  }

    
  const taskSpecificPrompt = {
    role: "system",
    content: headLLMPromptTemplate + "\n" + businessPlanPrompt + "\n"+taskAssignmentPrompt + "\n" + pitchScriptPrompt
  };

  const updatedMessages = [taskSpecificPrompt, ...messages];
  const result = await streamText({
    model: nim("nvidia/nemotron-4-340b-instruct"),
    messages: updatedMessages,
    temperature: 0.65,
    topP: 0.3,
    maxTokens: 6800,
  });

  
  const stream = createStreamableValue(result.textStream);
  return stream.value

}