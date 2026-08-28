import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CodeIcon from '@mui/icons-material/Code';
import DnsIcon from '@mui/icons-material/Dns';
import BrushIcon from '@mui/icons-material/Brush';
import AddIcon from '@mui/icons-material/Add';

export default function RelatedCommunitiesWidget() {
  const navigate = useNavigate();

  const related = [
    {
      id: 'react-devs',
      name: 'ReactDevs',
      members: '89k members',
      icon: <CodeIcon fontSize="small" />,
      color: '#b388ff',
      bgColor: 'rgba(179, 136, 255, 0.12)',
    },
    {
      id: 'backend-arch',
      name: 'Backend Architecture',
      members: '112k members',
      icon: <DnsIcon fontSize="small" />,
      color: '#69f0ae',
      bgColor: 'rgba(105, 240, 174, 0.12)',
    },
    {
      id: 'css-wizards',
      name: 'CSS Wizards',
      members: '45k members',
      icon: <BrushIcon fontSize="small" />,
      color: '#ffd54f',
      bgColor: 'rgba(255, 213, 79, 0.12)',
    },
  ];

  return (
    <Box
      sx={{
        borderRadius: 3,
        bgcolor: '#1a1a2e',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        p: 3,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontSize: '0.72rem',
          display: 'block',
          mb: 2,
        }}
      >
        Related Communities
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {related.map((item) => (
          <Box
            key={item.id}
            onClick={() => navigate('/community/' + item.id)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1,
              mx: -1,
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.04)',
                '& .community-name': { color: 'primary.light' },
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  bgcolor: item.bgColor,
                  color: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography
                  className="community-name"
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    color: 'text.primary',
                    transition: 'color 0.15s ease',
                  }}
                >
                  {item.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
                  {item.members}
                </Typography>
              </Box>
            </Box>

            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
              }}
              sx={{
                color: 'primary.light',
                p: 0.75,
                '&:hover': { bgcolor: 'rgba(179, 136, 255, 0.12)' },
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

