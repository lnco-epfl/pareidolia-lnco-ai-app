import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { FormControlLabel, Switch, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';

import { SequencingSettings } from '@/modules/config/appSettings';

type SequencingSettingsViewProps = {
  sequencingSettings: SequencingSettings;
  onChange: (newSetting: SequencingSettings) => void;
};

const SequencingSettingsView: FC<SequencingSettingsViewProps> = ({
  sequencingSettings,
  onChange,
}) => {
  const { t } = useTranslation();
  const { skipInstructions, skipPractice } = sequencingSettings || {
    skipInstructions: false,
    skipPractice: false,
  };
  return (
    <Stack spacing={1}>
      <Typography variant="h6">{t('SETTINGS.SEQUENCING')}</Typography>
      <Typography variant="body1">
        {t('SETTINGS.SEQUENCING.SUBTITLE')}
      </Typography>
      <FormControlLabel
        control={<Switch />}
        label={t('SETTINGS.SEQUENCING.SKIPINSTRUCTIONS')}
        onChange={(e, checked) => {
          onChange({
            ...sequencingSettings,
            skipInstructions: checked,
          });
        }}
        checked={skipInstructions}
      />
      <FormControlLabel
        control={<Switch />}
        label={t('SETTINGS.SEQUENCING.SKIPPRACTICETRIALS')}
        onChange={(e, checked) => {
          onChange({
            ...sequencingSettings,
            skipPractice: checked,
          });
        }}
        checked={skipPractice}
      />
    </Stack>
  );
};

export default SequencingSettingsView;
