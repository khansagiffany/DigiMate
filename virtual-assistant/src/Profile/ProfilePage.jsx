import React, { useState, useEffect, useRef } from 'react';
import './ProfilePage.css';

const API_URL = 'http://localhost:5000';

const ProfilePage = () => {
    const [profile, setProfile] = useState({
        name: '',
        age: '',
        role: '',
        photo: '/profile.jpg'
    });
    const [isEditing, setIsEditing] = useState(false);
    const [tempProfile, setTempProfile] = useState({
        name: '',
        age: '',
        role: '',
        photo: '/profile.jpg'
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch(`${API_URL}/api/profile`);
            if (!response.ok) throw new Error('Failed to fetch profile');
            const data = await response.json();
            setProfile(data);
            setTempProfile({
                name: '',
                age: '',
                role: '',
                photo: data.photo
            });
            setIsLoading(false);
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    const handlePhotoClick = () => {
        fileInputRef.current.click();
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const formData = new FormData();
                formData.append('photo', file);

                const response = await fetch(`${API_URL}/api/profile/photo`, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) throw new Error('Failed to upload photo');
                
                const data = await response.json();
                setTempProfile({ ...tempProfile, photo: data.photo });
                
            } catch (err) {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const base64Response = await fetch(`${API_URL}/api/profile/photo/base64`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                photo: e.target.result
                            }),
                        });

                        if (!base64Response.ok) throw new Error('Failed to upload photo');
                        
                        const data = await base64Response.json();
                        setTempProfile({ ...tempProfile, photo: data.photo });
                    } catch (error) {
                        setError('Failed to upload photo: ' + error.message);
                    }
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleEditClick = () => {
        setTempProfile({
            name: '',
            age: '',
            role: '',
            photo: profile.photo
        });
        setIsEditing(true);
    };

    const handleSave = async () => {
        try {
            setIsLoading(true);

            const dataToUpdate = {
                name: tempProfile.name || profile.name,
                age: tempProfile.age || profile.age,
                role: tempProfile.role || profile.role,
                photo: tempProfile.photo
            };

            const profileResponse = await fetch(`${API_URL}/api/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToUpdate),
            });

            if (!profileResponse.ok) throw new Error('Failed to update profile');

            await fetchProfile();
            setIsEditing(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    return (
        <div className="profile-page">
            <header>
                <div className="title">DigiMate: Your Internship Companion</div>
            </header>

            <div className="profile-content">
                <div className="profile-header">
                    <div className="profile-photo" onClick={handlePhotoClick}>
                        <img 
                            src={tempProfile.photo.startsWith('/uploads') 
                                ? `${API_URL}${tempProfile.photo}` 
                                : tempProfile.photo} 
                            alt="Profile" 
                        />
                        {isEditing && <div className="photo-overlay">Change Photo</div>}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePhotoChange}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />
                    
                    {isEditing ? (
                        <div className="profile-info-edit">
                            <input
                                type="text"
                                value={tempProfile.name}
                                onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})}
                                placeholder="your name"
                            />
                            <input
                                type="text"
                                value={tempProfile.age}
                                onChange={(e) => setTempProfile({...tempProfile, age: e.target.value})}
                                placeholder="your age"
                            />
                            <input
                                type="text"
                                value={tempProfile.role}
                                onChange={(e) => setTempProfile({...tempProfile, role: e.target.value})}
                                placeholder="your role"
                            />
                            <div className="edit-buttons">
                                <button onClick={handleSave} disabled={isLoading}>
                                    {isLoading ? 'Saving...' : 'Save'}
                                </button>
                                <button 
                                    onClick={() => {
                                        setTempProfile(profile);
                                        setIsEditing(false);
                                    }}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="profile-info">
                            <h2>{profile.name || 'Name'}</h2>
                            <p>{profile.age || 'Age'}</p>
                            <p>{profile.role || 'Role'}</p>
                            <button onClick={handleEditClick}>Edit Profile</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;