// RegisterPage — Two-step sign-up flow (standalone, outside MainLayout).
// Route: /register
// Step 1: account credentials  |  Step 2: profile setup
// UI-only: no form submission or navigation logic beyond step advancement.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Textarea from '@mui/material/TextareaAutosize';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Radio from '@mui/material/Radio';
import Fade from '@mui/material/Fade';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import PersonOutlineOutlined from '@mui/icons-material/PersonOutlineOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutlineOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockClockOutlinedIcon from '@mui/icons-material/LockClockOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import UploadIcon from '@mui/icons-material/Upload';
import CellTowerRoundedIcon from '@mui/icons-material/CellTowerRounded';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

const INTERESTS = [
  'Web Dev',
  'Open Source',
  'UI/UX',
  'Cloud Computing',
  'AI/ML',
  'DevOps',
  'Cybersecurity',
  'Mobile App Dev',
  'Blockchain',
  'Data Science',
  'Game Dev',
  'Systems Programming',
];

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 9999,
    bgcolor: 'rgba(255,255,255,0.04)',
    color: 'text.primary',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
    '&:hover fieldset': { borderColor: 'rgba(179,136,255,0.4)' },
    '&.Mui-focused fieldset': { borderColor: 'primary.main' },
  },
  '& .MuiInputLabel-root': { color: 'text.secondary', fontSize: '0.82rem' },
  '& .MuiInputLabel-root.Mui-focused': { color: 'primary.light' },
  '& .MuiInputBase-input': { py: 1.75 },
  '& input:-webkit-autofill': {
    WebkitBoxShadow: '0 0 0px 1000px transparent inset',
    WebkitTextFillColor: 'white',
    transition: 'background-color 5000s ease-in-out 0s',
  },
};

// ─── Interests Dialog Component ───────────────────────────────────────────────
function InterestsDialog({
  selectedInterests,
  onToggleInterest,
}: {
  selectedInterests: Set<string>;
  onToggleInterest: (interest: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasSelection = selectedInterests.size > 0;

  const getButtonText = () => {
    if (!hasSelection) return 'Select interests';
    const items = Array.from(selectedInterests);
    if (items.length <= 2) return items.join(', ');
    return `${items.slice(0, 2).join(', ')} +${items.length - 2} more`;
  };

  return (
    <>
      {/* Full-width, fixed-height button with left-aligned text */}
      <Button
        type="button"
        fullWidth
        onClick={() => setOpen(true)}
        sx={{
          height: 48,
          borderRadius: 9999,
          bgcolor: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: hasSelection ? 'primary.light' : 'text.secondary',
          fontWeight: hasSelection ? 600 : 400,
          fontSize: '0.88rem',
          textTransform: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2.5,
          textAlign: 'left',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: 'rgba(255,255,255,0.1)',
            borderColor: 'rgba(179,136,255,0.3)',
          },
        }}
      >
        <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {getButtonText()}
        </Box>
        <KeyboardArrowDownIcon
          sx={{
            color: hasSelection ? 'primary.light' : 'text.secondary',
            fontSize: 20,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
          }}
        />
      </Button>

      {/* Dialog box containing radio options */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'brightness(0.5) blur(4px)',
            },
          },
          paper: {
            sx: {
              width: '100%',
              maxWidth: 420,
              height: 380,
              bgcolor: '#1a1a2e',
              color: 'text.primary',
              borderRadius: 3,
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
              p: 0,
              m: 2,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
            },
          },
        }}
      >
        {/* Top gradient line */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: 'linear-gradient(90deg, transparent, #b388ff, transparent)',
            opacity: 0.6,
          }}
        />

        {/* Dialog Header */}
        <Box
          sx={{
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Select Interests {hasSelection && `(${selectedInterests.size})`}
          </Typography>
          <IconButton
            size="small"
            onClick={() => setOpen(false)}
            sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Dialog Content — fixed height, scrollable without visible scrollbars */}
        <DialogContent
          sx={{
            p: 2.5,
            overflowY: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {INTERESTS.map((interest) => {
            const isSelected = selectedInterests.has(interest);
            return (
              <Box
                key={interest}
                onClick={() => onToggleInterest(interest)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: '10px 16px',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  bgcolor: isSelected ? 'rgba(179,136,255,0.14)' : 'rgba(255,255,255,0.04)',
                  border: '1px solid',
                  borderColor: isSelected ? 'rgba(179,136,255,0.4)' : 'rgba(255,255,255,0.05)',
                  '&:hover': {
                    bgcolor: isSelected ? 'rgba(179,136,255,0.2)' : 'rgba(255,255,255,0.08)',
                    borderColor: isSelected ? 'rgba(179,136,255,0.5)' : 'rgba(255,255,255,0.15)',
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? 'primary.light' : 'text.secondary',
                  }}
                >
                  {interest}
                </Typography>
                <Radio
                  checked={isSelected}
                  size="small"
                  sx={{
                    p: 0,
                    color: 'rgba(255,255,255,0.3)',
                    '&.Mui-checked': { color: 'primary.light' },
                  }}
                />
              </Box>
            );
          })}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────
function StepOne({ onContinue, handleBack }: { onContinue: () => void; handleBack: () => void }) {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 480,
        bgcolor: '#1a1a2e',
        borderRadius: 3,
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
        '&:hover': {
          boxShadow: '0 12px 48px rgba(179,136,255,0.15)',
          borderColor: 'rgba(179,136,255,0.25)',
        },
      }}
    >
      <IconButton
        onClick={handleBack}
        aria-label="Navigate back"
        sx={{
          position: 'absolute',
          top: { xs: 32, md: 52 },
          left: { xs: 32, md: 52 },
          zIndex: 10,
          color: 'text.secondary',
          bgcolor: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s ease',
          '&:hover': {
            color: 'primary.light',
            bgcolor: 'rgba(179, 136, 255, 0.12)',
            borderColor: 'rgba(179, 136, 255, 0.3)',
            transform: 'translateX(-2px)',
          },
          width: 12,
          height: 12,
        }}
      >
        <ArrowBackRoundedIcon fontSize="medium" />
      </IconButton>
      {/* Top gradient line */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: 'linear-gradient(90deg, transparent, #b388ff, transparent)',
          opacity: 0.6,
        }}
      />

      {/* Decorative blobs inside card (consistent with step 2) */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: -16,
          right: -16,
          width: 80,
          height: 80,
          bgcolor: 'rgba(105, 240, 174, 0.08)',
          borderRadius: '50%',
          filter: 'blur(24px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          bottom: -24,
          left: -24,
          width: 128,
          height: 128,
          bgcolor: 'rgba(179,136,255,0.08)',
          borderRadius: '50%',
          filter: 'blur(32px)',
          pointerEvents: 'none',
        }}
      />

      {/* Inner glow overlay on hover */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: 3,
          pointerEvents: 'none',
          transition: 'box-shadow 0.3s ease',
          '&:hover': { boxShadow: 'inset 0 4px 20px rgba(179,136,255,0.08)' },
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1, p: { xs: 4, md: 5 }, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <HowToRegIcon sx={{ color: 'primary.light', fontSize: 40, mb: 0.5 }} />
          <Typography
            variant="h5"
            component="h1"
            sx={{ color: 'text.primary', fontWeight: 700, letterSpacing: '-0.02em' }}
          >
            Create Account
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Join the broadcast network
          </Typography>
        </Box>

        {/* Form */}
        <Box component="form" noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            id="reg-username"
            label="Username"
            placeholder="Enter username"
            fullWidth
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineOutlined sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={inputSx}
          />
          <TextField
            id="reg-email"
            label="Email"
            type="email"
            placeholder="name@example.com"
            fullWidth
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutlineIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={inputSx}
          />
          <TextField
            id="reg-password"
            label="Password"
            type="password"
            placeholder="••••••••"
            fullWidth
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={inputSx}
          />
          <TextField
            id="reg-confirm-password"
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            fullWidth
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockClockOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={inputSx}
          />

          {/* Continue button */}
          <Box sx={{ pt: 1, borderTop: '1px solid rgba(255,255,255,0.06)', mt: 0.5 }}>
            <Button
              type="button"
              fullWidth
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={onContinue}
              sx={{
                py: 1.5,
                background: 'linear-gradient(135deg, #b388ff 0%, #7c4dff 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.9rem',
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: '0 4px 16px rgba(179,136,255,0.3)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #a98bda 0%, #7452d1 100%)',
                  boxShadow: '0 6px 22px rgba(179,136,255,0.45)',
                  transform: 'translateY(-1px)',
                  '& .MuiButton-endIcon': { transform: 'translateX(3px)' },
                },
                '& .MuiButton-endIcon': { transition: 'transform 0.2s ease' },
              }}
            >
              Continue
            </Button>
          </Box>

          {/* Footer */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Already have an account?
            </Typography>
            <Link
              component="button"
              type="button"
              underline="hover"
              onClick={() => navigate('/login')}
              sx={{
                color: 'primary.light',
                fontWeight: 600,
                fontSize: '0.85rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Sign in
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────
function StepTwo({ handleBack }: { handleBack: () => void }) {
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => {
      const next = new Set(prev);
      if (next.has(interest)) {
        next.delete(interest);
      } else {
        next.add(interest);
      }
      return next;
    });
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 480,
        bgcolor: '#1a1a2e',
        borderRadius: 3,
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
        '&:hover': {
          boxShadow: '0 12px 48px rgba(179,136,255,0.15)',
          borderColor: 'rgba(179,136,255,0.25)',
        },
      }}
    >
      <IconButton
        onClick={handleBack}
        aria-label="Navigate back"
        sx={{
          position: 'absolute',
          top: { xs: 32, md: 52 },
          left: { xs: 32, md: 52 },
          zIndex: 10,
          color: 'text.secondary',
          bgcolor: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s ease',
          '&:hover': {
            color: 'primary.light',
            bgcolor: 'rgba(179, 136, 255, 0.12)',
            borderColor: 'rgba(179, 136, 255, 0.3)',
            transform: 'translateX(-2px)',
          },
          width: 12,
          height: 12,
        }}
      >
        <ArrowBackRoundedIcon fontSize="medium" />
      </IconButton>
      {/* Top gradient line */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: 'linear-gradient(90deg, transparent, #b388ff, transparent)',
          opacity: 0.6,
        }}
      />

      {/* Decorative blobs inside card (consistent with step 1) */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: -16,
          right: -16,
          width: 80,
          height: 80,
          bgcolor: 'rgba(105, 240, 174, 0.08)',
          borderRadius: '50%',
          filter: 'blur(24px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          bottom: -24,
          left: -24,
          width: 128,
          height: 128,
          bgcolor: 'rgba(179,136,255,0.08)',
          borderRadius: '50%',
          filter: 'blur(32px)',
          pointerEvents: 'none',
        }}
      />

      {/* Inner glow overlay on hover */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: 3,
          pointerEvents: 'none',
          transition: 'box-shadow 0.3s ease',
          '&:hover': { boxShadow: 'inset 0 4px 20px rgba(179,136,255,0.08)' },
        }}
      />

      {/* Card Content */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          p: { xs: 4, md: 5 },
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{ color: 'text.primary', fontWeight: 700, letterSpacing: '-0.02em', mb: 0.5 }}
          >
            Set up your profile
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Step 2 of 2: Let's make it yours.
          </Typography>
        </Box>

        {/* Form */}
        <Box component="form" noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Avatar upload */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                position: 'relative',
                width: 96,
                height: 96,
                borderRadius: '50%',
                bgcolor: 'rgba(179,136,255,0.08)',
                border: '2px solid rgba(179,136,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'primary.light',
                  bgcolor: 'rgba(179,136,255,0.14)',
                  '& .upload-overlay': { opacity: 1 },
                },
              }}
            >
              <PersonOutlineOutlined sx={{ color: 'text.secondary', fontSize: 40 }} />
              <Box
                className="upload-overlay"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                  borderRadius: '50%',
                }}
              >
                <UploadIcon sx={{ color: 'text.primary', fontSize: 22, mb: 0.5 }} />
                <Typography variant="caption" sx={{ color: 'text.primary', fontSize: '0.7rem' }}>
                  Upload
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.72rem' }}>
              Profile Picture
            </Typography>
          </Box>

          {/* Display name */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 500, ml: 0.5, fontSize: '0.8rem' }}>
              Display Name
            </Typography>
            <TextField
              id="reg-display-name"
              placeholder="e.g. CodeNinja88"
              fullWidth
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineOutlined sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 9999,
                  bgcolor: 'rgba(255,255,255,0.06)',
                  color: 'text.primary',
                  '& fieldset': { borderColor: 'transparent' },
                  '&:hover fieldset': { borderColor: 'rgba(179,136,255,0.3)' },
                  '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                },
                '& .MuiInputBase-input': { py: 1.5 },
              }}
            />
          </Box>

          {/* Bio */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 500, ml: 0.5, fontSize: '0.8rem' }}>
              Bio
            </Typography>
            <Box
              component={Textarea}
              id="reg-bio"
              minRows={3}
              placeholder="Tell the community a bit about yourself..."
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid transparent',
                borderRadius: 12,
                padding: '12px 16px',
                color: 'inherit',
                fontFamily: 'inherit',
                fontSize: '0.88rem',
                lineHeight: 1.65,
                resize: 'none',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
            />
          </Box>

          {/* Interests Dialog Component */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 500, ml: 0.5, fontSize: '0.8rem' }}>
              Interests
            </Typography>
            <InterestsDialog
              selectedInterests={selectedInterests}
              onToggleInterest={toggleInterest}
            />
          </Box>

          {/* Complete registration button */}
          <Button
            type="button"
            fullWidth
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            sx={{
              mt: 1,
              py: 1.75,
              background: 'linear-gradient(135deg, #b388ff 0%, #7c4dff 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              borderRadius: 3,
              textTransform: 'none',
              boxShadow: '0 4px 16px rgba(179,136,255,0.3)',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #a98bda 0%, #7452d1 100%)',
                boxShadow: '0 6px 22px rgba(179,136,255,0.45)',
                transform: 'translateY(-1px)',
                '& .MuiButton-endIcon': { transform: 'translateX(3px)' },
              },
              '& .MuiButton-endIcon': { transition: 'transform 0.2s ease' },
            }}
          >
            Complete Registration
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

// ─── Main Register Page ───────────────────────────────────────────────────────
export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      navigate('/login');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#12121d',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
        position: 'relative',
        overflow: 'hidden',
      }}
    >


      {/* Soft static faint decorative blobs in background (increased to 3 blobs with increased dimensions) */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: '12%',
          left: '10%',
          width: 450,
          height: 450,
          bgcolor: 'rgba(179,136,255,0.07)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: 420,
          height: 420,
          bgcolor: 'rgba(105, 240, 174, 0.05)',
          borderRadius: '50%',
          filter: 'blur(70px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: '15%',
          right: '12%',
          width: 380,
          height: 380,
          bgcolor: 'rgba(179,136,255,0.06)',
          borderRadius: '50%',
          filter: 'blur(75px)',
          pointerEvents: 'none',
        }}
      />

      {/* Branding */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 4,
          position: 'fixed',
          zIndex: 2,
          left: '50%',
          transform: 'translateX(-50%)',
          top: '5%',
        }}
      >
        <CellTowerRoundedIcon sx={{ color: 'primary.light', fontSize: 28 }} />
        <Typography
          variant="h6"
          sx={{
            background: 'linear-gradient(135deg, #b388ff 0%, #69f0ae 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            letterSpacing: '-0.03em',
          }}
        >
          Broadcast
        </Typography>
      </Box>

      {/* Step containers with smooth transition switching */}
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
        {step === 1 ? (
          <Fade in={step === 1} timeout={350} key="step-1">
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <StepOne onContinue={() => setStep(2)} handleBack={handleBack} />
            </Box>
          </Fade>
        ) : (
          <Fade in={step === 2} timeout={350} key="step-2">
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <StepTwo handleBack={handleBack} />
            </Box>
          </Fade>
        )}
      </Box>
    </Box>
  );
}
