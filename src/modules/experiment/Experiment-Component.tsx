import { FC, useEffect, useRef, useState } from 'react';

import { Stack, Typography } from '@mui/material';

import { DataCollection, JsPsych } from 'jspsych';

import '../../styles/main.scss';
import useExperimentResults from '../context/ExperimentContext';
import { AllSettingsType, useSettings } from '../context/SettingsContext';
import { run } from './jspsych/experiment';

export const Experiment: FC = () => {
  const jsPsychRef = useRef<null | Promise<JsPsych>>(null);
  const [experimentStarted, setExperimentStarted] = useState<boolean>(false);
  const [experimentDone, setExperimentDone] = useState<boolean>(false);
  const settings = useSettings();

  const { status, experimentResultsAppData, setExperimentResult } =
    useExperimentResults();

  const assetPath = {
    images: [
      'assets/instruction-media/monitor-crosshair.png',
      'assets/instruction-media/screen-test.png',
      'assets/instruction-media/screen-people.png',
      'assets/instruction-media/tip-org.png',
      'assets/instruction-media/tip.png',
      'assets/pareidolia-imgs/test/pareidolia-test-01.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-02.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-03.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-04.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-05.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-06.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-07.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-08.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-09.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-10.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-11.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-12.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-13.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-14.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-15.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-16.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-17.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-18.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-19.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-20.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-21.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-22.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-23.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-24.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-25.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-26.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-27.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-28.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-29.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-30.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-31.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-32.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-33.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-34.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-35.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-36.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-37.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-38.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-39.jpg',
      'assets/pareidolia-imgs/test/pareidolia-test-40.jpg',
      'assets/pareidolia-imgs/practice/pareidolia-practice-01.jpg',
      'assets/pareidolia-imgs/practice/pareidolia-practice-02.jpg',
      'assets/pareidolia-imgs/practice/pareidolia-practice-03.jpg',
    ],
    audio: [],
    video: [
      'assets/instruction-media/test-vid.mp4',
      'assets/instruction-media/people-vid.mp4',
    ],
    misc: ['assets/instruction-media - Shortcut.lnk'],
  };

  const updateData = (
    rawData: DataCollection,
    expSettings: AllSettingsType,
    completed: boolean,
  ): void => {
    let responseArray = [];
    if (experimentResultsAppData && experimentResultsAppData.rawData?.trials) {
      if (experimentResultsAppData.rawData.trials.length < rawData.count()) {
        responseArray = rawData.values();
      } else {
        responseArray = [
          ...rawData.values(),
          ...experimentResultsAppData.rawData.trials.slice(
            rawData.values().length,
          ),
        ];
      }
    } else {
      responseArray = rawData.values();
    }
    setExperimentResult({
      rawData: { trials: responseArray },
      settings: expSettings,
      completed,
    });
  };

  useEffect(() => {
    if (status === 'success' && !experimentResultsAppData) {
      setExperimentResult({
        rawData: { trials: [] },
        settings,
        completed: false,
      });
    } else if (
      experimentResultsAppData &&
      experimentResultsAppData?.completed &&
      !experimentStarted
    ) {
      setExperimentDone(true);
    }
    if (!jsPsychRef.current && experimentResultsAppData && !experimentDone) {
      jsPsychRef.current = run({
        assetPaths: assetPath,
        input: { settings, results: experimentResultsAppData },
        onFinish: updateData,
      });
      setExperimentStarted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    experimentResultsAppData,
    setExperimentResult,
    settings,
    status,
    updateData,
    experimentDone,
    experimentStarted,
  ]);

  return experimentDone ? (
    <Stack bgcolor="white">
      <Typography variant="h5">
        You have previously completed this experiment. Please reach out to the
        experimenter
      </Typography>
    </Stack>
  ) : (
    <div className="jspsych-content-outer-wrapper">
      <div id="jspsych-display-element" className="jspsych-content-outer" />
    </div>
  );
};
