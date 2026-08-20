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
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import Textarea from '@mui/material/TextareaAutosize';
import InputAdornment from '@mui/material/InputAdornment';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import PersonOutlineOutlined from '@mui/icons-material/PersonOutlineOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutlineOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockClockOutlinedIcon from '@mui/icons-material/LockClockOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import UploadIcon from '@mui/icons-material/Upload';
import CellTowerRoundedIcon from '@mui/icons-material/CellTowerRounded';

const INTERESTS = ['Web Dev', 'Open Source', 'UI/UX', 'Cloud Computing', 'AI/ML', 'DevOps'];

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

// ─── Step 1 ───────────────────────────────────────────────────────────────────
function StepOne({ onContinue }: { onContinue: () => void }) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 460,
        bgcolor: '#1f1e2a',
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

      <Box sx={{ p: { xs: 4, md: 5 }, display: 'flex', flexDirection: 'column', gap: 4 }}>
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
function StepTwo() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (interest: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(interest) ? next.delete(interest) : next.add(interest);
      return next;
    });
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 520 }}>
      {/* Gradient glow backdrop */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: -4,
          background: 'linear-gradient(135deg, #b388ff, #69f0ae)',
          borderRadius: 4,
          filter: 'blur(16px)',
          opacity: 0.18,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Card */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          bgcolor: '#1a1a2e',
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
          p: { xs: 4, md: 5 },
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {/* Decorative blobs */}
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

          {/* Interests */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 500, ml: 0.5, fontSize: '0.8rem' }}>
              Interests
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {INTERESTS.map((interest) => {
                const isSelected = selected.has(interest);
                return (
                  <Chip
                    key={interest}
                    label={interest}
                    onClick={() => toggle(interest)}
                    size="small"
                    sx={{
                      fontSize: '0.78rem',
                      height: 28,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      bgcolor: isSelected ? 'rgba(179,136,255,0.18)' : 'rgba(255,255,255,0.06)',
                      color: isSelected ? 'primary.light' : 'text.secondary',
                      border: '1px solid',
                      borderColor: isSelected ? 'rgba(179,136,255,0.45)' : 'transparent',
                      '&:hover': {
                        bgcolor: isSelected ? 'rgba(179,136,255,0.24)' : 'rgba(255,255,255,0.1)',
                      },
                    }}
                  />
                );
              })}
            </Box>
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
      {/* Ambient background glow */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          background: 'radial-gradient(ellipse at center, rgba(179,136,255,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Branding */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
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

      {/* Step indicator */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        {[1, 2].map((s) => (
          <Box
            key={s}
            sx={{
              width: s === step ? 24 : 8,
              height: 8,
              borderRadius: 4,
              bgcolor: s === step ? 'primary.light' : 'rgba(255,255,255,0.15)',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </Box>

      {step === 1 ? (
        <StepOne onContinue={() => setStep(2)} />
      ) : (
        <StepTwo />
      )}

      {/* Back link on step 2 */}
      {step === 2 && (
        <Button
          size="small"
          onClick={() => setStep(1)}
          sx={{
            mt: 2,
            color: 'text.secondary',
            textTransform: 'none',
            fontSize: '0.82rem',
            '&:hover': { color: 'primary.light' },
          }}
        >
          ← Back
        </Button>
      )}

      {/* Sign in link on step 1 hidden – handled inside StepOne, but navigate fallback */}
      {step === 1 && (
        <Button
          size="small"
          onClick={() => navigate('/login')}
          sx={{ mt: 2, color: 'text.secondary', textTransform: 'none', fontSize: '0.82rem', display: 'none' }}
        />
      )}
    </Box>
  );
}
