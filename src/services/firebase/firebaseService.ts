import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Task } from '../../types';

class FirebaseService {
  // Authentication
  async signUp(
    email: string,
    password: string,
  ): Promise<FirebaseAuthTypes.UserCredential> {
    return await auth().createUserWithEmailAndPassword(email, password);
  }

  async signIn(
    email: string,
    password: string,
  ): Promise<FirebaseAuthTypes.UserCredential> {
    return await auth().signInWithEmailAndPassword(email, password);
  }

  async signOut(): Promise<void> {
    return await auth().signOut();
  }

  getCurrentUser(): FirebaseAuthTypes.User | null {
    return auth().currentUser;
  }

  onAuthStateChanged(
    callback: (user: FirebaseAuthTypes.User | null) => void,
  ): () => void {
    return auth().onAuthStateChanged(callback);
  }

  // Firestore - Tasks
  async syncTaskToFirestore(task: Task): Promise<void> {
    const userId = this.getCurrentUser()?.uid;
    if (!userId) throw new Error('User not authenticated');

    await firestore()
      .collection('users')
      .doc(userId)
      .collection('tasks')
      .doc(task.id)
      .set({
        title: task.title,
        description: task.description || null,
        completed: task.completed,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        dueDate: task.dueDate || null,
        reminderTime: task.reminderTime || null,
      });
  }

  async fetchTasksFromFirestore(): Promise<Task[]> {
    const userId = this.getCurrentUser()?.uid;
    if (!userId) throw new Error('User not authenticated');

    const snapshot = await firestore()
      .collection('users')
      .doc(userId)
      .collection('tasks')
      .get();

    return snapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          userId,
          ...doc.data(),
          synced: true,
        } as Task),
    );
  }

  async deleteTaskFromFirestore(taskId: string): Promise<void> {
    const userId = this.getCurrentUser()?.uid;
    if (!userId) throw new Error('User not authenticated');

    await firestore()
      .collection('users')
      .doc(userId)
      .collection('tasks')
      .doc(taskId)
      .delete();
  }

  listenToTasks(
    callback: (tasks: Task[]) => void,
    onError: (error: Error) => void,
  ): () => void {
    const userId = this.getCurrentUser()?.uid;
    if (!userId) {
      onError(new Error('User not authenticated'));
      return () => {};
    }

    return firestore()
      .collection('users')
      .doc(userId)
      .collection('tasks')
      .onSnapshot(
        snapshot => {
          const tasks = snapshot.docs.map(
            doc =>
              ({
                id: doc.id,
                userId,
                ...doc.data(),
                synced: true,
              } as Task),
          );
          callback(tasks);
        },
        error => onError(error),
      );
  }
}

export const firebaseService = new FirebaseService();
