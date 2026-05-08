import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';

export interface Project {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  createdAt: any;
}

export const createProject = async (title: string, description: string) => {
  if (!auth.currentUser) throw new Error("User not authenticated");
  
  const projectRef = collection(db, 'projects');
  return await addDoc(projectRef, {
    title,
    description,
    ownerId: auth.currentUser.uid,
    createdAt: serverTimestamp(),
  });
};

export const getUserProjects = async () => {
  if (!auth.currentUser) return [];
  
  const q = query(
    collection(db, 'projects'),
    where('ownerId', '==', auth.currentUser.uid),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
};
