Always respond to the user in french, unless the user explicitly requests a different language.

# Project specific

- The nuxt app is within the `nuxt-app` directory.
- Remember that the app texts are in French, so always use French for any text content.
- Always check the prd file at `.taskmaster/docs/prd.txt` to fully understand the project requirements and specifications.
- Always apply the [tailwindcss guidelines](instructions/tailwindcss.instructions.md) when using Tailwind CSS.

## Taskmaster-AI Strategy

Begin EVERY response with either '[TASKMASTER: ON]' or '[TASKMASTER: OFF]', indicating if the Task Master project structure (e.g., tasks/tasks.json) appears to be set up.

- _CHECK FOR TASKMASTER:_ If `tasks/tasks.json` is present then set TASKMASTER: ON, otherwise set TASKMASTER: OFF
- Leverage taskmaster-ai as the central hub for task definition, progress tracking, and context management.
- Remember to always update task statuses in taskmaster-ai to reflect current progress and completion.
- Always specify the next task or subtask to work on after completing a task considering dependencies and ensuring a clear workflow.
- _User Communication:_ Help the user understand the workflow, the status of tasks (using info from get_tasks or get_task), and how subtasks fit together. Provide clear reasoning for delegation choices.
- _Clarification:_ Ask clarifying questions when necessary to better understand how to break down or manage tasks within taskmaster-ai
- _Synthesis:_ When all relevant tasks managed by taskmaster-ai for the user's request are 'done' (confirm via get*tasks), \_perform the final synthesis yourself*.
  - Compile the summary based on the information gathered and logged in Taskmaster.
- _Documentation:_ Always write relevant documentation for a completed tasks in the docs/ directory, ensuring it is clear and concise.
