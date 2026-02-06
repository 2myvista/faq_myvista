// src/utils/base64.ts
export function decodeBase64(base64String: string): string {
  try {
    // Браузерный способ
    const binaryString = atob(base64String)
    
    // Декодируем UTF-8
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    
    return new TextDecoder('utf-8').decode(bytes)
  } catch (error) {
    console.error('Error decoding base64:', error)
    
    // Fallback для старых браузеров
    try {
      return decodeURIComponent(escape(atob(base64String)))
    } catch {
      return ''
    }
  }
}