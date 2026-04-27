import { Barbell, Bed, PersonSimpleRun, PersonSimpleWalk, Fire, Icon } from "phosphor-react-native";

export type ActivityLevelType = {
    id: string;
    title: string;
    description: string;
    icon: Icon;
    color: string;
}
export const ACTIVITY_LEVELS: ActivityLevelType[] = [
    {
        id: "sedentary",
        title: "Sedentary",
        description: "Little or no exercise, desk job",
        icon: Bed,
        color: "#94A3B8"
    },
    {
        id: "light",
        title: "Lightly Active",
        description: "Light exercise 1-3 days/week",
        icon: PersonSimpleWalk,
        color: "#C5E384"
    },
    {
        id: "moderate",
        title: "Moderately Active",
        description: "Moderate exercise 3-5 days/week",
        icon: PersonSimpleRun,
        color: "#D5BA24"
    },
    {
        id: "very",
        title: "Very Active",
        description: "Hard exercise 6-7 days/week",
        icon: Barbell,
        color: "#ED8936"
    },
    {
        id: "extra",
        title: "Extra Active",
        description: "Very hard exercise & physical job",
        icon: Fire,
        color: "#E53E3E"
    }
];
export const ACTIVITY_MULTIPLIERS: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very: 1.725,
    extra: 1.9
};