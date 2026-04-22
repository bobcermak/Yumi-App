export const generateSuggestions = (nickname: string): string[] => {
    if (!nickname.trim()) return [];
    const base = nickname.trim();
    const random1 = Math.floor(Math.random() * 99) + 1;
    const random2 = Math.floor(Math.random() * 999) + 100;
    return [`${base}_${random1}`, `${base}${random2}`, `${base}_yumi`];
};