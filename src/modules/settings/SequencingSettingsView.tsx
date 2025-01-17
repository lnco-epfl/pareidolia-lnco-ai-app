import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import {
  FormControlLabel,
  Radio,
  RadioGroup,
  Switch,
  Typography,
} from '@mui/material';
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
  const { skipInstructions, condition } = sequencingSettings || {
    skipInstructions: false,
    condition: 'test',
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
      <Stack>
        <Typography variant="h6">
          {t('SETTINGS.SEQUENCING.CONDITION')}
        </Typography>
        <RadioGroup
          aria-labelledby="demo-radio-buttons-group-label"
          defaultValue="test"
          name="radio-buttons-group"
          row
          value={condition}
          onChange={(e) =>
            onChange({
              ...sequencingSettings,
              condition: e.target.value as SequencingSettings['condition'],
            })
          }
        >
          <FormControlLabel
            value="practice"
            control={<Radio />}
            label="Practice (3 images)"
          />
          <FormControlLabel
            value="test"
            control={<Radio />}
            label="Test (40 images)"
          />
        </RadioGroup>
      </Stack>
    </Stack>
  );
};

export default SequencingSettingsView;
