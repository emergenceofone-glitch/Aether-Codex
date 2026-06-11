import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

export type ProjectStatus = 'Active' | 'In-Progress' | 'Archived';

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  ownerId: string;
  createdAt: any;
}

export const createProject = async (title: string, description: string, status: ProjectStatus = 'In-Progress') => {
  if (!auth.currentUser) throw new Error("User not authenticated");
  
  const projectRef = collection(db, 'projects');
  return await addDoc(projectRef, {
    title,
    description,
    status,
    ownerId: auth.currentUser.uid,
    createdAt: serverTimestamp(),
  });
};

export const updateProjectStatus = async (projectId: string, status: ProjectStatus) => {
  if (!auth.currentUser) throw new Error("User not authenticated");
  
  const projectDoc = doc(db, 'projects', projectId);
  return await updateDoc(projectDoc, {
    status
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
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      description: data.description,
      status: data.status || 'Active', // Default status for existing projects
      ownerId: data.ownerId,
      createdAt: data.createdAt
    } as Project;
  });
};
