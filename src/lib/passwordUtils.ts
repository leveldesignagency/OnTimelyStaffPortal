// Secure password hashing utility for staff accounts
// Uses bcrypt for secure password hashing

import bcrypt from 'bcryptjs'

export const passwordUtils = {
  // Hash password using bcrypt
  // Salt rounds: 10 (good balance between security and performance)
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10
    return await bcrypt.hash(password, saltRounds)
  },

  // Synchronous version for server-side use
  hashPasswordSync(password: string): string {
    const saltRounds = 10
    return bcrypt.hashSync(password, saltRounds)
  },

  // Verify password against bcrypt hash
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash)
  },

  // Synchronous version for server-side use
  verifyPasswordSync(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash)
  },

  // Generate a secure random password
  generateSecurePassword(length: number = 12): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    
    // Ensure at least one character from each category
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)] // Uppercase
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)] // Lowercase
    password += '0123456789'[Math.floor(Math.random() * 10)] // Number
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)] // Special character
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)]
    }
    
    // Shuffle the password to make it more random
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }
}
