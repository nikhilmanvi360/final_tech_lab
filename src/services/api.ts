import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { api as restApi } from "./restApi";

/**
 * Hybrid API that prioritizes Firebase (Firestore) for data persistence,
 * but falls back to the existing REST API if Firebase is unavailable
 * or for specific non-firebase endpoints.
 */
export const api = {
  async get<T = any>(endpoint: string, collectionName?: string, docId?: string): Promise<T> {
    if (collectionName && docId) {
      try {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data() as T;
        }
      } catch (e) {
        console.warn(`Firebase GET failed for ${collectionName}/${docId}, falling back to REST.`, e);
      }
    }
    return restApi.get<T>(endpoint);
  },

  async post<T = any>(endpoint: string, data: any, collectionName?: string, docId?: string): Promise<T> {
    if (collectionName && docId) {
      try {
        const docRef = doc(db, collectionName, docId);
        await setDoc(docRef, data, { merge: true });
        return { success: true, ...data } as unknown as T;
      } catch (e) {
        console.warn(`Firebase POST failed for ${collectionName}/${docId}, falling back to REST.`, e);
      }
    }
    return restApi.post<T>(endpoint, data);
  },

  async put<T = any>(endpoint: string, data: any, collectionName?: string, docId?: string): Promise<T> {
    if (collectionName && docId) {
      try {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, data);
        return { success: true, ...data } as unknown as T;
      } catch (e) {
        console.warn(`Firebase PUT failed for ${collectionName}/${docId}, falling back to REST.`, e);
      }
    }
    return restApi.put<T>(endpoint, data);
  },

  async delete<T = any>(endpoint: string, collectionName?: string, docId?: string): Promise<T> {
    if (collectionName && docId) {
      try {
        const docRef = doc(db, collectionName, docId);
        await deleteDoc(docRef);
        return { success: true } as unknown as T;
      } catch (e) {
        console.warn(`Firebase DELETE failed for ${collectionName}/${docId}, falling back to REST.`, e);
      }
    }
    return restApi.delete<T>(endpoint);
  }
};
