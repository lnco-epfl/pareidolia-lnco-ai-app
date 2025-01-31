import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import SurveyLikertPlugin from '@jspsych/plugin-survey-likert';
import { JsPsych } from 'jspsych';

import { KeySettings } from '@/modules/config/appSettings';

import { type ImageDescription, type Timeline } from './experiment';

/**
 * @function generatePracticeTimelineVars
 * @description Generate Timeline variables for the experiment.
 * For each trial, "num" is a random number between 1 and 40, sampled without replacement.
 * @param { JsPsych } jsPsychComponent - The jsPsych instance
 * @returns { ImageDescription[] } - Array of image descriptions
 */
const generatePracticeTimelineVars = (jsPsych: JsPsych): ImageDescription[] => {
  const timelineVariables: ImageDescription[] = [];

  // Generate an array of numbers from 1 to 40
  const numPool = Array.from({ length: 3 }, (_, i) => i + 1);

  // Sample numbers without replacement
  const sampledNums: number[] = jsPsych.randomization.sampleWithoutReplacement(
    numPool,
    3,
  );

  for (let i = 0; i < 3; i += 1) {
    timelineVariables.push({
      num: sampledNums[i], // Random number from the sampled list
      blackscreenJitter: (Math.random() - 0.5) * 300, // Random jitter between -150 and 150
    } as ImageDescription);
  }
  return timelineVariables;
};

/**
 * @function partofexp
 * @description Creates a Timeline for one half of the numerosity task experiment. Each half consists of a series of blocks where images representing different numerosities (5, 6, 7, 8) are displayed in a random order. This ensures that no identical images are shown within the same experiment.
 *
 * The Timeline includes:
 * - A black screen before stimuli presentation, with a customizable jitter duration.
 * - A crosshair displayed for 500ms before each image.
 * - A stimulus image shown for 250ms.
 * - A black screen following the image display.
 * - A survey asking participants to estimate the number of countable items (either people or objects) they observed.
 *
 * @param {JsPsych} jsPsych - The jsPsych instance used to manage the experiment Timeline.
 * @param {'practice' | 'test'} cntable - The condition to be used in the experiment.
 * @param {number} nbBlocks - The number of blocks to be included in one half of the experiment.
 * @param {{ device: SerialPort | USBDevice | null, sendTriggerFunction: (device: SerialPort & USBDevice | null, trigger: string) => Promise<void> }} deviceInfo - An object containing the connected device (either `SerialPort` or `USBDevice`, or `null`) and a function to send triggers to the device.
 * @param {((device: SerialPort | null, trigger: string) => Promise<void>) | ((device: USBDevice | null, trigger: string) => Promise<void>)} sendTriggerFunction - A function that sends a trigger to the connected device, applicable to either `SerialPort` or `USBDevice`.
 *
 * @returns {Timeline} - The Timeline configuration object for one half of the numerosity task experiment.
 */
export const practiceTrials: (
  jsPsych: JsPsych,
  usePhotoDiode: 'top-left' | 'top-right' | 'off',
  confidenceQuestion: boolean,
  displayWindow: number,
  keySettings: KeySettings,
  deviceInfo: {
    device: SerialPort | USBDevice | null;
    sendTriggerFunction: (
      device: SerialPort | USBDevice | null,
      trigger: string,
    ) => Promise<void>;
  },
) => Timeline = (
  jsPsych: JsPsych,
  usePhotoDiode: 'top-left' | 'top-right' | 'off',
  confidenceQuestion: boolean,
  displayWindow: number,
  keySettings: KeySettings,
  deviceInfo: {
    device: SerialPort | USBDevice | null;
    sendTriggerFunction: (
      device: SerialPort | USBDevice | null,
      trigger: string,
    ) => Promise<void>;
  },
): Timeline => ({
  timeline: [
    // Blackscreen before stimuli
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: '',
      choices: 'NO_KEYS',
      trial_duration: (): number =>
        500 + jsPsych.evaluateTimelineVariable('blackscreenJitter'),
      on_start: (): void => {
        deviceInfo.sendTriggerFunction(deviceInfo.device, '0');
        document.body.style.cursor = 'none';
      },
    },
    // Crosshair shown before each image for 500ms.
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `
          <div>
            <div class="task-img" style="display:flex; align-items:center; margin:0 auto;"><p style="font-size: 3cm; margin: auto;">+</p></div>
            <div class='photo-diode photo-diode-black ${usePhotoDiode === 'top-left' ? 'top-left' : 'top-right'} ${usePhotoDiode === 'off' ? 'photo-diode-hide' : ''}'/>
          </div>`,
      choices: 'NO_KEYS',
      trial_duration: 500,
      on_start: (): void => {
        deviceInfo.sendTriggerFunction(deviceInfo.device, '1');
        document.body.style.cursor = 'none';
      },
    },
    // Image is shown for 250ms
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus() {
        const html = `<div>
            <div class="task-img"><img class="task-img" id="task-img" src='./assets/pareidolia-imgs/practice/${jsPsych.evaluateTimelineVariable('num')}-practice.png' alt='task image'/></div>
            <div class="task-text"><b>${keySettings.noFaceKey.toUpperCase()}: No Face</b><b>${keySettings.faceKey.toUpperCase()}: Face</b></div>
            <div class='photo-diode photo-diode-white ${usePhotoDiode === 'top-left' ? 'top-left' : 'top-right'} ${usePhotoDiode === 'off' ? 'photo-diode-hide' : ''}'/>
          </div>`;
        return html;
      },
      choices: [keySettings.noFaceKey, keySettings.faceKey],
      on_load: (): void => {
        deviceInfo.sendTriggerFunction(deviceInfo.device, '2');
        document.body.style.cursor = 'none';
        const image = document.getElementById('task-img');
        setTimeout(() => {
          if (image) {
            image.style.display = 'none';
          }
        }, displayWindow * 1000);
      },
    },

    // Blackscreen after image
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `<div class='photo-diode photo-diode-black ${usePhotoDiode === 'top-left' ? 'top-left' : 'top-right'} ${usePhotoDiode === 'off' ? 'photo-diode-hide' : ''}'/>`,
      choices: 'NO_KEYS',
      trial_duration: 500,
      on_start: (): void => {
        deviceInfo.sendTriggerFunction(deviceInfo.device, '3');
        document.body.style.cursor = 'none';
      },
      on_finish: (): void => {
        document.body.style.cursor = 'auto';
      },
    },
    {
      timeline: [
        {
          type: SurveyLikertPlugin,
          questions: [
            {
              prompt: 'How confidence are you about your response?',
              required: true,
              labels: [
                '1 - Not Confidenct',
                '2',
                '3',
                '4',
                '5 - Very Confident',
              ],
            },
          ],
        },
      ],
      conditional_function() {
        return confidenceQuestion;
      },
    },
  ],

  // Generate random Timeline variables (pick random images for each numerosity).
  timeline_variables: generatePracticeTimelineVars(jsPsych),
});
