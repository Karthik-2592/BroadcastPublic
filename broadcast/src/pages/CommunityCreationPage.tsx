import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import CommunityTagSelector from '../components/Community/CommunityTagSelector';
import type { Tag } from '../types/api';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';

const NAME_MAX = 50;
const DESC_MAX = 200;
const GUIDELINES_MAX = 200;

export default function CommunityCreationPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [guidelines, setGuidelines] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [communityImage, setCommunityImage] = useState<string | null>(null);

  const [nameError, setNameError] = useState('');
  const [descError, setDescError] = useState('');
  const [guidelinesError, setGuidelinesError] = useState('');

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    setCommunityImage(URL.createObjectURL(file));
  };
  const handleCreate = async () => {
    let valid = true;

    if (name.trim().length === 0) {
      setNameError('Community name is required.');
      valid = false;
    } else if (name.length > NAME_MAX) {
      setNameError(`Name must be ${NAME_MAX} characters or fewer.`);
      valid = false;
    } else {
      setNameError('');
    }

    if (description.length > DESC_MAX) {
      setDescError(`Description must be ${DESC_MAX} characters or fewer.`);
      valid = false;
    } else {
      setDescError('');
    }

    if (guidelines.length > GUIDELINES_MAX) {
      setGuidelinesError(`Guidelines must be ${GUIDELINES_MAX} characters or fewer.`);
      valid = false;
    } else {
      setGuidelinesError('');
    }

    if (!valid) return;
    try {
      const response = await fetch(`${BASE_URL}/communities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          community_name: name,
          community_desc: description,
          community_guidelines: guidelines,
          tags,
        }),
        credentials: 'include',
      });
      const body = await response.json() as { data?: { id?: string }; message?: string };
      if (!response.ok || !body.data?.id) throw new Error(body.message ?? 'Failed to create community.');
      navigate(`/c/${body.data.id}`);
    } catch (e) {
      console.error(e);
      // Optional: Handle error via state
    }
  };

  // Reusable chip component
  const CharCountChip = ({ current, max }: { current: number; max: number }) => (
    <Typography
      component="span"
      sx={{
        position: 'absolute',
        bottom: 8,
        right: 10,
        fontSize: '0.68rem',
        fontWeight: 600,
        color: current > max ? 'error.main' : 'text.disabled',
        bgcolor: 'rgba(0,0,0,0.35)',
        borderRadius: 9999,
        px: 0.75,
        py: 0.15,
        lineHeight: 1.6,
        pointerEvents: 'none',
        transition: 'color 0.2s',
        zIndex: 1,
      }}
    >
      {current}/{max}
    </Typography>
  );

  return (
    <Box
      sx={{
        width: '100%',
        pt: 8,
        bgcolor: 'background.default',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: '1fr 0.22fr',
        alignItems: 'center',
        justifyItems: 'center',
        py: 6,
        px: { xs: 2, sm: 3, lg: 4 }
      }}
    >

      <Box sx={{ width: '100%', maxWidth: 'md', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', mb: 4, ml: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'text.primary' }} gutterBottom>
            Create New Community
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Define the space, set the rules, and invite the world. Your broadcast starts here.
          </Typography>
        </Box>

        {/* Outer-container : [flex-col, variable height, full width, no background, gap between elements ] */}
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', bgcolor: 'transparent', gap: 4, pl: 1 }}>

          {/* Community Banner preview container : [full width, fixed height, flex-col, background: image] */}
          <Box
            sx={{
              width: '100%',
              height: 260,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              p: 3,
              borderRadius: 3,
            backgroundImage: communityImage ? `url(${communityImage})` : undefined,
              bgcolor: '#b388ff',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(255, 0, 0, 1), transparent)'
            }} />

            {/* Edit button [fixed height, fixed width, circular, align self to flex-end, justify self to flex end] */}
            <IconButton
              component="label"
              aria-label="Upload community image"
              sx={{
                width: 48,
                height: 48,
                bgcolor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                alignSelf: 'flex-end',
                zIndex: 10,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
              }}
            >
              <EditIcon />
              <input hidden accept="image/*" type="file" onChange={handleImageChange} />
            </IconButton>
          </Box>

          {/* Community Details container: [ full width, variable height, flex-col] */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: 1,
            p: 3,
            borderRadius: 3,
            bgcolor: 'rgb(31, 30, 42)'
          }}>

            {/* Community name container: [flex-row, full width, fixed height, rounded borders] */}
            <Box sx={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              height: 86,
              alignItems: 'center',
            }}>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  mb: 3,
                  bgcolor: 'rgb(22, 22, 29)',
                  width: '100%',
                  transition: 'border 0.2s',
                  '&:focus-within': { border: '1px solid rgba(179,136,255,0.5)' },
                  position: 'relative',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    flexShrink: 0,
                  }}
                >
                  Community Name
                </Typography>
                <Box sx={{ width: '1px', height: 16, bgcolor: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
                <TextField
                  variant="standard"
                  placeholder="YourCommunityName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  slotProps={{
                    input: {
                      sx: {
                        fontWeight: 500,
                        fontSize: '0.9rem',
                        color: 'text.primary',
                        // room for chip
                        pr: '68px',
                      },
                      disableUnderline: true
                    }
                  }}
                  sx={{ flex: 1 }}
                />
                {/* Char-count chip */}
                <CharCountChip current={name.length} max={NAME_MAX} />
              </Box>
            </Box>
            {nameError && (
              <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mb: 1, ml: 0.5, fontSize: '0.75rem' }}>
                {nameError}
              </Typography>
            )}

            {/* Horizontal divider (faint horizontal separator line) */}
            <Box sx={{ width: '100%', height: '1px', bgcolor: 'divider', mb: 3 }} />

            {/* Community Description container: [flex-col, full width, variable height, no border] */}
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              mb: 1
            }}>

              {/* Text box: [fixed with, Text: "Community Description", medium weight font, large size font] */}
              <Box sx={{ width: 250, mb: 1, ml: 1 }}>
                <Typography sx={{
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}>
                  Community Description
                </Typography>
              </Box>

              {/* Text Area with char-count chip */}
              <Box sx={{ position: 'relative' }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  placeholder="Describe your community"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  slotProps={
                    {
                      input: {
                        sx: { fontWeight: 500, fontSize: '0.875rem', pb: '28px' }
                      }
                    }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'background.paper',
                      borderRadius: 2
                    },
                  }}
                />
                <CharCountChip current={description.length} max={DESC_MAX} />
              </Box>
            </Box>
            {descError && (
              <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mb: 2, ml: 0.5, fontSize: '0.75rem' }}>
                {descError}
              </Typography>
            )}

            {/* Horizontal divider (faint horizontal separator line) */}
            <Box sx={{ width: '100%', height: '1px', bgcolor: 'divider', mb: 3 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 1 }}>

              <CommunityTagSelector selectedTags={tags} onChange={setTags} />
            </Box>

          </Box>

          {/* Community Rules container: [full width, variable height, flex col] */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: 1,
            p: 3,
            borderRadius: 3,
            bgcolor: 'rgb(31, 30, 42)'
          }}>

            {/* Text box: [fixed with, Text: "Community Guidelines", medium weight font, large size font"] */}
            <Box sx={{ width: 250, ml: 1, mb: 1 }}>
              <Typography sx={{
                color: 'text.secondary',
                fontWeight: 500,
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                Community Guidelines
              </Typography>
            </Box>

            {/* Text Area with char-count chip */}
            <Box sx={{ position: 'relative' }}>
              <TextField
                fullWidth
                multiline
                rows={5}
                variant="outlined"
                placeholder="Your community Guidelines"
                value={guidelines}
                onChange={(e) => setGuidelines(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'background.paper',
                    borderRadius: 3
                  },
                  '& .MuiInputBase-input': { pb: '28px' },
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}
              />
              <CharCountChip current={guidelines.length} max={GUIDELINES_MAX} />
            </Box>
            {guidelinesError && (
              <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mt: 0.5, ml: 0.5, fontSize: '0.75rem' }}>
                {guidelinesError}
              </Typography>
            )}

          </Box>

        </Box>

        {/* Action Bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 4 }}>
          <Button variant="contained" color="primary" size="large" endIcon={<ArrowForwardIcon />} onClick={handleCreate}>
            Create Community
          </Button>
        </Box>

      </Box>
      <Box
        sx={{
          width: "100%",
          height: "100%"
        }}>

      </Box>
    </Box>
  );
};
