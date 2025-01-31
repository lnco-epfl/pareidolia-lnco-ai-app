import HtmlButtonResponsePlugin from '@jspsych/plugin-html-button-response';
import jsPsychinstructions from '@jspsych/plugin-instructions';
import jsPsychSurveyMultiChoice from '@jspsych/plugin-survey-multi-choice';
import i18next from 'i18next';
import { DataCollection, JsPsych } from 'jspsych';

import { KeySettings } from '@/modules/config/appSettings.js';

// Import styles and language functions
import { type Timeline } from './experiment.js';
import * as langf from './languages.js';
import { activateMQCunderline } from './utils.js';

/**
 * @function generateInstructionPages
 * @description Generate instruction pages based on the type of countable (people/objects).
 * If example is true, it generates the example page with a video.
 * @param { 'people' | 'objects' } cntable - The type of countable (people or objects)
 * @returns { string[] } - Array of instruction pages as HTML strings
 */
function generateInstructionPages(keySettings: KeySettings): string[] {
  const instructionImages: string[] = [
    `
    <img class="inst-monitor" src="./assets/instruction-media/monitor-crosshair.png" alt="computer monitor pictogram">`,
    `
    <img class="inst-monitor" src="./assets/instruction-media/monitor-crosshair.png" alt="computer monitor pictogram">
    <img class="inst-screen" src="./assets/instruction-media/screen.jpg" alt='task image'>`,
    `
    <img class="inst-monitor" src="./assets/instruction-media/monitor-crosshair.png" alt="computer monitor pictogram">
    <img class="inst-keys" src="./assets/instruction-media/key-presses.jpg" alt='task image'>`,
  ];

  const pages: string[] = [];
  for (let pageNumber: number = 0; pageNumber < 3; pageNumber += 1) {
    pages.push(
      `          
      <h3>${i18next.t('instructionTitle')}</h3>
      <div class="inst-container">
        <div class="inst-graphic">
          ${instructionImages[pageNumber]}
        </div>
          <p class="inst-text"><b>${i18next.t('instructionTexts', { returnObjects: true, facekey: keySettings.faceKey.toUpperCase(), nofacekey: keySettings.noFaceKey.toUpperCase() })[pageNumber]}</b></p>
      </div>`,
    );
  }
  pages.push(
    `         
    <h3>${i18next.t('instructionTitle')}</h3>
    <div class="inst-container">
      <div class="inst-graphic">
        <div class="group-monitors"">
          ${instructionImages[0]}
        </div>
        <div class="group-monitors"">
          ${instructionImages[1]}
        </div>
        <div class="group-monitors"">
          ${instructionImages[2]}
        </div>
      </div>
      <p class="inst-text"><b>${i18next.t('instructionTexts', { returnObjects: true, facekey: keySettings.faceKey.toUpperCase(), nofacekey: keySettings.noFaceKey.toUpperCase() })[3]}</b></p>
    </div>`,
  );
  pages.push(
    `
        <h3>${i18next.t('instructionTitle')}</h3>
        <div class="inst-container">
          <div class="inst-graphic">
            ${instructionImages[2]}
          </div>
            <p class="inst-text"><b>${i18next.t('instructionTexts', { returnObjects: true, facekey: keySettings.faceKey.toUpperCase(), nofacekey: keySettings.noFaceKey.toUpperCase() })[4]}</b></p>
        </div>`,
  );
  return pages;
}

/**
 * @function instructions
 * @description Create instruction timeline based on the type of countable.
 * Combines both text and example (video) instructions.
 * @param { 'people' | 'objects' } cntable - The type of countable (people or objects)
 * @returns { Timeline } - Timeline for instructions
 */
function instructions(
  continueButtonDelay: number,
  keySettings: KeySettings,
): Timeline {
  return {
    timeline: [
      {
        type: jsPsychinstructions,
        pages: generateInstructionPages(keySettings),
        button_label_next: i18next.t('instructionBtnNext'),
        button_label_previous: i18next.t('instructionBtnPrevious'),
        show_clickable_nav: true,
        on_page_change() {
          const button = document.getElementById(
            'jspsych-instructions-next',
          ) as HTMLButtonElement;
          if (button && continueButtonDelay) {
            button.disabled = true;
            setTimeout(() => {
              button.disabled = false;
            }, continueButtonDelay * 1000);
          }
        },
        on_load() {
          const button = document.getElementById(
            'jspsych-instructions-next',
          ) as HTMLButtonElement;
          if (button && continueButtonDelay) {
            button.disabled = true;
            setTimeout(() => {
              button.disabled = false;
            }, continueButtonDelay * 1000);
          }
        },
      },
    ],
  };
}

/**
 * @function instructionQuiz
 * @description Instruction quiz timeline with looping functionality until correct answers are given.
 * @param { 'people' | 'objects' } cntable - The type of countable (people or objects)
 * @returns { timeline } - Timeline for instruction quiz
 */
const instructionQuiz: (
  jsPsych: JsPsych,
  keySettings: KeySettings,
) => Timeline = (jsPsych: JsPsych, keySettings: KeySettings): Timeline => ({
  timeline: [
    {
      type: jsPsychSurveyMultiChoice,
      questions: langf.quizQuestions(1, keySettings),
      preamble: `<h3>${i18next.t('quizPreamble')}</h3><br><br><button id="quiz-repeat-btn" class="jspsych-btn">${i18next.t('repeatInstructionsButton')}</button>`,
      button_label: i18next.t('estimateSubmitBtn'),
    },
    {
      timeline: [
        {
          type: jsPsychSurveyMultiChoice,
          questions: langf.quizQuestions(2, keySettings),
          preamble: `<h3>${i18next.t('quizPreamble')}</h3><br><br><button id="quiz-repeat-btn" class="jspsych-btn">${i18next.t('repeatInstructionsButton')}</button>`,
          button_label: i18next.t('estimateSubmitBtn'),
        },
      ],
      conditional_function(): boolean {
        // Do not display the second question when 'repeat instructions' button was pressed during the first
        return (
          jsPsych.data.getLastTimelineData().values()[0].response.Q0 !==
          'read-again'
        );
      },
    },
  ],
  on_load: (): void => {
    // make repeat instruction button fulfill its function (answer is "read-again" when button is pressed)
    document
      .getElementById('quiz-repeat-btn')!
      .addEventListener('click', (): void => {
        jsPsych.finishTrial({
          response: { Q0: 'read-again' },
        });
      });

    // make selected choice underlined
    activateMQCunderline();
  },
});

/**
 * @function returnPage
 * @description Generates a timeline object for displaying a return page based on the specified countable type.
 * The return page is conditional based on the user's previous response.
 * @param {JsPsych} jsPsych - The jsPsych instance.
 * @param {'people' | 'objects'} cntable - The type of countable (people or objects).
 * @returns {timeline} - An object representing the timeline for the return page.
 */
const returnPage: (jsPsych: JsPsych, keySettings: KeySettings) => Timeline = (
  jsPsych: JsPsych,
  keySettings: KeySettings,
): Timeline => ({
  timeline: [
    {
      type: HtmlButtonResponsePlugin,
      stimulus: `<h3><b>${i18next.t('repeatInstructions')}</b></h3>`,
      choices: [i18next.t('repeatInstructionsButton')],
      on_load: () => {
        // Default text says that you made a mistake, text is removed when "repeat instructions" button was pressed
        const stimulus = document.getElementById(
          'jspsych-html-button-response-stimulus',
        );
        if (
          stimulus &&
          ((jsPsych.data.getLastTimelineData().values()[0] &&
            jsPsych.data.getLastTimelineData().values()[0].response.Q0 ===
              'read-again') ||
            (jsPsych.data.getLastTimelineData().values()[1] &&
              jsPsych.data.getLastTimelineData().values()[1].response.Q0 ===
                'read-again'))
        ) {
          stimulus.style.display = 'none';
        }
      },
    },
  ],
  conditional_function(): boolean {
    /* Only display the return page, which starts the repeat of the instructions, when a question was answered incorrectly 
       or the "repeat instructions" button was pressed (also stored as incorrect answer)
    */
    return (
      jsPsych.data.get().last(3).values()[1].response.Q0 !==
        langf.quizQuestions(1, keySettings)[0].options[2] ||
      jsPsych.data.get().last(3).values()[2].response.Q0 !==
        langf.quizQuestions(2, keySettings)[0].options[2]
    );
  },
});

/**
 * @function groupInstructions
 * @description Generates a timeline object for displaying group instructions including the instruction text,
 * instruction quiz, and return page based on the countable type and experiment phase.
 * @param {JsPsych} jsPsych - The jsPsych instance.
 * @param {'people' | 'objects'} cntable - The type of countable (people or objects).
 * @param {boolean} [secondHalf=false] - Indicates if it is the second half of the experiment.
 * @returns {Timeline} - An object representing the timeline for the group instructions.
 */
export const groupInstructions: (
  jsPsych: JsPsych,
  continueButtonDelay: number,
  keySettings: KeySettings,
) => Timeline = (
  jsPsych: JsPsych,
  continueButtonDelay: number,
  keySettings: KeySettings,
): Timeline => ({
  timeline: [
    instructions(continueButtonDelay, keySettings),
    instructionQuiz(jsPsych, keySettings),
    returnPage(jsPsych, keySettings),
  ],
  loop_function(data: DataCollection): boolean {
    // Loop function that repeats instructions when a question was incorrect or 'repeat instructions' was selected
    return (
      data.last(3).values()[1].response.Q0 !==
        langf.quizQuestions(1, keySettings)[0].options[2] ||
      data.last(3).values()[2].response.Q0 !==
        langf.quizQuestions(2, keySettings)[0].options[2]
    );
  },
  on_finish: (): void => {
    // eslint-disable-next-line no-param-reassign
    jsPsych.getDisplayElement().innerHTML = '';
  },
});

/**
 * @function tipScreen
 * @description Generates a timeline object for displaying a tip screen.
 * @returns {timeline} - An object representing the timeline for the tip screen.
 */
export function tipScreen(): Timeline {
  return {
    timeline: [
      {
        type: HtmlButtonResponsePlugin,
        stimulus: `<h3>${i18next.t('tipTitle')}</h3><br><img src="./assets/instruction-media/tip.png" alt='tip image' style="width: 20vw;"><br><p>${i18next.t('tipDescription')}</p><br><br>`,
        choices: [i18next.t('tipBtnTxt')],
      },
    ],
  };
}
