import React, { useState, useEffect } from 'react';
import { backend } from 'declarations/backend';
import { AppBar, Toolbar, Typography, Container, Grid, Card, CardMedia, CardContent, CardActions, IconButton, TextField, Button, CircularProgress } from '@mui/material';
import { Favorite, Comment, Add } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import Modal from 'react-modal';

type Photo = {
  id: bigint;
  title: string;
  category: string;
  url: string;
  likes: bigint;
  comments: Comment[];
  timestamp: bigint;
};

type Comment = {
  author: string | null;
  content: string;
  timestamp: bigint;
};

const App: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const result = await backend.getPhotos();
      setPhotos(result);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching photos:', error);
      setLoading(false);
    }
  };

  const handleLike = async (id: bigint) => {
    try {
      await backend.likePhoto(id);
      fetchPhotos();
    } catch (error) {
      console.error('Error liking photo:', error);
    }
  };

  const handleComment = async (id: bigint, content: string) => {
    try {
      await backend.addComment(id, content);
      fetchPhotos();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleAddPhoto = async (data: { title: string; category: string; url: string }) => {
    try {
      await backend.addPhoto(data.title, data.category, data.url);
      fetchPhotos();
      setModalIsOpen(false);
      reset();
    } catch (error) {
      console.error('Error adding photo:', error);
    }
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Pixel
          </Typography>
          <IconButton color="inherit" onClick={() => setModalIsOpen(true)}>
            <Add />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        {loading ? (
          <CircularProgress />
        ) : (
          <Grid container spacing={4}>
            {photos.map((photo) => (
              <Grid item xs={12} sm={6} md={4} key={Number(photo.id)}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={photo.url}
                    alt={photo.title}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {photo.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Category: {photo.category}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <IconButton onClick={() => handleLike(photo.id)}>
                      <Favorite color={Number(photo.likes) > 0 ? 'error' : 'inherit'} />
                    </IconButton>
                    <Typography>{Number(photo.likes)}</Typography>
                    <IconButton>
                      <Comment />
                    </IconButton>
                    <Typography>{photo.comments.length}</Typography>
                  </CardActions>
                  <CardContent>
                    {photo.comments.map((comment, index) => (
                      <Typography key={index} variant="body2">
                        {comment.content}
                      </Typography>
                    ))}
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Add a comment"
                      size="small"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleComment(photo.id, (e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '500px',
            width: '100%',
          },
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          Add New Photo
        </Typography>
        <form onSubmit={handleSubmit(handleAddPhoto)}>
          <TextField
            {...register('title', { required: true })}
            fullWidth
            label="Title"
            margin="normal"
          />
          <TextField
            {...register('category', { required: true })}
            fullWidth
            label="Category"
            margin="normal"
          />
          <TextField
            {...register('url', { required: true })}
            fullWidth
            label="Image URL"
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Add Photo
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default App;
