import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

export default function ProfileDescription() {
    return (
        <Box
            sx={{
                width: '100%',
                bgcolor: '#1f1e2a', // surface-container
                borderRadius: 3,
                boxShadow: 3,
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Content */}
            <Box sx={{ px: 4, py: 2, position: 'relative' }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, gap: 3, mb: 3 }}>
                    <Box
                        sx={{
                            width: 128,
                            height: 128,
                            borderRadius: '50%',
                            border: '4px solid #1f1e2a',
                            bgcolor: '#1a1a2e',
                            flexShrink: 0,
                            overflow: 'hidden',
                            boxShadow: 3,
                            position: 'relative',
                            '&:hover .overlay': {
                                opacity: 1
                            },
                            cursor: 'pointer'
                        }}
                    >
                        <Avatar
                            alt="Profile"
                            src=""
                            sx={{ width: '100%', height: '100%' }}
                        />
                        <Box
                            className="overlay"
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                bgcolor: 'rgba(212, 187, 255, 0.2)', // primary/20
                                opacity: 0,
                                transition: 'opacity 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <PhotoCameraIcon sx={{ color: 'white' }} />
                        </Box>
                    </Box>

                    {/* Name & Handle */}
                    <Box sx={{ flex: 1, mb: 1, mt: 1 }}>
                        <Typography variant="h4" sx={{ fontWeight: 600, color: '#e8e6ef', letterSpacing: '-0.02em' }}>
                            Alex Rivera
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#d4bbff', mt: 0.5 }}>
                            @alex_rivera
                        </Typography>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
                        <Button
                            variant="contained"
                            sx={{
                                textTransform: 'none',
                                bgcolor: '#343440', // surface-variant
                                color: '#e3e0f1', // on-surface
                                borderRadius: 2,
                                px: 3,
                                py: 1,
                                fontWeight: 500,
                                '&:hover': {
                                    bgcolor: '#4a4452' // roughly surface-container-highest
                                },
                                boxShadow: 1
                            }}
                        >
                            Edit Profile
                        </Button>
                    </Box>
                </Box>

                {/* Bio & Tags */}
                <Box sx={{ maxWidth: '100%' }}>
                    <Typography
                        variant="body1"
                        sx={{
                            color: '#ccc3d4', // on-surface-variant
                            textAlign: 'justify',
                            lineHeight: 1.6
                        }}
                    >
                        Senior Full-stack Developer & Tech Enthusiast based in San Francisco. Passionate
                        about React, Node.js, and building community-driven software. Constantly exploring the
                        edges of what's possible with web technologies and always open to collaborating on
                        open-source projects.
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                        {['React', 'Node.js', 'System Architecture'].map((tag) => (
                            <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                sx={{
                                    bgcolor: '#292935', // surface-container-high
                                    color: '#e3e0f1',
                                    fontWeight: 500,
                                    fontSize: '0.75rem'
                                }}
                            />
                        ))}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
