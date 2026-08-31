import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

interface FetchErrorDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function FetchErrorDialog({ open, onClose }: FetchErrorDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth disableScrollLock={true}>
      <DialogContent sx={{ p: 4, bgcolor: '#1a1a2e' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Something went wrong</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          We could not retrieve this content. Please try again later.
        </Typography>
        <Button variant="contained" onClick={onClose} sx={{ display: 'block', ml: 'auto' }}>Close</Button>
      </DialogContent>
    </Dialog>
  );
}
