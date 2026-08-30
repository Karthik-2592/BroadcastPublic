import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Radio from '@mui/material/Radio';
import Typography from '@mui/material/Typography';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import type { Tag } from '../../types/api';

export const TAG_OPTIONS: Tag[] = ['Art', 'Business & Finance', 'Fashion & Beauty', 'Travelling', 'Sports', 'Food', 'Technology', 'Books', 'Health', 'Games', 'Films & TV', 'Nature', 'News & Politics', 'Science', 'Pop Culture', 'Lifestyle'];

export default function CommunityTagSelector({ selectedTags, onChange }: { selectedTags: Tag[]; onChange: (tags: Tag[]) => void }) {
  const [open, setOpen] = useState(false);
  const toggleTag = (tag: Tag) => onChange(selectedTags.includes(tag) ? selectedTags.filter((selected) => selected !== tag) : [...selectedTags, tag]);

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Community Tags</Typography>
          <Button size="small" startIcon={<EditOutlinedIcon />} onClick={() => setOpen(true)} sx={{ textTransform: 'none' }}>Edit tags</Button>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, minHeight: 36 }}>
          {selectedTags.length ? selectedTags.map((tag) => <Chip key={tag} label={tag} color="primary" variant="outlined" />) : <Typography variant="body2" sx={{ color: 'text.disabled' }}>No tags selected</Typography>}
        </Box>
      </Box>
      <Dialog open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
        disableScrollLock={true}
      >

        <DialogContent sx={{ p: 0, bgcolor: '#1a1a2e' }}>
          <Box sx={{ height: 2, background: 'linear-gradient(90deg, transparent, #b388ff, transparent)' }} />
          <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Box><Typography variant="h6" sx={{ fontWeight: 700 }}>Select tags</Typography><Typography variant="body2">Choose categories for your community.</Typography></Box>
            <IconButton aria-label="Close tag selector" onClick={() => setOpen(false)}><CloseRoundedIcon /></IconButton>
          </Box>
          <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 420, overflowY: 'auto' }}>
            {TAG_OPTIONS.map((tag) => { const selected = selectedTags.includes(tag); return <Box key={tag} role="button" tabIndex={0} onClick={() => toggleTag(tag)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') toggleTag(tag); }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 0.75, borderRadius: 2, cursor: 'pointer', bgcolor: selected ? 'rgba(179,136,255,0.14)' : 'rgba(255,255,255,0.04)', border: '1px solid', borderColor: selected ? 'rgba(179,136,255,0.4)' : 'rgba(255,255,255,0.05)' }}><Typography variant="body2" sx={{ color: selected ? 'primary.light' : 'text.secondary' }}>{tag}</Typography><Radio checked={selected} onChange={() => toggleTag(tag)} onClick={(event) => event.stopPropagation()} size="small" /></Box>; })}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2.5, pb: 2.5 }}><Button variant="contained" onClick={() => setOpen(false)}>Done</Button></Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
