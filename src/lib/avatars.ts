/** 
 * Professional 'Official' Avatars.
 * Uses clean initials on a sophisticated, medical-themed color palette.
 * Provides a high-end corporate feel suitable for healthcare professionals.
 */
export const getClayAvatar = (userId: string, gender?: 'male' | 'female', name?: string) => {
    // Professional Medical/Corporate Palette (Trust-inspiring, deep shades)
    const professionalBgs = [
        '0f172a', // Slate 900 (Deep Navy)
        '1e293b', // Slate 800
        '334155', // Slate 700
        '4338ca', // Indigo 700
        '065f46', // Emerald 800
        '115e59', // Teal 800
        '1e40af', // Blue 800
    ];

    const seed = name || userId;
    const seedNum = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const bgColor = professionalBgs[seedNum % professionalBgs.length];

    // 'Initials' is the gold standard for professional/official apps (like Slack, AmbitionBox, Microsoft Teams).
    const style = 'initials';
    
    // Using a clean, bold sans-serif font and subtle rounding (radius 10) for a premium look.
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${bgColor}&fontFamily=Arial,sans-serif&fontSize=45&fontWeight=700&chars=1&radius=10&textColor=ffffff`;
};
