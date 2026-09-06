import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

interface CommunitySortTabsProps {
  activeTab?: 'new' | 'top';
  onTabChange?: (tab: 'new' | 'top') => void;
}

export default function CommunitySortTabs({
  activeTab = 'new',
  onTabChange,
}: CommunitySortTabsProps) {
  const [selected, setSelected] = useState<'new' | 'top'>(activeTab);

  const handleSelect = (tab: 'new' | 'top') => {
    setSelected(tab);
    if (onTabChange) onTabChange(tab);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1.5,
        borderRadius: 3,
        position: 'relative',
        bgcolor: '#1a1a2e',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -48,
          right: -24,
          width: 96,
          height: 96,
          bgcolor: 'rgba(180, 136, 255, 0.14)',
          borderRadius: '50%',
          filter: 'blur(24px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -48,
          left: -24,
          width: 96,
          height: 96,
          bgcolor: 'rgba(180, 136, 255, 0.14)',
          borderRadius: '50%',
          filter: 'blur(24px)',
          pointerEvents: 'none',
        }}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          onClick={() => handleSelect('new')}
          size="small"
          sx={{
            borderRadius: 9999,
            px: 2.5,
            py: 0.75,
            fontSize: '0.8rem',
            fontWeight: selected === 'new' ? 700 : 500,
            textTransform: 'none',
            bgcolor: selected === 'new' ? 'rgba(179, 136, 255, 0.16)' : 'transparent',
            color: selected === 'new' ? 'primary.light' : 'text.secondary',
            boxShadow: selected === 'new' ? '0 2px 12px rgba(179, 136, 255, 0.15)' : 'none',
            '&:hover': {
              bgcolor: selected === 'new' ? 'rgba(179, 136, 255, 0.24)' : 'rgba(255, 255, 255, 0.05)',
              color: 'text.primary',
            },
          }}
        >
          New
        </Button>
        <Button
          onClick={() => handleSelect('top')}
          size="small"
          sx={{
            borderRadius: 9999,
            px: 2.5,
            py: 0.75,
            fontSize: '0.8rem',
            fontWeight: selected === 'top' ? 700 : 500,
            textTransform: 'none',
            bgcolor: selected === 'top' ? 'rgba(179, 136, 255, 0.16)' : 'transparent',
            color: selected === 'top' ? 'primary.light' : 'text.secondary',
            boxShadow: selected === 'top' ? '0 2px 12px rgba(179, 136, 255, 0.15)' : 'none',
            '&:hover': {
              bgcolor: selected === 'top' ? 'rgba(179, 136, 255, 0.24)' : 'rgba(255, 255, 255, 0.05)',
              color: 'text.primary',
            },
          }}
        >
          Top
        </Button>
      </Box>
    </Box>
  );
}

