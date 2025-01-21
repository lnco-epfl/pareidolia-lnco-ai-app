export type SequencingSettings = {
  skipInstructions: boolean;
  skipPractice: boolean;
};

export type DurationSettings = {
  numberOfImages: number;
  numberOfRounds: number;
};

export type PhotoDiodeSettings = {
  usePhotoDiode: 'top-left' | 'top-right' | 'customize' | 'off';
  photoDiodeLeft?: string;
  photoDiodeTop?: string;
  photoDiodeHeight?: string;
  photoDiodeWidth?: string;
  testPhotoDiode?: boolean;
};

export type ConfigurationSettings = {
  skipCalibration: boolean;
  skipDevice: boolean;
  forceDevice: boolean;
  hardImageSize: string;
  usePhotoDiode: 'top-left' | 'top-right' | 'off';
  addConfidenceQuestion: boolean;
  displayWindow: number;
  continueButtonDelay: number;
  fontSize: 'small' | 'normal' | 'large' | 'extra-large';
};
export enum AllowedLanguages {
  English = 'en',
  German = 'de',
  French = 'fr',
}

export type LanguageSettings = {
  language: AllowedLanguages;
};

export type NextStepSettings = {
  linkToNextPage: boolean;
  title: string;
  description: string;
  link: string;
  linkText: string;
};
