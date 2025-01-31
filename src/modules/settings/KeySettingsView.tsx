import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import Stack from '@mui/material/Stack';

import { KeySettings } from '@/modules/config/appSettings';

type KeySettingsViewProps = {
  keySettings: KeySettings;
  onChange: (newSetting: KeySettings) => void;
};

const KeySettingsView: FC<KeySettingsViewProps> = ({
  keySettings,
  onChange,
}) => {
  const { t } = useTranslation();
  const { faceKey, noFaceKey } = keySettings || {
    faceKey: 'L',
    noFaceKey: 'A',
  };
  const [keyChangeModal, setKeyChangeModalOpen] = useState(false);
  const [currentKeySetting, setCurrentKeySetting] = useState<
    'faceKey' | 'noFaceKey' | null
  >(null);

  // Function to open modal and set which key is being changed
  const handleKeyChange = (keyType: 'faceKey' | 'noFaceKey'): void => {
    setCurrentKeySetting(keyType);
    setKeyChangeModalOpen(true);
  };

  // Add key listener when modal opens, remove when it closes
  useEffect(() => {
    // Function to handle key selection
    const handleKeyPress = (event: KeyboardEvent): void => {
      event.preventDefault();
      if (currentKeySetting) {
        const newSettings = { ...keySettings, [currentKeySetting]: event.key };
        onChange(newSettings); // Update parent state
        setKeyChangeModalOpen(false); // Close modal
      }
    };
    if (keyChangeModal) {
      window.addEventListener('keydown', handleKeyPress);
    } else {
      window.removeEventListener('keydown', handleKeyPress);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentKeySetting, keyChangeModal, keySettings, onChange]);

  return (
    <Stack spacing={1}>
      <Typography variant="h6">{t('SETTINGS.KEY.SETTINGS.TITLE')}</Typography>
      <Box display="flex" justifyContent="left" alignItems="center" gap="5px">
        <TextField
          value={faceKey.toUpperCase()}
          label={t('SETTINGS.FACE.KEY')}
          disabled
        />
        <Button variant="contained" onClick={() => handleKeyChange('faceKey')}>
          {t('SETTINGS.CHANGE.KEY')}
        </Button>
      </Box>
      <Box display="flex" justifyContent="left" alignItems="center" gap="5px">
        <TextField
          value={noFaceKey.toUpperCase()}
          label={t('SETTINGS.NOFACE.KEY')}
          disabled
        />
        <Button
          variant="contained"
          onClick={() => handleKeyChange('noFaceKey')}
        >
          {t('SETTINGS.CHANGE.KEY')}
        </Button>
      </Box>
      <Dialog
        open={keyChangeModal}
        onClose={() => setKeyChangeModalOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Press the new key</DialogTitle>
      </Dialog>
    </Stack>
  );
};

export default KeySettingsView;
