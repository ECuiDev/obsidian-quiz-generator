# Quiz Generator

**Quiz Generator** is a plugin for [Obsidian](https://obsidian.md/) that leverages the power of OpenAI's GPT-3.5 and GPT-4 models to automatically generate interactive, exam-style questions (with answers) based on your notes. Whether you're a student looking to quiz yourself or an educator creating assessments, this plugin streamlines the question creation process.

![Demo](assets/Demo.gif)

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

This plugin is currently under review to be added to the **Community plugins** page in Obsidian. Meanwhile, you can install it using either of the following methods.

#### BRAT Installation

1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat) from the **Community plugins** page in Obsidian.
   - **Settings** → **Community plugins** → **Browse**.
   - Search for `Obsidian42 - BRAT`.
   - Select the plugin to open its page and then select **Install**.
   - Select **Enable** on the plugin page or go back to the **Community plugins** page and toggle the switch.
2. Select `Add Beta plugin` in BRAT's settings.
3. Enter this repository's URL: `https://github.com/ECuiDev/obsidian-quiz-generator`.
4. Enable the plugin.
5. Open the plugin settings and enter your API key.
   - If you don't have an API key, create an account at [OpenAI](https://platform.openai.com/) and retrieve your API key from [API keys](https://platform.openai.com/api-keys).
6. Configure the other settings as desired.

#### Manual Installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/ECuiDev/obsidian-quiz-generator/releases).
2. Go to your Obsidian vault's `plugins` folder and create a new folder named `quiz-generator`.
3. Move the files you downloaded in step 1 to this folder.
4. Enable the plugin in the **Community plugins** page in Obsidian.
5. Open the plugin settings and enter your API key.
   - If you don't have an API key, create an account at [OpenAI](https://platform.openai.com/) and retrieve your API key from [API keys](https://platform.openai.com/api-keys).
6. Configure the other settings as desired.

### Generation

- Open the command palette and select "Quiz Generator: Open generator" or select the [brain-circuit](https://lucide.dev/icons/brain-circuit) icon in the left sidebar.
- Use the [file](https://lucide.dev/icons/file-plus-2) and [folder](https://lucide.dev/icons/folder-plus) icons to add notes and folders.
  - Adding a folder adds all of the notes inside it, as well as any notes in its subfolders. If you select an extremely large folder (thousands of files and hundreds of subfolders), it could take a few seconds for it to be added.
- Use the [x](https://lucide.dev/icons/x) icon to remove individual notes/folders and the [book](https://lucide.dev/icons/book-x) icon to remove everything.
- Once you've added your notes and/or folders, select the [webhook](https://lucide.dev/icons/webhook) icon to generate the questions.
  - The Quiz UI will open automatically when the generation is complete (it usually takes at least a few seconds).
  - The generation time may vary based on the length of your notes and the number of questions to generate.

### Saving

- Saved questions will be in a Markdown file named "Quiz [number]" in the folder specified by the "Save location" setting.
- Select the [save](https://lucide.dev/icons/save) icon to save the current question.
- Select the [save-all](https://lucide.dev/icons/save-all) icon to save all questions.
- If the "Automatically save questions" setting is enabled, all questions will be immediately saved upon generation.

### Miscellaneous

- Select the [scroll](https://lucide.dev/icons/scroll-text) icon in the Generator UI to re-open the most recently generated quiz.
- I recommend saving all generated questions because you cannot re-open them in the Quiz UI once you close the Generator UI.

## Coming Soon

I'm actively working on bringing more features and improvements to Quiz Generator. Stay tuned for the following upcoming updates:

### Sequentially Being Developed

- **Math Mode:** Generate questions from notes that contain LaTeX.
- **Quiz Revisiting:** Re-open saved questions in the interactive Quiz UI.
- **Improved Folders:** Added folders have a dropdown that display the notes they contain.
- **More Question Types:** Fill in the blank, matching, essay/long answer, and select all that apply.
- **Dynamic Analysis:** Get real-time feedback on your response to short/long answer questions.
- **Adjustable Difficulty:** Set the difficulty of generated questions.
- **Question Randomization:** Randomize the question order each time you open the Quiz UI.
- **Advanced Question Types:** Numerical response and image-based.
- **Tag Adder**: Add notes by tag.
- **Note Links:** Adding a note also adds the notes it links to.
- **Extended Files:** Generate questions from PDF and image files.

### Concurrently Being Developed

- **Question Variety:** Customization options to control the question style and what it assesses.
- **Quality of Life:** Reducing token usage while improving question quality.

## Limitations

Make sure the combined token count of your input (selected notes/folders) and expected output (generated questions) does not exceed the context window of your chosen model. Otherwise your input and/or output will be truncated. The number of input tokens is shown in the Generator UI. For the number of output tokens, on average, a multiple choice question is ~60 tokens, a true/false question is ~30 tokens, and a short answer question is ~100 tokens. I recommend leaving at least 10% of the context window unused to be safe.

## Issues and Feature Requests

If you encounter any errors or have feature requests, please open an issue on the [GitHub repository](https://github.com/ECuiDev/obsidian-quiz-generator/issues).
