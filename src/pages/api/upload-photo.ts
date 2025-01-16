import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the file from the request
    const file = req.files?.photo;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .upload(`${userId}/${file.name}`, file);

    if (error) throw error;

    // Update user profile in database
    const { error: updateError } = await supabase
      .from('users')
      .update({ profile_picture: data.publicUrl })
      .eq('id', userId);

    if (updateError) throw updateError;

    return res.status(200).json({ url: data.publicUrl });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Error uploading file' });
  }
} 