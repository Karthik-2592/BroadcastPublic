import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { formatCount } from '../../types/api';
import type { Community } from '../../types/api';

export default function RelatedCommunitiesWidget({ communities = [] }: { communities?: Community[] }) {
    const navigate = useNavigate();

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
                {communities.map((community) => {
                    return (
                        <Box
                            key={community.id}
                            onClick={() => navigate('/community/' + community.id)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                p: 1,
                                mx: -1,
                                borderRadius: 2,
                                border: '1px solid rgba(255,255,255,0.43)',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.04)',
                                    '& .community-name': { color: 'primary.light' },
                                },
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>

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
                                        {community.community_name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
                                        {formatCount(community.population)} members
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}

