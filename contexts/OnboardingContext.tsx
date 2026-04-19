import { OnboardingContextType } from "@/types/onboardingContextType";
import { createContext, useState, type FC, type ReactNode } from "react";

type OnboardingProviderProps = {
  children: ReactNode;
  totalSteps: number;
}
export const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);
const OnboardingProvider: FC<OnboardingProviderProps> = ({ children, totalSteps }) => {
  //Hooks
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <OnboardingContext.Provider value={{ currentStep, setCurrentStep, totalSteps }}>
      {children}
    </OnboardingContext.Provider>
  );
};
export default OnboardingProvider;