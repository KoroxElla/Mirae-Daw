

/**
 * Decrypts encrypted journal text by calling the backend endpoint
 * @param encryptedToken - The encrypted text from the database
 * @returns Promise<string> - The decrypted text
 */
export const decryptText = async (encryptedToken: string): Promise<string> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/journal/decrypt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ encrypted: encryptedToken })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Decryption failed');
    }
    
    const data = await response.json();
    return data.decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return '[Unable to decrypt content]';
  }
};

/**
 * Checks if text appears to be encrypted (Fernet tokens start with 'gAAAAA')
 * @param text - The text to check
 * @returns boolean - True if the text appears encrypted
 */
export const isEncrypted = (text: string): boolean => {
  return typeof text === 'string' && text.length > 50 && text.includes('.');
};

/**
 * Optional: Batch decrypt multiple entries at once
 * Useful for loading multiple journal pages
 */
export const decryptBatch = async (encryptedTokens: string[]): Promise<Record<string, string>> => {
  const decryptedMap: Record<string, string> = {};
  
  await Promise.all(
    encryptedTokens.map(async (token) => {
      decryptedMap[token] = await decryptText(token);
    })
  );
  
  return decryptedMap;
};
