export type OnboardingContextType = {
    currentStep: number;
    setCurrentStep: (step: number) => void;
    totalSteps: number;
};