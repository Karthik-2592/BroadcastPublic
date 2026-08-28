import {
  Box,
  Typography,
  Button,
  TextField,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

export default function CommunityCreationPage() {
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
        <Box sx={{ display: 'flex', flexDirection: 'column', mb: 4, ml: 1 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'text.primary' }} gutterBottom>
            Create New Community
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Define the space, set the rules, and invite the world. Your broadcast starts here.
          </Typography>
        </Box>

        {/* Outer-container : [flex-col, variable height, full width, no background, gap between elements ] */}
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', bgcolor: 'transparent', gap: 4 }}>

          {/* Community Banner preview container : [full width, fixed height, flex-col, background: image] */}
          <Box
            sx={{
              width: '100%',
              height: 256,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              p: 3,
              borderRadius: 3,
              backgroundImage: 'url()', // Placeholder for image
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
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  Community Name
                </Typography>
                <Box sx={{ width: '1px', height: 16, bgcolor: 'rgba(255,255,255,0.15)' }} />
                <TextField
                  variant="standard"
                  placeholder="YourCommunityName"
                  slotProps={{
                    input: {
                      sx: {
                        fontWeight: 500,
                        fontSize: '0.9rem',
                        color: 'text.primary',
                      },
                      disableUnderline: true

                    }
                  }}
                  sx={{ flex: 1 }}
                />
              </Box>
            </Box>

            {/* Horizontal divider (faint horizontal separator line) */}
            <Box sx={{ width: '100%', height: '1px', bgcolor: 'divider', mb: 3 }} />

            {/* Community Description container: [flex-col, full width, variable height, no border] */}
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              mb: 3
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

              {/* Text Area: [full width, Placeholder: "Describe your community", medium weight font, small size font] */}
              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                placeholder="Describe your community"
                slotProps={
                  {
                    input: {
                      sx: { fontWeight: 500, fontSize: '0.875rem' }
                    }
                  }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'background.paper',
                    borderRadius: 2

                  },
                }}
              />
            </Box>
            {/* Horizontal divider (faint horizontal separator line) */}
            <Box sx={{ width: '100%', height: '1px', bgcolor: 'divider', mb: 3 }} />

            {/* Community Tags container: [flex-col, full width, variable height, no border] */}
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 1 }}>

              {/* Text box: [fixed width, Text: "Community Tags", medium weight font, large size font] */}
              <Box sx={{ width: 250, mb: 1, ml: 1 }}>
                <Typography sx={{
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}>
                  Community Tags
                </Typography>
              </Box>

              {/* Tags list: [flex row with wrap enabled, full width] */}
              <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                width: '100%',
                gap: 1,
                px: 1
              }}>
                {/* <Tag1> : [fixed width fits content, rounded borders, sufficient padding] */}
                <Chip label="Gaming" color="primary" sx={{ borderRadius: 4, px: 1, py: 2 }} />
                <Chip label="Technology" variant="outlined" sx={{ borderRadius: 4, px: 1, py: 2 }} />
                <Chip label="Art & Design" variant="outlined" sx={{ borderRadius: 4, px: 1, py: 2 }} />
              </Box>
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

            {/* Text Area: [full width, placeholder: "Your community Guidelines", medium weight font, small size font] */}
            <TextField
              fullWidth
              multiline
              rows={5}
              variant="outlined"
              placeholder="Your community Guidelines"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'background.paper',
                  borderRadius: 3
                },
                fontWeight: 500,
                fontSize: '0.875rem'
              }}
            />
          </Box>

        </Box>

        {/* Action Bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 4 }}>
          <Button variant="text" color="inherit">
            Cancel
          </Button>
          <Button variant="contained" color="primary" size="large" endIcon={<ArrowForwardIcon />}>
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
