import { supabase } from './supabase'
import type { FileNode } from '../store/editorStore'

export interface Project {
  id: string
  user_id: string
  name: string
  files: FileNode[]
  created_at: string
  updated_at: string
}

export async function listProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('id, user_id, name, created_at, updated_at')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function loadProject(id: string): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function saveProject(name: string, files: FileNode[], existingId?: string): Promise<Project> {
  if (existingId) {
    const { data, error } = await supabase
      .from('projects')
      .update({ name, files, updated_at: new Date().toISOString() })
      .eq('id', existingId)
      .select()
      .single()

    if (error) throw error
    return data
  } else {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('projects')
      .insert({ user_id: user.id, name, files })
      .select()
      .single()

    if (error) throw error
    return data
  }
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) throw error
}
