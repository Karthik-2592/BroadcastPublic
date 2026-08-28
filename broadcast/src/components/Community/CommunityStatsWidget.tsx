import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import BarChartIcon from '@mui/icons-material/BarChart';

export default function CommunityStatsWidget() {
  return (
    <Box
      sx={{
        borderRadius: 3,
        bgcolor: '#1a1a2e',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        p: 3,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* Subtle ambient glow in top corner */}
      <Box
        sx={{
          position: 'absolute',
          top: -24,
          right: -24,
          width: 96,
          height: 96,
          bgcolor: 'rgba(179, 136, 255, 0.08)',
          borderRadius: '50%',
          filter: 'blur(24px)',
          pointerEvents: 'none',
        }}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <BarChartIcon sx={{ color: 'primary.light', fontSize: 20 }} />
        <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.92rem' }}>
          Community Stats
        </Typography>
      </Box>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 1.5,
      }}>
        <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.04)', p: 1.5, borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ color: 'primary.light', fontWeight: 700, lineHeight: 1.2, fontSize: '1.1rem' }}>
            12.4k
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
            Members
          </Typography>
        </Box>

        <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.04)', p: 1.5, borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center ' }}>
          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700, lineHeight: 1.2, fontSize: '1.1rem' }}>
            1.2k
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
            Posts
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

