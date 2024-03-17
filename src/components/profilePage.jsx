import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import ProfileDetails from './ProfileDetails';
import TodoInsights from './TodoInsights';
import History from './History';
import { db,auth,storage } from '../firebase/firebase';
import { getDocs,collection,where,query,updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const ProfilePage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);


  
  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleSaveClick = (editedUserData) => {
    setEditMode(false);
    const userQuery = query(collection(db, 'users'), where('uid', '==', auth.currentUser.uid));
  
    getDocs(userQuery)
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const userDocRef = doc.ref;
          const updatedUserData = { ...doc.data(), ...editedUserData };
          delete updatedUserData.id;

          if (editedUserData.profilePic instanceof File) { 
            const storageRef = ref(storage, `profilePictures/${auth.currentUser.uid}`);
            uploadBytes(storageRef, editedUserData.profilePic)
              .then((snapshot) => {
                getDownloadURL(snapshot.ref)
                  .then((url) => {
                    const updatedUserDataWithProfilePicURL = { ...updatedUserData, profilePic: url };
                    updateDoc(userDocRef, updatedUserDataWithProfilePicURL)
                      .then(() => {
                        setUserData(updatedUserDataWithProfilePicURL);
                      })
                      .catch((error) => {
                        console.error('Error updating profile picture URL in Firestore:', error);
                      });
                  })
                  .catch((error) => {
                    console.error('Error getting download URL:', error);
                  });
              })
              .catch((error) => {
                console.error('Error uploading profile picture:', error);
              });
          } else {
            updateDoc(userDocRef, updatedUserData)
              .then(() => {
                setUserData(updatedUserData);
              })
              .catch((error) => {
                console.error('Error updating document:', error);
              });
          }
        });
      })
      .catch((error) => {
        console.log('Error getting documents:', error);
      });
  };
  
  

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const usersRef = collection(db, 'users');
        const queryRef = query(usersRef, where('email', '==', user.email));
        await getDocs(queryRef)
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              setUserData(doc.data());
            });
          })
          .catch((error) => {
            console.log('Error getting documents:', error);
          });
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);
  return (
    <Box sx={{ width: '100%', typography: 'body1', marginTop: '20px' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={(event, newValue) => setTabValue(newValue)}
          aria-label="Profile tabs"
          variant="fullWidth"
        >
          <Tab label="Profile Details" />
          <Tab label="Todo Insights" />
          <Tab label="History" />
        </Tabs>
      </Box>
      {userData  && tabValue === 0 && (
        <ProfileDetails
          userData={userData}
          editMode={editMode}
          onEditClick={handleEditClick}
          onSaveClick={handleSaveClick}
          setEditMode={setEditMode}
        />
      )}
      {tabValue === 1 && <TodoInsights />}
      {tabValue === 2 && <History />}
    </Box>
  );
};

export default ProfilePage;
