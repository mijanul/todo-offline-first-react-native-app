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

    const taskData = {
      title: task.title,
      description: task.description || null,
      completed: task.completed,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      dueDate: task.dueDate || null,
      reminderTime: task.reminderTime || null,
    };

    console.log('🔄 Syncing task to Firestore:');
    console.log('  User ID:', userId);
    console.log('  Task ID:', task.id);
    console.log('  Task Data:', JSON.stringify(taskData, null, 2));

    await firestore()
      .collection('users')
      .doc(userId)
      .collection('tasks')
      .doc(task.id)
      .set(taskData);

    console.log('✅ Task synced successfully to Firestore!');
  }

  async fetchTasksFromFirestore(): Promise<Task[]> {
    const userId = this.getCurrentUser()?.uid;
    if (!userId) throw new Error('User not authenticated');
    console.log('Fetching tasks for user:', userId);

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
    
    console.log('🗑️ Deleting task from Firestore:');
    console.log('  User ID:', userId);
    console.log('  Task ID:', taskId);

    await firestore()
      .collection('users')
      .doc(userId)
      .collection('tasks')
      .doc(taskId)
      .delete();
      
    console.log('✅ Task deleted from Firestore successfully!');
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
    console.log('Listening to tasks for user:', userId);

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
