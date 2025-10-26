// src/utils/seedInstructors.js
import { firestoreService } from '@/services/firestoreService'

export const seedInstructors = async () => {
  const instructors = [
    {
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@engage360.com',
      specialization: 'Mental Health Counseling',
      bio: 'Licensed psychologist with 10+ years experience in cognitive behavioral therapy.',
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      rating: 4.9,
      experience: '10 years'
    },
    {
      name: 'Michael Chen',
      email: 'michael.chen@engage360.com',
      specialization: 'Physical Therapy',
      bio: 'Certified physical therapist specializing in rehabilitation and injury prevention.',
      availability: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
      rating: 4.8,
      experience: '8 years'
    },
    {
      name: 'Dr. Emily Rodriguez',
      email: 'emily.rodriguez@engage360.com',
      specialization: 'Nutrition Counseling',
      bio: 'Registered dietitian with expertise in chronic disease management and wellness.',
      availability: ['Tuesday', 'Thursday', 'Saturday'],
      rating: 4.7,
      experience: '6 years'
    },
    {
      name: 'James Wilson',
      email: 'james.wilson@engage360.com',
      specialization: 'Fitness Training',
      bio: 'Certified personal trainer focused on strength training and mobility.',
      availability: ['Monday', 'Tuesday', 'Thursday', 'Friday', 'Sunday'],
      rating: 4.6,
      experience: '5 years'
    },
    {
      name: 'Dr. Lisa Thompson',
      email: 'lisa.thompson@engage360.com',
      specialization: 'Stress Management',
      bio: 'Mindfulness coach and stress management specialist.',
      availability: ['Monday', 'Wednesday', 'Friday'],
      rating: 4.9,
      experience: '12 years'
    }
  ]

  try {
    console.log('Seeding instructors...')
    
    // Check if instructors already exist
    const existingInstructors = await firestoreService.getAllInstructors()
    if (existingInstructors.length > 0) {
      console.log('Instructors already exist, skipping seed.')
      return existingInstructors
    }

    // Create instructors
    const createdInstructors = []
    for (const instructor of instructors) {
      try {
        const instructorId = await firestoreService.createInstructor(instructor)
        createdInstructors.push({ id: instructorId, ...instructor })
        console.log(`Created instructor: ${instructor.name}`)
      } catch (error) {
        console.error(`Error creating instructor ${instructor.name}:`, error)
      }
    }

    console.log(`Successfully seeded ${createdInstructors.length} instructors`)
    return createdInstructors
  } catch (error) {
    console.error('Error seeding instructors:', error)
    throw error
  }
}

// Helper function to create instructor (if not already in firestoreService)
export const createInstructor = async (instructorData) => {
  try {
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
    const { db } = await import('@/firebase/config')
    
    const docRef = await addDoc(collection(db, 'instructors'), {
      ...instructorData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating instructor:', error)
    throw error
  }
}
