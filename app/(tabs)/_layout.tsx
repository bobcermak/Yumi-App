import { Tabs } from "expo-router";
import { TabIcon } from "@/components";

const _Layout = () => {
  return (
    <Tabs
      tabBar={(props) => <TabIcon {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }}/>
      <Tabs.Screen name="search" options={{ title: "Search" }}/>
      <Tabs.Screen name="add-food" options={{ title: "Add Food" }}/>
      <Tabs.Screen name="groups" options={{ title: "Groups" }}/>
      <Tabs.Screen name="profile" options={{ title: "Profile" }}/>
    </Tabs>
  );
};
export default _Layout;