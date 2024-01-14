# Quiz Generator

**Quiz Generator** is a plugin for [Obsidian](https://obsidian.md/) that leverages the power of OpenAI's GPT-3.5 and GPT-4 models to automatically generate interactive, exam-style questions (with answers) based on your notes. Whether you're a student looking to quiz yourself or an educator creating assessments, this plugin streamlines the question creation process.

## Features

- **Personalized Questions:** Select any combination of notes and folders to use as the quiz content.
- **Customizable Generation:** Choose the type(s) and number of questions to generate.
- **Multiple Question Types:** Multiple choice, true/false, and short answer are all supported. Mix and match them to best suit your needs for an effective assessment.
- **Interactive UI:** Answer generated questions in an interactive UI that provides real-time feedback on correctness.
- **Question Saving:** Save generated questions in either (or both) of the following formats.
  - Inline and multiline flashcards to review with [obsidian-spaced-repetition](https://github.com/st3v3nmw/obsidian-spaced-repetition).
  - Markdown callouts for seamless integration with your notes.
- **Model Options:** Choose between OpenAI's GPT-3.5 and GPT-4 models, depending on your needs.
  - Use `gpt-3.5-turbo-1106` (16,385 token context window) for faster response times and efficient question generation with a moderate context window.
  - Use `gpt-4-1106-preview` (128,000 token context window) for more extensive content and in-depth question generation, suitable for complex educational materials and detailed assessments.

## Usage

### Installation

1. Install the plugin from the **Community plugins** page in Obsidian.
   - **Settings** → **Community plugins** → **Browse**.
   - Search for `Quiz Generator`.
   - Select the plugin to open its page and then select **Install**.
   - Select **Enable** on the plugin page or go back to the **Community plugins** page and toggle the switch.
2. Open the plugin settings and enter your API key.
   - If you don't have an API key, create an account at [OpenAI](https://platform.openai.com/) and retrieve your API key from [API keys](https://platform.openai.com/api-keys).
3. Configure the other settings as desired.

### Generation

- Open the command palette and select "Quiz Generator: Open generator" or select the [brain-circuit](https://lucide.dev/icons/brain-circuit) icon in the left sidebar.
- Use the [file](https://lucide.dev/icons/file-plus-2) and [folder](https://lucide.dev/icons/folder-plus) icons to add notes and folders.
  - Adding a folder adds all of the notes inside it, as well as any notes in its subfolders. If you select an extremely large folder (thousands of files and hundreds of subfolders), it could take a few seconds for it to be added.
- Use the [x](https://lucide.dev/icons/x) icon to remove individual notes/folders, and the [book](https://lucide.dev/icons/book-x) icon to remove everything.
- Once you've added your notes and/or folders, select the [webhook](https://lucide.dev/icons/webhook) icon to generate the questions.
  - The quiz UI will open automatically when the generation is complete (it usually takes at least a few seconds).
  - The generation time may vary based on the length of your notes and the number of questions to generate.

### Saving

- Saved questions will be in a Markdown file named "Quiz [number]" in the folder specified by the "Save location" setting.
- Select the [save](https://lucide.dev/icons/save) icon to save the current question.
- Select the [save-all](https://lucide.dev/icons/save-all) icon to save all questions.
- If the "Automatically save questions" setting is enabled, all questions will be immediately saved upon generation.

### Miscellaneous

- Select the [scroll](https://lucide.dev/icons/scroll-text) icon in the generator UI to re-open the most recently generated quiz.
- I recommend saving all generated questions because you cannot re-open them in the quiz UI once you close the generator UI.

---

## Coming Soon

Explore the [Roadmap](https://github.com/your-username/your-plugin-name/projects/roadmap) to see upcoming features and planned improvements.

## Limitations

Make sure your input (selected notes and/or folders) and output (generated questions) token count does not exceed the context window of your chosen model. The input tokens are shown in the generator UI. 

Talk about token limit (mention approximately how many tokens each question takes up). Mention each model's context window and how input + output cannot exceed it.

## Issues and Feature Requests

If you encounter any errors or have feature requests, please open an issue on the [GitHub repository](https://github.com/ECuiDev/obsidian-quiz-generator/issues).
