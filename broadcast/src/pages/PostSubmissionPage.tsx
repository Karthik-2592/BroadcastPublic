import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

export default function PostSubmissionPage() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 0.22fr',
        justifyContent: 'center',
        justifyItems: 'center',
        p: { xs: 2, md: 4 },
        width: '100%',
        height: '100%',
        bgcolor: 'background.default',
      }}
    >
      <Card
        sx={{
          width: '100%',
          bgcolor: 'background.paper',
          p: { xs: 3, md: 4 },
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)',
          backgroundImage: 'none',
          alignSelf: 'flex-start',
          mt: 2,
          maxWidth: '720px'
        }}
      >
        {/* Accent Glow Background */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 256,
            height: 256,
            background: 'rgba(179, 136, 255, 0.08)',
            borderRadius: '50%',
            filter: 'blur(80px)',
            pointerEvents: 'none',
            transform: 'translate(30%, -30%)',
          }}
        />

        {/* Title input */}
        <Box sx={{ mb: 2 }}>
          <Input
            placeholder="An interesting title..."
            fullWidth
            disableUnderline
            sx={{
              fontSize: '1.75rem',
              fontWeight: 600,
              color: 'text.primary',
              letterSpacing: '-0.02em',
              '& input::placeholder': {
                color: 'text.secondary',
                opacity: 0.6,
              },
            }}
          />
        </Box>

        <Divider sx={{ my: 2.5, borderColor: 'rgba(255,255,255,0.06)' }} />

        {/* Tags Row */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mb: 3, ml: 3 }}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              mr: 1,
            }}
          >
            Tags
          </Typography>
          <Chip
            label="React"
            clickable
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.04)',
              color: 'text.secondary',
              fontSize: '0.8rem',
              '&:hover': {
                bgcolor: 'rgba(179, 136, 255, 0.15)',
                color: 'primary.light',
              },
            }}
          />
          <Chip
            label="Node.js"
            clickable
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.04)',
              color: 'text.secondary',
              fontSize: '0.8rem',
              '&:hover': {
                bgcolor: 'rgba(179, 136, 255, 0.15)',
                color: 'primary.light',
              },
            }}
          />
          <Chip
            label="Showcase"
            clickable
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.04)',
              color: 'text.secondary',
              fontSize: '0.8rem',
              '&:hover': {
                bgcolor: 'rgba(179, 136, 255, 0.15)',
                color: 'primary.light',
              },
            }}
          />
          <Chip
            label="Add Tag"
            icon={<AddRoundedIcon sx={{ fontSize: '1rem !important' }} />}
            variant="outlined"
            clickable
            sx={{
              borderStyle: 'dashed',
              borderColor: 'rgba(255,255,255,0.3)',
              color: 'text.secondary',
              fontSize: '0.8rem',
              '&:hover': {
                borderColor: 'primary.main',
                color: 'primary.main',
              },
            }}
          />
        </Box>

        {/* Community selector */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 10,
            px: 2.5,
            py: 1,
            mb: 3,
            width: '100%',
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
            Community
          </Typography>
          <Box sx={{ width: '1px', height: 16, bgcolor: 'rgba(255,255,255,0.15)' }} />
          <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
            Global
          </Typography>
        </Box>

        <Divider sx={{ my: 2.5, borderColor: 'rgba(255,255,255,0.06)' }} />

        {/* Post body content */}
        <Box sx={{ mb: 4, minHeight: 300 }}>
          <Input
            placeholder="Share your thoughts, code, or projects..."
            fullWidth
            multiline
            minRows={12}
            disableUnderline
            sx={{
              fontSize: '1rem',
              color: 'text.primary',
              alignItems: 'flex-start',
              '& textarea::placeholder': {
                color: 'text.secondary',
                opacity: 0.6,
              },
            }}
          />
        </Box>

        {/* Attached Files List */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
          <Chip
            icon={<ImageOutlinedIcon sx={{ fontSize: '1.1rem !important', color: 'text.secondary' }} />}
            label="architecture_diagram.png"
            onDelete={() => { }}
            deleteIcon={<CloseRoundedIcon sx={{ fontSize: '0.9rem !important' }} />}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 2,
              color: 'text.primary',
              px: 0.5,
              py: 2,
              '& .MuiChip-deleteIcon': {
                color: 'text.secondary',
                '&:hover': { color: 'error.light' },
              },
            }}
          />
        </Box>

        <Divider sx={{ my: 2.5, borderColor: 'rgba(255,255,255,0.06)' }} />

        {/* Bottom Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="text"
            startIcon={<AttachFileRoundedIcon />}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 10,
              px: 2.5,
              py: 1,
              color: 'text.primary',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.08)',
              },
            }}
          >
            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: '1px', height: 16, bgcolor: 'rgba(255,255,255,0.15)' }} />
              Attach
            </Box>
          </Button>

          <Button
            variant="contained"
            startIcon={<SendRoundedIcon />}
            sx={{
              background: 'linear-gradient(135deg, #b388ff 0%, #7c4dff 100%)',
              color: '#ffffff',
              fontWeight: 600,
              borderRadius: 10,
              px: 3.5,
              py: 1,
              textTransform: 'none',
              boxShadow: '0 2px 10px rgba(179, 136, 255, 0.25)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                background: 'linear-gradient(135deg, #c7a4ff 0%, #9066ff 100%)',
                boxShadow: '0 4px 16px rgba(179, 136, 255, 0.45)',
                transform: 'scale(1.03)',
              },
            }}
          >
            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: '1px', height: 16, bgcolor: 'rgba(255,255,255,0.25)' }} />
              Post
            </Box>
          </Button>
        </Box>
      </Card>
      <Box
        sx={{
          width: '100%',

        }}>

      </Box>
    </Box>
  );
}
