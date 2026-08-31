// LoginPage — Standalone sign-in page (outside MainLayout, no sidebar/topbar).
// Route: /login
// UI-only: no form submission logic is implemented.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import Fade from '@mui/material/Fade';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import LoginIcon from '@mui/icons-material/Login';
import PersonOutlineOutlined from '@mui/icons-material/PersonOutlineOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CellTowerRoundedIcon from '@mui/icons-material/CellTowerRounded';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types/api';
import { BASE_URL } from '../config';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const response = await fetch(`${BASE_URL}/auth/sessions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }), credentials: 'include' });
      const body = await response.json() as { data?: { user_id?: string }; message?: string };
      if (!response.ok || !body.data?.user_id) throw new Error(body.message ?? 'Unable to sign in.');
      const userResponse = await fetch(`${BASE_URL}/users/${body.data.user_id}`, { credentials: 'include' });
      const userBody = await userResponse.json() as { data?: User; message?: string };
      if (!userResponse.ok || !userBody.data) throw new Error(userBody.message ?? 'Unable to load user profile.');
      login(userBody.data);
      navigate('/');
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background glow blobs */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: '20%',
          left: '15%',
          width: 320,
          height: 320,
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
          bottom: '15%',
          right: '15%',
          width: 260,
          height: 260,
          bgcolor: 'rgba(105, 240, 174, 0.05)',
          borderRadius: '50%',
          filter: 'blur(70px)',
          pointerEvents: 'none',
        }}
      />

      {/* Branding */}
      <Box
        onClick={() => navigate('/')}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 4,
          position: 'fixed',
          left: '50%',
          transform: 'translateX(-50%)',
          top: '5%',
          zIndex: 2,
          cursor: 'pointer'
        }}>
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

      {/* Card */}
      <Fade in={true} timeout={350}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: 480,
            bgcolor: '#1a1a2e',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
            overflow: 'hidden',
            transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
            zIndex: 2,
            '&:hover': {
              boxShadow: '0 12px 48px rgba(179,136,255,0.15)',
              borderColor: 'rgba(179,136,255,0.25)',
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
          {/* Corner glow blobs */}
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              bottom: -40,
              right: -40,
              width: 128,
              height: 128,
              bgcolor: 'rgba(179,136,255,0.08)',
              borderRadius: '50%',
              filter: 'blur(24px)',
              pointerEvents: 'none',
            }}
          />
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              top: -40,
              left: -40,
              width: 128,
              height: 128,
              bgcolor: 'rgba(105, 240, 174, 0.06)',
              borderRadius: '50%',
              filter: 'blur(24px)',
              pointerEvents: 'none',
            }}
          />

          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              p: { xs: 4, sm: 5 },
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  bgcolor: 'rgba(179,136,255,0.1)',
                  border: '1px solid rgba(179,136,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 0.5,
                }}
              >
                <LoginIcon sx={{ color: 'primary.light', fontSize: 26 }} />
              </Box>
              <Typography
                variant="h5"
                component="h1"
                sx={{ color: 'text.primary', fontWeight: 700, letterSpacing: '-0.02em' }}
              >
                Sign In
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Welcome back to Broadcast
              </Typography>
            </Box>

            {/* Form */}
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Username */}
              <TextField
                id="login-username"
                label="Username"
                placeholder="Enter your username"
                fullWidth
                size="small"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
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

              {/* Password */}
              <TextField
                id="login-password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                fullWidth
                size="small"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowPassword((v) => !v)}
                          sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
                          edge="end"
                        >
                          {showPassword ? (
                            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                          ) : (
                            <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={inputSx}
              />

              {/* Forgot password link */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -1 }}>
                <Link
                  href="#"
                  underline="hover"
                  sx={{ color: 'primary.light', fontSize: '0.8rem', fontWeight: 500 }}
                >
                  Forgot Password?
                </Link>
              </Box>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting}
                fullWidth
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  mt: 1,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #b388ff 0%, #7c4dff 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  borderRadius: 9999,
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
                {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Sign In'}
              </Button>
              {error && <Typography variant="caption" sx={{ color: 'error.main', textAlign: 'center' }}>{error}</Typography>}
            </Box>

            {/* Footer */}
            <Box
              sx={{
                pt: 2,
                borderTop: '1px solid rgba(255,255,255,0.06)',
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Don't have an account?{' '}
                <Link
                  component="button"
                  onClick={() => navigate('/register')}
                  underline="hover"
                  sx={{
                    color: 'primary.light',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    verticalAlign: 'baseline',
                  }}
                >
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Fade>
    </Box>
  );
}
