/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Avatar, Grid, Typography, IconButton, TextField, Button, MenuItem } from '@mui/material';
import { Edit } from '@mui/icons-material';

const ProfileDetails = ({ userData, editMode, onEditClick, onSaveClick,setEditMode }) => {
  const [editedUserData, setEditedUserData] = useState({ ...userData });
  const [imageUrl,setImageUrl] = useState(editedUserData.profilePic)
  const [backupImageUrl,setBackupImageUrl] = useState(imageUrl)

  const onInputChange = (field, value) => {
    setEditedUserData({ ...editedUserData, [field]: value });
  };
  const handleSave = () => {
    onSaveClick(editedUserData);
  };

  const handleImageChange = (e) =>{
    setBackupImageUrl(imageUrl)
    setImageUrl(URL.createObjectURL(e.target.files[0]))
    onInputChange('profilePic', e.target.files[0])
  }

  const handleCancel = () => {
    setEditedUserData({ ...userData }); 
    setImageUrl(backupImageUrl)
    setEditMode(false)
  };

  return (
    <Grid container spacing={2} alignItems="center" style={{ margin: '10px' }}>
      <Grid item>
        <Avatar src={ imageUrl || 'https://via.placeholder.com/150'} alt="Profile Picture" sx={{ width: 100, height: 100 }} />
        {editMode && (
          <>
          <input type="file" accept="image/*" onChange={(e) => handleImageChange(e)} style={{ display: 'none' }} id="profile-pic-input" />
          <label htmlFor="profile-pic-input">
          <Button variant="outlined" component="span" size="small" sx={{ color: 'rgba(0, 0, 0, 0.54)', border: '1px solid rgba(0, 0, 0, 0.13)', marginTop: '10px', fontSize:'small'}}>Upload</Button>
          </label>
        </>
        )}
      </Grid>
      <Grid item xs={12} sm container>
        <Grid item xs container direction="column" spacing={2}>
          <Grid item>
            <Typography variant="h4">{`${editedUserData.fname} ${editedUserData.lname}`}</Typography>
          </Grid>
          <Grid item>
            {editMode ? (
              <TextField
                label="Date of Birth"
                type="date"
                value={editedUserData.dateOfBirth}
                onChange={(e) => onInputChange('dateOfBirth', e.target.value)}
              />
            ) : (
              <Typography variant="body1" style={{ color: '#4CAF50', fontWeight: 'bold' }}>Date of Birth: {editedUserData.dateOfBirth}</Typography>
            )}
          </Grid>
          <Grid item>
            <Typography variant="body1" style={{ color: '#4CAF50', fontWeight: 'bold' }}>Email: {editedUserData.email}</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        {editMode ? (
          <>
          <Button variant="contained" onClick={() => onSaveClick(editedUserData)} sx={{ marginRight: '5px' }}>Save</Button>
          <Button variant="contained" color="error" onClick={handleCancel}>Cancel</Button>
          </>

        ) : (

          <Button variant="contained" color="success" onClick={onEditClick}>Edit</Button>
        )}
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h5">Contact Information</Typography>
      </Grid>
      <Grid item xs={12} container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Mobile Number"
            value={editedUserData.mobileNumber}
            disabled={!editMode}
            onChange={(e) => onInputChange('mobileNumber', e.target.value)}
            InputProps={{
              style: {
                color: editMode ? '#000' : '#4CAF50',
                fontWeight: 'bold',
                backgroundColor: editMode ? '#fff' : 'rgba(76, 175, 80, 0.05)',
                width: '175px',
              },
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Address"
            value={editedUserData.address}
            disabled={!editMode}
            onChange={(e) => onInputChange('address', e.target.value)}
            InputProps={{
              style: {
                color: editMode ? '#000' : '#4CAF50',
                fontWeight: 'bold',
                backgroundColor: editMode ? '#fff' : 'rgba(76, 175, 80, 0.05)',
                width: '350px',
              },
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="LinkedIn"
            value={editedUserData.linkedin}
            disabled={!editMode}
            onChange={(e) => onInputChange('linkedin', e.target.value)}
            InputProps={{
              style: {
                color: editMode ? '#000' : '#4CAF50',
                fontWeight: 'bold',
                backgroundColor: editMode ? '#fff' : 'rgba(76, 175, 80, 0.05)',
                width: '375px',
              },
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="GitHub"
            value={editedUserData.github}
            disabled={!editMode}
            onChange={(e) => onInputChange('github', e.target.value)}
            InputProps={{
              style: {
                color: editMode ? '#000' : '#4CAF50',
                fontWeight: 'bold',
                backgroundColor: editMode ? '#fff' : 'rgba(76, 175, 80, 0.05)',
                width: '350px',
              },
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            select
            label="Language"
            value={editedUserData.language}
            disabled={!editMode}
            onChange={(e) => onInputChange('language', e.target.value)}
            InputProps={{
              style: {
                color: editMode ? '#000' : '#4CAF50',
                fontWeight: 'bold',
                backgroundColor: editMode ? '#fff' : 'rgba(76, 175, 80, 0.05)',
                width: '150px',
              },
            }}
          >
            <MenuItem value="English">English</MenuItem>
            <MenuItem value="Spanish">Spanish</MenuItem>
            <MenuItem value="French">French</MenuItem>
          </TextField>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ProfileDetails;
