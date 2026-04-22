export type OnboardingContextType = {
    fullName: string;
    setFullName: (name: string) => void;
    nickname: string;
    setNickname: (nickname: string) => void;
    photoUri: string | null;
    setPhotoUri: (uri: string | null) => void;
    nicknameTaken: boolean;
    isNicknameLoading: boolean;
    suggestions: string[];
    currentIndex: number;
    totalSteps: number;
    handleContinue: () => void;
    handleBack: () => void;
    handleFinish: () => void;
};