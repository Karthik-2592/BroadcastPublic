import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { BASE_URL } from '../config';

export default function PostSubmissionPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [titleError, setTitleError] = useState('');
  const [bodyError, setBodyError] = useState('');

  const TITLE_MAX = 75;
  const BODY_MAX = 300;

  const [tagsText, setTagsText] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagError, setTagError] = useState(false);

  const [communityInput, setCommunityInput] = useState('Global');

  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentError, setAttachmentError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const debouncedPostSubmitApi = useCallback(
    debounce(async (postData: { title: string, body: string, tags: string[], community: string, attachments: string[] }) => {
      try {
        const response = await fetch(`${BASE_URL}/posts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: postData.title,
            content: postData.body,
            tags: postData.tags,
            community_name: postData.community || null,
          }),
          credentials: 'include',
        });
        const body = await response.json() as { data?: { id?: string }; message?: string };
        if (!response.ok || !body.data?.id) throw new Error(body.message ?? 'Failed to create post.');
        
        // Handle media upload if any
        if (postData.attachments.length > 0) {
          const form = new FormData();
          postData.attachments.forEach(file => form.append('media', file));
          const upload = await fetch(`${BASE_URL}/posts/${body.data.id}/media`, { method: 'POST', body: form, credentials: 'include' });
          if (!upload.ok) console.error('Failed to upload media');
        }

        navigate(`/post/${body.data.id}`);
      } catch (e) {
        console.error(e);
      }
    }, 1000),
    [navigate]
  );

  const handleTagsProcess = () => {
    if (!tagsText.trim()) {
      setTagError(false);
      return;
    }
    if (!/^[a-zA-Z0-9#\s]*$/.test(tagsText)) {
      setTagError(true);
      return;
    }
    setTagError(false);
    const matches = tagsText.match(/#\w+/g) || [];
    setTags([...new Set(matches)]);
  };

  const handleTagsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagsProcess();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachmentError('');
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];

      const validFiles = selectedFiles.filter(f => validTypes.includes(f.type));
      if (validFiles.length < selectedFiles.length) {
        setAttachmentError('Only .png, .jpg, and .jpeg files are allowed.');
      }

      const newTotal = attachments.length + validFiles.length;
      if (newTotal > 3) {
        setAttachmentError('Maximum of 3 attachments allowed.');
        const diff = 3 - attachments.length;
        setAttachments([...attachments, ...validFiles.slice(0, diff)]);
      } else {
        setAttachments([...attachments, ...validFiles]);
      }
    }
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
    setAttachmentError('');
  };

  const handleSubmit = () => {
    let valid = true;
    if (title.trim().length === 0) {
      setTitleError('Title is required.');
      valid = false;
    } else if (title.length > TITLE_MAX) {
      setTitleError(`Title must be ${TITLE_MAX} characters or fewer.`);
      valid = false;
    } else {
      setTitleError('');
    }

    if (body.length > BODY_MAX) {
      setBodyError(`Description must be ${BODY_MAX} characters or fewer.`);
      valid = false;
    } else {
      setBodyError('');
    }

    if (!valid) return;

    const formattedCommunity = communityInput.trim().toLowerCase().replace(/\s+/g, '_');
    debouncedPostSubmitApi({
      title,
      body,
      tags,
      community: formattedCommunity,
      attachments: attachments.map(a => a.name)
    });
  };

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
        <Box sx={{ mb: 2, position: 'relative', }}>
          <Input
            placeholder="An interesting title..."
            disableUnderline
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{
              fontSize: '1.3rem',
              fontWeight: 600,
              width: '90%',
              color: 'text.primary',
              letterSpacing: '0em',
              '& input::placeholder': {
                color: 'text.secondary',
                opacity: 0.6,
              },
              // ensure enough bottom padding for the chip
            }}
          />
          {/* Char-count chip */}
          <Typography
            component="span"
            sx={{
              ml: 1.5,
              alignSelf: 'center',
              justifySelf: 'center',
              fontSize: '0.68rem',
              fontWeight: 600,
              color: title.length > TITLE_MAX ? 'error.main' : 'text.disabled',
              bgcolor: 'rgba(0,0,0,0.35)',
              borderRadius: 9999,
              px: 0.75,
              py: 0.15,
              lineHeight: 1.6,
              pointerEvents: 'none',
              transition: 'color 0.2s',
            }}
          >
            {title.length}/{TITLE_MAX}
          </Typography>
        </Box>
        {titleError && (
          <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mb: 1, ml: 0.5, fontSize: '0.75rem' }}>
            {titleError}
          </Typography>
        )}

        <Divider sx={{ my: 2.5, borderColor: 'rgba(255, 255, 255, 0.1)' }} />


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
            Community
          </Typography>
          <Box sx={{ width: '1px', height: 16, bgcolor: 'rgba(255,255,255,0.15)' }} />
          <Input
            value={communityInput}
            onChange={(e) => setCommunityInput(e.target.value)}
            disableUnderline
            sx={{ color: 'text.primary', fontSize: '0.9rem', fontWeight: 500, flex: 1 }}
          />
        </Box>

        <Divider sx={{ my: 2.5, borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* Post body content */}
        <Box sx={{ mb: 1, minHeight: 300, position: 'relative' }}>
          <Input
            placeholder="Share your thoughts, code, or projects..."
            fullWidth
            multiline
            minRows={8}
            disableUnderline
            value={body}
            onChange={(e) => setBody(e.target.value)}
            sx={{
              fontSize: '1rem',
              color: 'text.primary',
              alignItems: 'flex-start',
              '& textarea::placeholder': {
                color: 'text.secondary',
                opacity: 0.6,
              },
              // room for chip at bottom
              '& textarea': { pb: '24px' },
            }}
          />
          {/* Char-count chip */}
          <Typography
            component="span"
            sx={{
              position: 'absolute',
              bottom: 6,
              right: 4,
              fontSize: '0.68rem',
              fontWeight: 600,
              color: body.length > BODY_MAX ? 'error.main' : 'text.disabled',
              bgcolor: 'rgba(0,0,0,0.35)',
              borderRadius: 9999,
              px: 0.75,
              py: 0.15,
              lineHeight: 1.6,
              pointerEvents: 'none',
              transition: 'color 0.2s',
            }}
          >
            {body.length}/{BODY_MAX}
          </Typography>
        </Box>
        {bodyError && (
          <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mb: 2, ml: 0.5, fontSize: '0.75rem' }}>
            {bodyError}
          </Typography>
        )}

        <Divider sx={{ my: 2.5, borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* Tags Row */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, ml: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
            <Input
              placeholder="#tag1 #tag2..."
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              onKeyDown={handleTagsKeyDown}
              onBlur={handleTagsProcess}
              disableUnderline
              sx={{
                color: 'text.primary',
                fontSize: '0.85rem',
                border: tagError ? '1px solid #ef5350' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 1,
                px: 1,
                py: 0.5,
                width: '100%',
                transition: 'border 0.2s',
                '&:focus-within': {
                  border: tagError ? '1px solid #ef5350' : '1px solid rgba(179,136,255,0.5)',
                },
              }}
            />
          </Box>
          {tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.04)',
                    color: 'text.secondary',
                    fontSize: '0.8rem',
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
        {/* Attached Files List */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
          {attachments.map((file, index) => (
            <Chip
              key={index}
              icon={<ImageOutlinedIcon sx={{ fontSize: '1.1rem !important', color: 'text.secondary' }} />}
              label={file.name}
              onDelete={() => removeAttachment(index)}
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
          ))}
        </Box>
        {attachmentError && (
          <Typography color="error" variant="caption" sx={{ display: 'block', mb: 2, ml: 1 }}>
            {attachmentError}
          </Typography>
        )}
        <Divider sx={{ my: 2.5, borderColor: 'rgba(255,255,255,0.1)' }} />


        {/* Bottom Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="text"
            startIcon={<AttachFileRoundedIcon />}
            onClick={() => fileInputRef.current?.click()}
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
          <input
            type="file"
            multiple
            accept=".png,.jpg,.jpeg"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <Button
            variant="contained"
            startIcon={<SendRoundedIcon />}
            onClick={handleSubmit}
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
