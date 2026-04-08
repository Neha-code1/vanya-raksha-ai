import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth';

const firebaseConfig = {
    apiKey:            "AIzaSyC7TiYwxVhnq68IRW8LpKtzv_CUYzTVdiY",
    authDomain:        "vanya-raksha-ai.firebaseapp.com",
    projectId:         "vanya-raksha-ai",
    storageBucket:     "vanya-raksha-ai.firebasestorage.app",
    messagingSenderId: "481619239259",
    appId:             "1:481619239259:web:8ab3fb9556e69e6f6dfa7e",
};

const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user,    setUser]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');

    useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
    });
    return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
    setError('');
    try {
        await signInWithPopup(auth, provider);
    } catch (err) {
        setError(getFriendlyError(err.code));
        throw err;
    }
    };

    const logOut = async () => {
    setError('');
    try {
        await signOut(auth);
    } catch {
        setError('Sign-out failed. Please try again.');
    }
 };

    const clearError = () => setError('');

    return (
    <AuthContext.Provider value={{ user, loading, error, signInWithGoogle, logOut, clearError }}>
        {children}
    </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used inside AuthProvider');
    return context;
};

const getFriendlyError = (code) => {
    const messages = {
    'auth/popup-closed-by-user':                     'Sign-in popup was closed. Please try again.',
    'auth/network-request-failed':                   'No internet connection. Check your network.',
    'auth/popup-blocked':                            'Popup blocked. Allow popups for this site.',
    'auth/cancelled-popup-request':                  'Another sign-in is already in progress.',
    'auth/account-exists-with-different-credential': 'This email is linked to a different sign-in method.',
    'auth/invalid-api-key':                          'Invalid Firebase API key. Check your config.',
    'auth/operation-not-allowed':                    'Google sign-in not enabled. Check Firebase Console.',
    'auth/unauthorized-domain':                      'This domain is not authorized. Add it in Firebase Console.',
    };
    return messages[code] || 'Something went wrong. Please try again.';
};