import { notifyError } from './notifications'

export const validateRequiredField = (e, fieldName, customValidator = null) => {
  const value = e.target.value
  const trimmedValue = typeof value === 'string' ? value.trim() : value

  if (customValidator) {
    const isValid = customValidator(trimmedValue)
    if (!isValid) {
      notifyError(`${fieldName} é obrigatório.`)
      e.target.setCustomValidity(`${fieldName} é obrigatório.`)
      return false
    }
    e.target.setCustomValidity('')
    return true
  }

  if (!trimmedValue || trimmedValue === '') {
    notifyError(`${fieldName} é obrigatório.`)
    e.target.setCustomValidity(`${fieldName} é obrigatório.`)
    return false
  }

  e.target.setCustomValidity('')
  return true
}

export const validateEmail = (e, checkDuplicate = false) => {
  const value = e.target.value.trim()

  if (!value) {
    notifyError('E-mail é obrigatório.')
    e.target.setCustomValidity('E-mail é obrigatório.')
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) {
    notifyError('Por favor, insira um e-mail válido.')
    e.target.setCustomValidity('Por favor, insira um e-mail válido.')
    return false
  }

  if (checkDuplicate) {
    const savedUsers = JSON.parse(localStorage.getItem('inclusivchat_users') || '[]')
    const emailExists = savedUsers.some(u => u.email.toLowerCase() === value.toLowerCase())

    if (emailExists) {
      notifyError('Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.')
      e.target.setCustomValidity('Este e-mail já está cadastrado.')
      return false
    }
  }

  e.target.setCustomValidity('')
  return true
}

export const validatePassword = (e, minLength = 6) => {
  const value = e.target.value

  if (!value) {
    notifyError('Senha é obrigatória.')
    e.target.setCustomValidity('Senha é obrigatória.')
    return false
  }

  if (value.length < minLength) {
    notifyError(`A senha deve ter pelo menos ${minLength} caracteres.`)
    e.target.setCustomValidity(`A senha deve ter pelo menos ${minLength} caracteres.`)
    return false
  }

  e.target.setCustomValidity('')
  return true
}

export const validateConfirmPassword = (e, password) => {
  const value = e.target.value

  if (!value) {
    notifyError('Confirmação de senha é obrigatória.')
    e.target.setCustomValidity('Confirmação de senha é obrigatória.')
    return false
  }

  if (value !== password) {
    notifyError('As senhas não coincidem.')
    e.target.setCustomValidity('As senhas não coincidem.')
    return false
  }

  e.target.setCustomValidity('')
  return true
}

export const validateSelect = (e, fieldName) => {
  const value = e.target.value

  if (!value || value === '') {
    notifyError(`${fieldName} é obrigatório.`)
    e.target.setCustomValidity(`${fieldName} é obrigatório.`)
    return false
  }

  e.target.setCustomValidity('')
  return true
}

export const validateTextarea = (e, fieldName, minLength = null) => {
  const value = e.target.value.trim()

  if (!value) {
    notifyError(`${fieldName} é obrigatório.`)
    e.target.setCustomValidity(`${fieldName} é obrigatório.`)
    return false
  }

  if (minLength && value.length < minLength) {
    notifyError(`${fieldName} deve ter pelo menos ${minLength} caracteres.`)
    e.target.setCustomValidity(`${fieldName} deve ter pelo menos ${minLength} caracteres.`)
    return false
  }

  e.target.setCustomValidity('')
  return true
}
