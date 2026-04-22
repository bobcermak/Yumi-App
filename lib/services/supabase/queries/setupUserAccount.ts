import supabase from "../client";

//GET
export const checkNicknameIfExists = async (username: string): Promise<boolean> => {
    const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username.trim())
        .limit(1);

    return !!data && data.length > 0;
}