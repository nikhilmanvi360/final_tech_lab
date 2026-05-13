import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  User
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

/**
 * Maps a Team Identity to a Firebase Auth Account
 * We use a virtual email format: [team_name]@tt_os.com
 */
const getVirtualEmail = (teamName: string) => {
  const sanitized = teamName.toLowerCase().replace(/[^a-z0-9]/g, "_");
  return `${sanitized}@tt_os.com`;
};

export const authService = {
  /**
   * Logs in a team using Firebase Auth.
   * If the account doesn't exist, it attempts to create it (Auto-provisioning)
   */
  async loginTeam(teamName: string, password: string) {
    const email = getVirtualEmail(teamName);
    
    try {
      // 1. Try to sign in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      // 2. If user not found, try to create (Auto-provision for existing teams)
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          
          // Initialize team profile in Firestore
          await setDoc(doc(db, "teams", userCredential.user.uid), {
            name: teamName,
            role: "detective", // Default role
            score: 0,
            createdAt: new Date().toISOString()
          });
          
          return userCredential.user;
        } catch (createError) {
          throw error; // Throw original auth error if creation fails
        }
      }
      throw error;
    }
  },

  async logout() {
    return signOut(auth);
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  async getTeamProfile(uid: string) {
    const docRef = doc(db, "teams", uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  }
};
