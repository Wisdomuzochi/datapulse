import axios from 'axios'

// En local → API sur localhost:8000
// En prod  → variable d'environnement injectée par Docker
const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

/**
 * Récupère tous les records traités avec filtres optionnels
 */
export const getResults = async (params = {}) => {
  const response = await api.get('/api/v1/results', { params })
  return response.data
}

/**
 * Ingère un nouveau texte dans le pipeline
 */
export const ingestText = async (sourceName, text) => {
  const response = await api.post('/api/v1/ingest', {
    source_name: sourceName,
    text,
  })
  return response.data
}

/**
 * Vérifie la santé de l'API
 */
export const getHealth = async () => {
  const response = await api.get('/api/v1/health')
  return response.data
}