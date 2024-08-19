# Quiz Generator

[![Downloads](https://img.shields.io/github/downloads/ECuiDev/obsidian-quiz-generator/total?style=for-the-badge&labelColor=21262d&color=238636)](https://github.com/ECuiDev/obsidian-quiz-generator/releases) [![Release](https://img.shields.io/github/v/release/ECuiDev/obsidian-quiz-generator?display_name=tag&style=for-the-badge&logo=github&labelColor=21262d&color=1f6feb)](https://github.com/ECuiDev/obsidian-quiz-generator/releases/latest)

**Quiz Generator** is a plugin for [Obsidian](https://obsidian.md/) that leverages the power of OpenAI's GPT-3.5 and GPT-4 models to automatically generate interactive, exam-style questions (with answers) based on your notes. Whether you're a student looking to quiz yourself or an educator creating assessments, this plugin streamlines the question creation process.

![Demo](assets/Demo.gif)

## Features

- **Personalized Questions:** Select any combination of notes and folders to use as the quiz content. Preview the selected notes and folders to see their content before generating your questions.
- **Customizable Generation:** Choose the type(s) and number of questions to generate.
- **Multiple Question Types:** True or false, multiple choice, select all that apply, fill in the blank, matching, short answer, and long answer are all supported. Mix and match them to best suit your needs for an effective assessment.
- **Interactive UI:** Answer generated questions in an interactive UI that provides real-time feedback on correctness.
- **Question Saving:** Save generated questions in either of the following formats.
  - Inline and multiline flashcards to review with [obsidian-spaced-repetition](https://github.com/st3v3nmw/obsidian-spaced-repetition).
  - Markdown callouts for seamless integration with your notes.
- **Reviewable Quizzes:** Review saved questions using the interactive UI (you can also create your own questions from scratch and open them in the UI without ever using the generator).
- **Multiple Languages:** Generate questions in 21 different languages.
- **Math Support:** Generate questions from notes that contain LaTeX.
- **Model Options:** Choose between OpenAI's latest models, depending on your needs.
  - `GPT-3.5 Turbo` (16k token context window): Ideal for fast response times and efficient question generation. Perfect for handling moderate-sized notes and everyday educational tasks.
  - `GPT-4 Turbo` (128,000 token context window): Suited for generating questions from extensive notes and complex materials. Offers in-depth question generation, making it great for detailed assessments and advanced study.
  - `GPT-4o Mini` (128,000 token context window): The optimal choice for balancing speed and performance. Versatile for a wide range of educational tasks, providing solid depth without compromising efficiency.
  - `GPT-4o` (128,000 token context window): Delivers the most comprehensive and detailed question generation. Excellent for handling intricate content and creating nuanced questions for thorough study and advanced assessments.

## Usage

### Installation

This plugin is now available in the **Community plugins** page in Obsidian. You can install it using either of the following methods.

#### Obsidian Installation

1. Install the plugin from the **Community plugins** page in Obsidian.
   - **Settings** → **Community plugins** → **Browse**.
   - Search for `Quiz Generator`.
   - Select the plugin to open its page and then select **Install**.
   - Select **Enable** on the plugin page or go back to the **Community plugins** page and toggle the switch.
2. Open the plugin settings and enter your API key.
   - If you don't have an API key, create an account at [OpenAI](https://platform.openai.com/) and retrieve your API key from [API keys](https://platform.openai.com/api-keys).
3. Configure the other settings as desired.

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
- Select the [file](https://lucide.dev/icons/file-plus-2) and [folder](https://lucide.dev/icons/folder-plus) icons to add notes and folders.
  - Adding a folder adds all the notes inside it, as well as any notes in its subfolders (can be changed in the settings). If you select an extremely large folder (thousands of files and hundreds of subfolders), it could take a few seconds for it to be added.
- Select the [eye](https://lucide.dev/icons/eye) icon to view the contents of selected notes and folders.
- Select the [x](https://lucide.dev/icons/x) icon to remove individual notes or folders and the [book](https://lucide.dev/icons/book-x) icon to remove everything.
- Once you've added your notes and/or folders, select the [webhook](https://lucide.dev/icons/webhook) icon to generate the questions.
  - The quiz UI will open automatically when the generation is complete.

### Saving

- Saved questions will be in a Markdown file named "Quiz [number]" in the folder specified by the "Save location" setting.
- Select the [save](https://lucide.dev/icons/save) icon to save the current question.
- Select the [save-all](https://lucide.dev/icons/save-all) icon to save all questions.
- If the "Automatically save questions" setting is enabled, all questions will be immediately saved upon generation.

### Reviewing Saved Quizzes

- Open the command palette and select "Quiz Generator: Open quiz from active note" or right-click a note in the file explorer and select "Open quiz from this note" in the file menu.

### Miscellaneous

- Select the [scroll](https://lucide.dev/icons/scroll-text) icon in the generator UI to re-open the most recently generated quiz.

### Manually Creating or Modifying Questions

If you want to write your own questions from scratch or modify any saved questions, they must follow the format below to be opened in the quiz UI. However, deviations in spacing and capitalization are okay (the parser is case-insensitive and ignores whitespace).

Text enclosed by curly braces is required but can be anything. Text enclosed by angle brackets is optional and can be anything. Any other text (not enclosed by either) should be written as shown. You are allowed to make any of the callouts foldable by adding a plus or minus. For spaced repetition, you are allowed to bold or italicize the question type identifier using any combination of asterisks and underscores.

#### True or False Format

**Callout**
```
> [!question] {Insert your question here}
>> [!success] <Answer>
>> One of true or false

> [!question] HTML is a programming language.
>> [!success]- Answer
>> False
```

**Spaced Repetition**
```
True or False: {Insert your question here} Insert inline separator you chose in the settings One of true or false

True or False: HTML is a programming language. :: False
```

#### Multiple Choice Format

Supports up to 26 choices, denoted by the 26 letters of the English alphabet. You should use the letters in alphabetical order starting from "a" and not reuse letters or things may break. The example below uses 4 choices.

**Callout**
```
> [!question] {Insert your question here}
> a) {Choice 1}
> b) {Choice 2}
> c) {Choice 3}
> d) {Choice 4}
>> [!success] <Answer>
>> One of a), b), c), etc. <text of the correct choice>

> [!question] Which of the following is the correct translation of house in Spanish?
> a) Casa
> b) Maison
> c) Haus
> d) Huis
>> [!success]- Answer
>> a) Casa
```

**Spaced Repetition**
```
Multiple Choice: {Insert your question here}
a) {Choice 1}
b) {Choice 2}
c) {Choice 3}
d) {Choice 4}
Insert multiline separator you chose in the settings
One of a), b), c), etc. <text of the correct choice>

Multiple Choice: Which of the following is the correct translation of house in Spanish?
a) Casa
b) Maison
c) Haus
d) Huis
?
a) Casa
```

#### Select All That Apply Format

Supports up to 26 choices, denoted by the 26 letters of the English alphabet. There must be at least 2 correct answers or this will be treated as a multiple choice question by the UI. You should use the letters in alphabetical order starting from "a" and not reuse letters or things may break. The example below uses 5 choices.

**Callout**
```
> [!question] {Insert your question here}
> a) {Choice 1}
> b) {Choice 2}
> c) {Choice 3}
> d) {Choice 4}
> e) {Choice 5}
>> [!success] <Answer>
>> One of a), b), c), etc. <text of the correct choice>
>> One of a), b), c), etc. <text of the correct choice>

> [!question] Which of the following are elements on the periodic table?
> a) Oxygen
> b) Water
> c) Hydrogen
> d) Salt
> e) Carbon
>> [!success]- Answer
>> a) Oxygen
>> c) Hydrogen
>> e) Carbon
```

**Spaced Repetition**
```
Select All That Apply: {Insert your question here}
a) {Choice 1}
b) {Choice 2}
c) {Choice 3}
d) {Choice 4}
e) {Choice 5}
Insert multiline separator you chose in the settings
One of a), b), c), etc. <text of the correct choice>
One of a), b), c), etc. <text of the correct choice>

Select All That Apply: Which of the following are elements on the periodic table?
a) Oxygen
b) Water
c) Hydrogen
d) Salt
e) Carbon
?
a) Oxygen
c) Hydrogen
e) Carbon
```

#### Fill in the Blank Format

Supports an infinite number of blanks. The question must contain at least 1 blank, represented as one or more underscores enclosed by backticks. The answer(s) should appear in the same order as the blank(s) they correspond to. So the first answer corresponds to the first blank, the second answer to the second blank, and so on.

The answer(s) to the blank(s) must be separated by commas with at least 1 space after the comma. This spacing condition exists because it allows the parser to recognize the entirety of a large number as a single answer (since numbers greater than 3 digits typically have commas).

**Callout**
```
> [!question] {Insert your question here}
>> [!success] <Answer>
>> Comma separated list of answer(s)

> [!question] The Battle of `____` was fought in `____`.
>> [!success]- Answer
>> Gettysburg, 1863
```

**Spaced Repetition**
```
Fill in the Blank: {Insert your question here} Insert inline separator you chose in the settings Comma separated list of answer(s)

Fill in the Blank: The Battle of `____` was fought in `____`. :: Gettysburg, 1863
```

#### Matching Format

Supports up to 13 pairs (i.e. 26 choices total, 13 on each "side"). The first group should use the letters a to m and the second group should use the letters n to z. Both groups should use the letters in alphabetical order and not reuse letters or things may break. The answer to a pair is represented as a letter from the first group followed by a letter from the second group, separated by an arrow (one or more hyphens followed by a right angle bracket). The letter from the first group must come first, but you may list the pairs in any order. The example below uses 4 pairs.

**Callout**
```
> [!question] {Insert your question here}
>> [!example] <Group A>
>> a) {Choice 1}
>> b) {Choice 2}
>> c) {Choice 3}
>> d) {Choice 4}
>
>> [!example] <Group B>
>> n) {Choice 5}
>> o) {Choice 6}
>> p) {Choice 7}
>> q) {Choice 8}
>
>> [!success] <Answer>
>> One of a), b), c), etc. -> One of n), o), p), etc.
>> One of a), b), c), etc. -> One of n), o), p), etc.
>> One of a), b), c), etc. -> One of n), o), p), etc.
>> One of a), b), c), etc. -> One of n), o), p), etc.

> [!question] Match the medical term to its definition.
>> [!example] Group A
>> a) Hypertension
>> b) Bradycardia
>> c) Tachycardia
>> d) Hypotension
>
>> [!example] <Group B>
>> n) Fast heart rate
>> o) High blood pressure
>> p) Low blood pressure
>> q) Slow heart rate
>
>> [!success]- Answer
>> a) -> o)
>> b) -> q)
>> c) -> n)
>> d) -> p)
```

**Spaced Repetition**
```
Matching: {Insert your question here}
{Group A}
a) {Choice 1}
b) {Choice 2}
c) {Choice 3}
d) {Choice 4}
{Group B}
n) {Choice 5}
o) {Choice 6}
p) {Choice 7}
q) {Choice 8}
Insert multiline separator you chose in the settings
One of a), b), c), etc. -> One of n), o), p), etc.
One of a), b), c), etc. -> One of n), o), p), etc.
One of a), b), c), etc. -> One of n), o), p), etc.
One of a), b), c), etc. -> One of n), o), p), etc.

Matching: Match the medical term to its definition.
Group A
a) Hypertension
b) Bradycardia
c) Tachycardia
d) Hypotension
Group B
n) Fast heart rate
o) High blood pressure
p) Low blood pressure
q) Slow heart rate
?
a) -> o)
b) -> q)
c) -> n)
d) -> p)
```

#### Short Answer Format

**Callout**
```
> [!question] {Insert your question here}
>> [!success] <Answer>
>> {Insert answer here}

> [!question] Who was the first President of the United States and what is he commonly known for?
>> [!success]- Answer
>> George Washington was the first President of the United States and is commonly known for leading the American Revolutionary War and serving two terms as president.
```

**Spaced Repetition**
```
Short Answer: {Insert your question here} Insert inline separator you chose in the settings {Insert answer here}

Short Answer: Who was the first President of the United States and what is he commonly known for? :: George Washington was the first President of the United States and is commonly known for leading the American Revolutionary War and serving two terms as president.
```

#### Long Answer Format

**Callout**
```
> [!question] {Insert your question here}
>> [!success] <Answer>
>> {Insert answer here}

> [!question] Explain the difference between a stock and a bond, and discuss the risks and potential rewards associated with each investment type.
>> [!success]- Answer
>> A stock represents ownership in a company and a claim on part of its profits. The potential rewards include dividends and capital gains if the company's value increases, but the risks include the possibility of losing the entire investment if the company fails. A bond is a loan made to a company or government, which pays interest over time and returns the principal at maturity. Bonds are generally considered less risky than stocks, as they provide regular interest payments and the return of principal, but they offer lower potential returns.
```

**Spaced Repetition**
```
Long Answer: {Insert your question here} Insert inline separator you chose in the settings {Insert answer here}

Long Answer: Explain the difference between a stock and a bond, and discuss the risks and potential rewards associated with each investment type. :: A stock represents ownership in a company and a claim on part of its profits. The potential rewards include dividends and capital gains if the company's value increases, but the risks include the possibility of losing the entire investment if the company fails. A bond is a loan made to a company or government, which pays interest over time and returns the principal at maturity. Bonds are generally considered less risky than stocks, as they provide regular interest payments and the return of principal, but they offer lower potential returns.
```

## Coming Soon

I'm actively working on bringing more features and improvements to Quiz Generator. Stay tuned for the following upcoming updates:

### Next Release

- **Generation Details:** Save links to notes used for quiz generation.
- **Dynamic Analysis:** Get real-time feedback on your response to short and long answer questions.
- **More Models:** Support for Google Gemini, Anthropic Claude, OpenRouter, PerplexityAI, and Cohere.

### Future Releases

- **Better Question Creation:** Custom UI to streamline creating your own questions from scratch.
- **Callout Aliases:** Specify what callout type identifiers you want to use.
- **Randomize Choices:** Randomize order in which choices for multiple choice and select all that apply questions are displayed.
- **New Question Type:** Categorization questions.
- **Save Format Conversion Tool:** Convert saved questions between callout and spaced repetition format.
- **Anki Integration:** Sync questions with Anki and vice versa.
- **Homepage:** Access all your saved quizzes from a custom homepage UI.
- **Test Mode:** Take quizzes with a time limit and receive a score at the end.
- **Adjustable Difficulty:** Set the difficulty of generated questions.
- **Custom View:** Embed the quiz UI directly inside your notes.
- **Advanced Generation:** Control the number of choices, blanks, and pairs to generate.
- **Tag Adder:** Add notes by tag.
- **Dataview Adder:** Add notes using [Dataview](https://github.com/blacksmithgu/obsidian-dataview) queries.
- **Responsive UI:** Freely resize and move the UI.
- **Advanced Question Types:** Numerical response and image-based.
- **Note Links:** Adding a note also adds the notes it links to.
- **Extended Files:** Generate questions from PDF and image files.
- **Question Variety:** Customization options to control the question scope and what it assesses.
- **Quality of Life:** Reducing token usage while improving question quality.

## Issues and Feature Requests

If you encounter any errors or have feature requests, please open an issue on the [GitHub repository](https://github.com/ECuiDev/obsidian-quiz-generator/issues).
